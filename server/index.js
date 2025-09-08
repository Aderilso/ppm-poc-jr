import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import os from 'os';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve um caminho de arquivo de uma URL sqlite do Prisma (file:...)
function resolveSqlitePath(dbUrl) {
  if (!dbUrl || !dbUrl.startsWith('file:')) return null;
  let p = dbUrl.replace(/^file:/, '');
  // Se for relativo, resolva a partir do diretório do servidor
  if (!path.isAbsolute(p)) p = path.join(__dirname, p);
  return p;
}

// Verifica se conseguimos escrever no arquivo/diretório
function canWrite(targetPath) {
  try {
    fs.accessSync(targetPath, fs.constants.W_OK);
    return true;
  } catch (_) {
    return false;
  }
}

function dirWriteTest(dir) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = path.join(dir, `.write-test-${Date.now()}.tmp`);
    fs.writeFileSync(tmp, 'ok');
    fs.unlinkSync(tmp);
    return true;
  } catch (_) {
    return false;
  }
}

// Forçar uso do DB no diretório do usuário (~/.ppm-data/dev.db), ignorando .env
function forceUserDatabaseUrl() {
  const homeDir = os.homedir() || __dirname;
  const userDataDir = path.join(homeDir, '.ppm-data');
  const dbFile = path.join(userDataDir, 'dev.db');

  // 1) Tentar pasta do usuário
  if (dirWriteTest(userDataDir)) {
    try {
      if (fs.existsSync(dbFile) && !canWrite(dbFile)) {
        try { fs.chmodSync(dbFile, 0o600); } catch (_) {}
      }
    } catch (_) {}
    const url = `file:${dbFile}`;
    process.env.DATABASE_URL = url;
    console.log('🔧 DATABASE_URL forçado para (usuário):', url);
    return url;
  }

  // 2) Fallback para diretório temporário do sistema
  const tmpRoot = path.join(os.tmpdir(), 'ppm-data');
  const tmpDb = path.join(tmpRoot, 'dev.db');
  if (dirWriteTest(tmpRoot)) {
    const url = `file:${tmpDb}`;
    process.env.DATABASE_URL = url;
    console.log('🔧 DATABASE_URL forçado para (temporário):', url);
    return url;
  }

  // 3) Último recurso: manter ~/.ppm-data mesmo sem write test (irá falhar e será evidente no /api/debug/dbinfo)
  const url = `file:${dbFile}`;
  process.env.DATABASE_URL = url;
  console.warn('⚠️ Nenhum diretório gravável encontrado; usando mesmo assim:', url);
  return url;
}

// Se DATABASE_URL já estiver definido no ambiente (ex.: via scripts ou .env), respeite-o;
// caso contrário, force um caminho gravável do usuário/TEMP.
let finalDbUrl = process.env.DATABASE_URL;
if (!finalDbUrl) {
  finalDbUrl = forceUserDatabaseUrl();
} else {
  // Se veio do ambiente, ainda assim tente validar e, se impossível, caia para TMP
  const filePath = resolveSqlitePath(finalDbUrl);
  try {
    const dir = path.dirname(filePath);
    if (!dir || !fs.existsSync(dir) || !canWrite(dir)) {
      console.warn('⚠️ DATABASE_URL não aponta para diretório gravável. Usando fallback. URL:', finalDbUrl);
      finalDbUrl = forceUserDatabaseUrl();
    }
  } catch (_) {
    console.warn('⚠️ Falha ao validar DATABASE_URL. Usando fallback. URL:', finalDbUrl);
    finalDbUrl = forceUserDatabaseUrl();
  }
  process.env.DATABASE_URL = finalDbUrl;
}
console.log('🗺️ Server startup paths:', { cwd: process.cwd(), dirname: __dirname, DATABASE_URL: finalDbUrl });
const prisma = new PrismaClient();

// Gera próximo código de entrevista no formato EN### (EN001, EN002, ...)
async function generateNextInterviewCode() {
  try {
    // Busca maior número já usado (baseado no sufixo numérico do código)
    const rows = await prisma.$queryRawUnsafe(
      "SELECT code FROM interviews WHERE code LIKE 'EN%' ORDER BY CAST(substr(code, 3) AS INTEGER) DESC LIMIT 1"
    );
    let next = 1;
    if (Array.isArray(rows) && rows.length > 0 && rows[0]?.code) {
      const current = parseInt(String(rows[0].code).replace(/^EN/i, ''), 10);
      if (!isNaN(current)) next = current + 1;
    }
    const padded = String(next).padStart(3, '0');
    return `EN${padded}`;
  } catch (_) {
    // Fallback: baseado no count (não perfeito, mas suficiente em baixa concorrência)
    const count = await prisma.interview.count();
    return `EN${String(count + 1).padStart(3, '0')}`;
  }
}
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Garantir coluna/índice 'code' e realizar backfill automático (idempotente)
async function ensureCodeColumnAndIndex() {
  try {
    const columns = await prisma.$queryRawUnsafe('PRAGMA table_info("interviews")');
    const hasCode = Array.isArray(columns) && columns.some((c) => c?.name === 'code');
    if (!hasCode) {
      console.log('➕ Adicionando coluna "code" em interviews...');
      await prisma.$executeRawUnsafe('ALTER TABLE "interviews" ADD COLUMN "code" TEXT');
    }
    console.log('➕ Garantindo índice único parcial em "code" (se não existir)...');
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "Interview_code_key" ON "interviews"("code") WHERE "code" IS NOT NULL');
  } catch (e) {
    console.warn('⚠️ ensureCodeColumnAndIndex: falha ao garantir coluna/índice:', e?.message || e);
  }
}

async function backfillMissingCodes() {
  try {
    const missing = await prisma.interview.findMany({ where: { code: null }, orderBy: { createdAt: 'asc' }, select: { id: true } });
    if (!missing.length) return;
    console.log(`🔧 Backfill de códigos EN pendentes: ${missing.length}`);
    for (const it of missing) {
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const code = await generateNextInterviewCode();
          await prisma.interview.update({ where: { id: it.id }, data: { code } });
          console.log(`✔️ ${it.id.substring(0,8)}... -> ${code}`);
          break;
        } catch (e) {
          if (e?.code === 'P2002') continue; // tentar outro código
          console.warn('⚠️ backfill code falhou:', e?.message || e);
          break;
        }
      }
    }
  } catch (e) {
    console.warn('⚠️ backfillMissingCodes: erro:', e?.message || e);
  }
}

(async () => {
  await ensureCodeColumnAndIndex();
  await backfillMissingCodes();
})();

// Rotas para Entrevistas
app.post('/api/interviews', async (req, res) => {
  try {
    console.log('📝 POST /api/interviews - Dados recebidos:', req.body);
    const body = req.body || {};

    // Sanitizar e normalizar entrada para evitar valores undefined/strings indevidas
    const isInterviewer = typeof body.isInterviewer === 'boolean' ? body.isInterviewer : false;
    const interviewerName = typeof body.interviewerName === 'string' ? body.interviewerName.trim() : undefined;
    const respondentName = typeof body.respondentName === 'string' ? body.respondentName.trim() : undefined;
    const respondentDepartment = typeof body.respondentDepartment === 'string' ? body.respondentDepartment.trim() : undefined;
    const createdAt = body.createdAt;

    console.log('🔍 Dados extraídos (sanitizados):', { isInterviewer, interviewerName, respondentName, respondentDepartment });

    // Avisar sobre metadados incompletos quando marcado como entrevistador
    if (isInterviewer && (!interviewerName || !respondentName || !respondentDepartment)) {
      console.log('⚠️ AVISO: Entrevistador marcado mas dados incompletos:', {
        isInterviewer,
        hasInterviewerName: !!interviewerName,
        hasRespondentName: !!respondentName,
        hasDepartment: !!respondentDepartment
      });
    }

    // Montar payload apenas com campos definidos
    const dataToSave = { isInterviewer };
    if (interviewerName) dataToSave.interviewerName = interviewerName;
    if (respondentName) dataToSave.respondentName = respondentName;
    if (respondentDepartment) dataToSave.respondentDepartment = respondentDepartment;

    // createdAt opcional (ex.: importações)
    if (createdAt) {
      const parsed = new Date(createdAt);
      if (!isNaN(parsed.getTime())) {
        dataToSave.createdAt = parsed;
      } else {
        console.warn('⚠️ createdAt inválido recebido, ignorando:', createdAt);
      }
    }

    console.log('💾 Dados que serão salvos no banco (sanitizados):', dataToSave);

    // Gerar código legível sequencial (com tolerância a condição de corrida)
    let interview;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const code = await generateNextInterviewCode();
        interview = await prisma.interview.create({
          data: { ...dataToSave, code }
        });
        break;
      } catch (e) {
        // Se o cliente Prisma não tem o campo `code` (client desatualizado), criar sem o código para não bloquear o uso.
        const msg = e?.message || '';
        if (msg.includes('Unknown argument `code`') || msg.includes('Unknown arg `code`')) {
          console.warn('⚠️ Prisma Client parece desatualizado (sem coluna `code`). Criando entrevista sem code. Rode: npx prisma generate && npx prisma db push');
          interview = await prisma.interview.create({ data: dataToSave });
          break;
        }
        if (e?.code === 'P2002') {
          // Código duplicado (unique constraint). Tentar novamente gerando outro.
          continue;
        }
        throw e;
      }
    }
    if (!interview) throw new Error('Falha ao gerar código único para entrevista.');
    
    console.log('✅ Entrevista criada com sucesso:', interview.id, interview.code);
    console.log('🎯 Entrevista X salva no banco de dados - Metadados salvos no banco de dados!');
    console.log('📊 Detalhes da entrevista criada:', {
      id: interview.id,
      code: interview.code,
      isInterviewer: interview.isInterviewer,
      interviewerName: interview.interviewerName,
      respondentName: interview.respondentName,
      respondentDepartment: interview.respondentDepartment,
      createdAt: interview.createdAt
    });
    
    // Verificar se os dados foram realmente salvos
    console.log('🔍 Verificação pós-criação - Dados no banco:', {
      id: interview.id,
      code: interview.code,
      isInterviewer: interview.isInterviewer,
      interviewerName: interview.interviewerName,
      respondentName: interview.respondentName,
      respondentDepartment: interview.respondentDepartment
    });
    
    res.json(interview);
  } catch (error) {
    console.error('❌ Erro ao criar entrevista:', error);
    console.error('❌ Stack trace:', error.stack);
    // Diagnóstico adicional: listar colunas da tabela interviews para checar divergências
    try {
      const columns = await prisma.$queryRawUnsafe('PRAGMA table_info("interviews")');
      console.log('🧭 Schema atual da tabela interviews:', columns);
    } catch (e) {
      console.warn('⚠️ Falha ao consultar PRAGMA table_info(interviews):', e?.message || e);
    }
    // Retornar mais contexto para facilitar diagnóstico no cliente
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error?.message || 'Erro desconhecido',
      code: error?.code || undefined,
      meta: error?.meta || undefined
    });
  }
});

app.get('/api/interviews', async (req, res) => {
  try {
    console.log('🔍 GET /api/interviews - Buscando todas as entrevistas...');
    
    const interviews = await prisma.interview.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Total de entrevistas encontradas: ${interviews.length}`);
    
    // Log detalhado de cada entrevista
    interviews.forEach((interview, index) => {
      console.log(`📋 Entrevista ${index + 1}:`, {
        id: interview.id,
        isInterviewer: interview.isInterviewer,
        interviewerName: interview.interviewerName,
        respondentName: interview.respondentName,
        respondentDepartment: interview.respondentDepartment,
        createdAt: interview.createdAt,
        isCompleted: interview.isCompleted
      });
    });
    
    // Removido: marcação automática de conclusão ao listar

    // Converter campos JSON de volta para objetos
    const interviewsWithJson = interviews.map(interview => ({
      ...interview,
      f1Answers: interview.f1Answers ? JSON.parse(interview.f1Answers) : null,
      f2Answers: interview.f2Answers ? JSON.parse(interview.f2Answers) : null,
      f3Answers: interview.f3Answers ? JSON.parse(interview.f3Answers) : null,
      configSnapshot: interview.configSnapshot ? JSON.parse(interview.configSnapshot) : null
    }));
    
    console.log('✅ Entrevistas retornadas com sucesso');
    res.json(interviewsWithJson);
  } catch (error) {
    console.error('❌ Erro ao buscar entrevistas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/interviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let interview = await prisma.interview.findUnique({
      where: { id },
      include: { analyses: true }
    });
    
    if (!interview) {
      return res.status(404).json({ error: 'Entrevista não encontrada' });
    }
    
    // Removido: marcação automática de conclusão ao buscar por ID

    // Converter campos JSON de volta para objetos
    const interviewWithJson = {
      ...interview,
      f1Answers: interview.f1Answers ? JSON.parse(interview.f1Answers) : null,
      f2Answers: interview.f2Answers ? JSON.parse(interview.f2Answers) : null,
      f3Answers: interview.f3Answers ? JSON.parse(interview.f3Answers) : null,
      configSnapshot: interview.configSnapshot ? JSON.parse(interview.configSnapshot) : null,
      analyses: interview.analyses.map(analysis => ({
        ...analysis,
        categoryScores: analysis.categoryScores ? JSON.parse(analysis.categoryScores) : null,
        insights: analysis.insights ? JSON.parse(analysis.insights) : null,
        recommendations: analysis.recommendations ? JSON.parse(analysis.recommendations) : null
      }))
    };
    
    res.json(interviewWithJson);
  } catch (error) {
    console.error('Erro ao buscar entrevista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/interviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    console.log('📝 PUT /api/interviews/:id - Atualizando entrevista:', id);
    console.log('📝 Dados recebidos (brutos):', body);

    // Sanitizar entrada
    const updateData = {};
    if (typeof body.isInterviewer === 'boolean' || body.isInterviewer === 'true' || body.isInterviewer === 'false') {
      updateData.isInterviewer = body.isInterviewer === true || body.isInterviewer === 'true';
    }
    if (typeof body.interviewerName === 'string') updateData.interviewerName = body.interviewerName.trim() || null;
    if (typeof body.respondentName === 'string') updateData.respondentName = body.respondentName.trim() || null;
    if (typeof body.respondentDepartment === 'string') updateData.respondentDepartment = body.respondentDepartment.trim() || null;
    if (body.completedAt) {
      const parsed = new Date(body.completedAt);
      if (!isNaN(parsed.getTime())) updateData.completedAt = parsed; 
    }
    if (typeof body.isCompleted === 'boolean') updateData.isCompleted = body.isCompleted;
    if (body.configSnapshot !== undefined) {
      try { updateData.configSnapshot = JSON.stringify(body.configSnapshot); } catch (e) { /* ignore */ }
    }

    console.log('💾 Dados sanitizados para update:', updateData);

    const interview = await prisma.interview.update({
      where: { id },
      data: updateData
    });
    
    console.log('✅ Entrevista atualizada com sucesso:', {
      id: interview.id,
      isInterviewer: interview.isInterviewer,
      interviewerName: interview.interviewerName,
      respondentName: interview.respondentName,
      respondentDepartment: interview.respondentDepartment,
      updatedAt: interview.updatedAt
    });
    
    res.json(interview);
  } catch (error) {
    console.error('❌ Erro ao atualizar entrevista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/interviews/:id/answers', async (req, res) => {
  try {
    const { id } = req.params;
    const { formId, answers } = req.body;
    
    console.log(`📝 PUT /api/interviews/:id/answers - Salvando ${formId} na entrevista ${id}`);
    console.log(`📊 Dados recebidos:`, { formId, answersCount: Object.keys(answers).length });
    
    const updateData = {};
    updateData[`${formId}Answers`] = JSON.stringify(answers);
    
    let interview = await prisma.interview.update({
      where: { id },
      data: updateData
    });

    console.log(`✅ ${formId} salvo com sucesso na entrevista ${id}`);
    console.log(`📊 Total de respostas em ${formId}: ${Object.keys(answers).length}`);

    // Removido: marcação automática de conclusão ao salvar respostas; agora só conclui via /complete

    // Converter campos JSON de volta para objetos
    const interviewWithJson = {
      ...interview,
      f1Answers: interview.f1Answers ? JSON.parse(interview.f1Answers) : null,
      f2Answers: interview.f2Answers ? JSON.parse(interview.f2Answers) : null,
      f3Answers: interview.f3Answers ? JSON.parse(interview.f3Answers) : null,
      configSnapshot: interview.configSnapshot ? JSON.parse(interview.configSnapshot) : null
    };

    res.json(interviewWithJson);
  } catch (error) {
    console.error(`❌ Erro ao salvar ${formId}:`, error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/interviews/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { configSnapshot } = req.body;
    
    const interview = await prisma.interview.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        configSnapshot: JSON.stringify(configSnapshot)
      }
    });
    
    // Converter campos JSON de volta para objetos
    const interviewWithJson = {
      ...interview,
      f1Answers: interview.f1Answers ? JSON.parse(interview.f1Answers) : null,
      f2Answers: interview.f2Answers ? JSON.parse(interview.f2Answers) : null,
      f3Answers: interview.f3Answers ? JSON.parse(interview.f3Answers) : null,
      configSnapshot: interview.configSnapshot ? JSON.parse(interview.configSnapshot) : null
    };
    
    res.json(interviewWithJson);
  } catch (error) {
    console.error('Erro ao completar entrevista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/interviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.interview.delete({
      where: { id }
    });
    
    res.json({ message: 'Entrevista deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar entrevista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para apagar banco de dados (CRÍTICO)
app.delete('/api/database/clear', async (req, res) => {
  try {
    console.log('🚨 OPERAÇÃO CRÍTICA: Apagando banco de dados...');
    
    // Deletar todas as análises primeiro (devido à foreign key)
    const deletedAnalyses = await prisma.analysis.deleteMany({});
    console.log(`🗑️ ${deletedAnalyses.count} análises deletadas`);
    
    // Deletar todas as entrevistas
    const deletedInterviews = await prisma.interview.deleteMany({});
    console.log(`🗑️ ${deletedInterviews.count} entrevistas deletadas`);
    
    // Deletar todas as configurações (inclusive a ativa) para zerar o sistema
    const deletedConfigs = await prisma.config.deleteMany({});
    console.log(`🗑️ ${deletedConfigs.count} configurações deletadas (inclui ativa)`);
    
    console.log('✅ Banco de dados limpo com sucesso!');
    
    res.json({ 
      message: 'Banco de dados limpo com sucesso',
      deleted: {
        analyses: deletedAnalyses.count,
        interviews: deletedInterviews.count,
        configs: deletedConfigs.count
      }
    });
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas para Configurações
app.post('/api/configs', async (req, res) => {
  try {
    const { forms, lookups, name, description } = req.body;
    
    const config = await prisma.config.create({
      data: {
        forms: JSON.stringify(forms),
        lookups: JSON.stringify(lookups),
        name,
        description
      }
    });
    
    // Converter de volta para JSON na resposta
    res.json({
      ...config,
      forms: JSON.parse(config.forms),
      lookups: JSON.parse(config.lookups)
    });
  } catch (error) {
    console.error('Erro ao criar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/configs', async (req, res) => {
  try {
    const configs = await prisma.config.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    
    // Converter campos JSON de volta para objetos
    const configsWithJson = configs.map(config => ({
      ...config,
      forms: JSON.parse(config.forms),
      lookups: JSON.parse(config.lookups)
    }));
    
    res.json(configsWithJson);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/configs/active', async (req, res) => {
  try {
    const config = await prisma.config.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    
    if (config) {
      // Converter campos JSON de volta para objetos
      const configWithJson = {
        ...config,
        forms: JSON.parse(config.forms),
        lookups: JSON.parse(config.lookups)
      };
      res.json(configWithJson);
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Erro ao buscar configuração ativa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas para Análises
app.post('/api/analyses', async (req, res) => {
  try {
    const {
      interviewId,
      overallScore,
      categoryScores,
      satisfactionScore,
      functionalityScore,
      integrationScore,
      usageScore,
      insights,
      recommendations
    } = req.body;
    
    const analysis = await prisma.analysis.create({
      data: {
        interviewId,
        overallScore,
        categoryScores: JSON.stringify(categoryScores),
        satisfactionScore,
        functionalityScore,
        integrationScore,
        usageScore,
        insights: JSON.stringify(insights),
        recommendations: JSON.stringify(recommendations)
      }
    });
    
    // Converter campos JSON de volta para objetos
    const analysisWithJson = {
      ...analysis,
      categoryScores: JSON.parse(analysis.categoryScores),
      insights: JSON.parse(analysis.insights),
      recommendations: JSON.parse(analysis.recommendations)
    };
    
    res.json(analysisWithJson);
  } catch (error) {
    console.error('Erro ao criar análise:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/analyses', async (req, res) => {
  try {
    const analyses = await prisma.analysis.findMany({
      include: { interview: true },
      orderBy: { createdAt: 'desc' }
    });
    
    // Converter campos JSON de volta para objetos
    const analysesWithJson = analyses.map(analysis => ({
      ...analysis,
      categoryScores: analysis.categoryScores ? JSON.parse(analysis.categoryScores) : null,
      insights: analysis.insights ? JSON.parse(analysis.insights) : null,
      recommendations: analysis.recommendations ? JSON.parse(analysis.recommendations) : null,
      interview: analysis.interview ? {
        ...analysis.interview,
        f1Answers: analysis.interview.f1Answers ? JSON.parse(analysis.interview.f1Answers) : null,
        f2Answers: analysis.interview.f2Answers ? JSON.parse(analysis.interview.f2Answers) : null,
        f3Answers: analysis.interview.f3Answers ? JSON.parse(analysis.interview.f3Answers) : null,
        configSnapshot: analysis.interview.configSnapshot ? JSON.parse(analysis.interview.configSnapshot) : null
      } : null
    }));
    
    res.json(analysesWithJson);
  } catch (error) {
    console.error('Erro ao buscar análises:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para estatísticas
app.get('/api/stats', async (req, res) => {
  try {
    const totalInterviews = await prisma.interview.count();
    const completedInterviews = await prisma.interview.count({
      where: { isCompleted: true }
    });
    const totalAnalyses = await prisma.analysis.count();
    
    // Média de scores
    const avgScores = await prisma.analysis.aggregate({
      _avg: {
        overallScore: true,
        satisfactionScore: true,
        functionalityScore: true,
        integrationScore: true,
        usageScore: true
      }
    });
    
    res.json({
      totalInterviews,
      completedInterviews,
      totalAnalyses,
      completionRate: totalInterviews > 0 ? (completedInterviews / totalInterviews) * 100 : 0,
      averageScores: avgScores._avg
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint de debug: informações do banco e teste de escrita
app.get('/api/debug/dbinfo', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL || null;
    const filePath = resolveSqlitePath(dbUrl);
    const dir = filePath ? path.dirname(filePath) : null;
    const info = {
      DATABASE_URL: dbUrl,
      resolvedPath: filePath,
      dir,
      cwd: process.cwd(),
      dirname: __dirname,
      perms: {
        canWriteFile: filePath ? canWrite(filePath) : null,
        canWriteDir: dir ? canWrite(dir) : null,
      },
    };
    // Teste de escrita não destrutivo: criar um arquivo temporário na pasta do DB
    if (dir && canWrite(dir)) {
      const tmpFile = path.join(dir, `.write-test-${Date.now()}.tmp`);
      try {
        fs.writeFileSync(tmpFile, 'ok');
        fs.unlinkSync(tmpFile);
        info.writeTest = 'ok';
      } catch (e) {
        info.writeTest = `fail: ${e?.message || e}`;
      }
    } else {
      info.writeTest = 'dir-not-writable';
    }

    // Consultar o schema real da tabela para validar conexão
    try {
      const columns = await prisma.$queryRawUnsafe('PRAGMA table_info("interviews")');
      info.tableInfo = columns;
    } catch (e) {
      info.tableInfo = `fail: ${e?.message || e}`;
    }

    res.json(info);
  } catch (error) {
    res.status(500).json({ error: 'debug-failed', details: error?.message || String(error) });
  }
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
  console.log(`🔍 Prisma Studio em http://localhost:5555`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Desligando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});
