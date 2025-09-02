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
    const { isInterviewer, interviewerName, respondentName, respondentDepartment } = req.body;
    
    console.log('🔍 Dados extraídos:', { isInterviewer, interviewerName, respondentName, respondentDepartment });
    
    const interview = await prisma.interview.create({
      data: {
        isInterviewer,
        interviewerName,
        respondentName,
        respondentDepartment,
      }
    });
    
    console.log('✅ Entrevista criada com sucesso:', interview);
    res.json(interview);
  } catch (error) {
    console.error('❌ Erro ao criar entrevista:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

app.get('/api/interviews', async (req, res) => {
  try {
    const interviews = await prisma.interview.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Converter campos JSON de volta para objetos
    const interviewsWithJson = interviews.map(interview => ({
      ...interview,
      f1Answers: interview.f1Answers ? JSON.parse(interview.f1Answers) : null,
      f2Answers: interview.f2Answers ? JSON.parse(interview.f2Answers) : null,
      f3Answers: interview.f3Answers ? JSON.parse(interview.f3Answers) : null,
      configSnapshot: interview.configSnapshot ? JSON.parse(interview.configSnapshot) : null
    }));
    
    res.json(interviewsWithJson);
  } catch (error) {
    console.error('Erro ao buscar entrevistas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/interviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { analyses: true }
    });
    
    if (!interview) {
      return res.status(404).json({ error: 'Entrevista não encontrada' });
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
    const updateData = req.body;
    
    console.log('📝 PUT /api/interviews/:id - Atualizando entrevista:', id);
    console.log('📝 Dados recebidos:', updateData);
    
    const interview = await prisma.interview.update({
      where: { id },
      data: updateData
    });
    
    console.log('✅ Entrevista atualizada com sucesso:', interview);
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
    
    const interview = await prisma.interview.update({
      where: { id },
      data: updateData
    });
    
    console.log(`✅ ${formId} salvo com sucesso na entrevista ${id}`);
    console.log(`📊 Total de respostas em ${formId}: ${Object.keys(answers).length}`);
    
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
    
    // Deletar todas as configurações (exceto a ativa)
    const deletedConfigs = await prisma.config.deleteMany({
      where: {
        isActive: false
      }
    });
    console.log(`🗑️ ${deletedConfigs.count} configurações inativas deletadas`);
    
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
