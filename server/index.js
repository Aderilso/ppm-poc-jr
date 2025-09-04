import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

    const interview = await prisma.interview.create({
      data: dataToSave
    });
    
    console.log('✅ Entrevista criada com sucesso:', interview.id);
    console.log('🎯 Entrevista X salva no banco de dados - Metadados salvos no banco de dados!');
    console.log('📊 Detalhes da entrevista criada:', {
      id: interview.id,
      isInterviewer: interview.isInterviewer,
      interviewerName: interview.interviewerName,
      respondentName: interview.respondentName,
      respondentDepartment: interview.respondentDepartment,
      createdAt: interview.createdAt
    });
    
    // Verificar se os dados foram realmente salvos
    console.log('🔍 Verificação pós-criação - Dados no banco:', {
      id: interview.id,
      isInterviewer: interview.isInterviewer,
      interviewerName: interview.interviewerName,
      respondentName: interview.respondentName,
      respondentDepartment: interview.respondentDepartment
    });
    
    res.json(interview);
  } catch (error) {
    console.error('❌ Erro ao criar entrevista:', error);
    console.error('❌ Stack trace:', error.stack);
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
    
    // Auto-conclusão defensiva ao listar
    const completedIds = [];
    for (let i = 0; i < interviews.length; i++) {
      const itw = interviews[i];
      try {
        const f1 = itw.f1Answers ? JSON.parse(itw.f1Answers) : null;
        const f2 = itw.f2Answers ? JSON.parse(itw.f2Answers) : null;
        const f3 = itw.f3Answers ? JSON.parse(itw.f3Answers) : null;
        const hasF1 = f1 && Object.keys(f1).length > 0;
        const hasF2 = f2 && Object.keys(f2).length > 0;
        const hasF3 = f3 && Object.keys(f3).length > 0;
        if (hasF1 && hasF2 && hasF3 && !itw.isCompleted) {
          await prisma.interview.update({
            where: { id: itw.id },
            data: { isCompleted: true, completedAt: new Date() }
          });
          itw.isCompleted = true;
          itw.completedAt = new Date();
          completedIds.push(itw.id);
        }
      } catch (e) {
        console.warn('⚠️ Erro ao verificar/atualizar conclusão ao listar:', itw.id, e);
      }
    }
    if (completedIds.length > 0) {
      console.log('✅ Entrevistas marcadas como concluídas ao listar:', completedIds);
    }

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
    
    // Auto-conclusão defensiva ao buscar por ID
    try {
      const f1 = interview.f1Answers ? JSON.parse(interview.f1Answers) : null;
      const f2 = interview.f2Answers ? JSON.parse(interview.f2Answers) : null;
      const f3 = interview.f3Answers ? JSON.parse(interview.f3Answers) : null;
      const hasF1 = f1 && Object.keys(f1).length > 0;
      const hasF2 = f2 && Object.keys(f2).length > 0;
      const hasF3 = f3 && Object.keys(f3).length > 0;
      if (hasF1 && hasF2 && hasF3 && !interview.isCompleted) {
        console.log(`🎯 Marcando entrevista ${id} como CONCLUÍDA automaticamente (GET by id)`);
        interview = await prisma.interview.update({
          where: { id },
          data: { isCompleted: true, completedAt: new Date() },
          include: { analyses: true }
        });
      }
    } catch (e) {
      console.warn('⚠️ Erro ao verificar/atualizar conclusão em GET by id:', id, e);
    }

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

    // Verificar se todos os formulários possuem respostas para concluir automaticamente
    try {
      const f1 = interview.f1Answers ? JSON.parse(interview.f1Answers) : null;
      const f2 = interview.f2Answers ? JSON.parse(interview.f2Answers) : null;
      const f3 = interview.f3Answers ? JSON.parse(interview.f3Answers) : null;
      const hasF1 = f1 && Object.keys(f1).length > 0;
      const hasF2 = f2 && Object.keys(f2).length > 0;
      const hasF3 = f3 && Object.keys(f3).length > 0;

      console.log('🔍 Verificação automática de conclusão:', { id, hasF1, hasF2, hasF3, isCompleted: interview.isCompleted });

      if (hasF1 && hasF2 && hasF3 && !interview.isCompleted) {
        console.log(`🎯 Marcando entrevista ${id} como CONCLUÍDA automaticamente`);
        interview = await prisma.interview.update({
          where: { id },
          data: { isCompleted: true, completedAt: new Date() }
        });
      }
    } catch (autoErr) {
      console.warn('⚠️ Erro ao verificar conclusão automática:', autoErr);
    }

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
