import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function initDatabase() {
  console.log('🚀 Inicializando banco de dados...');

  try {
    // Carregar dados de exemplo do arquivo JSON
    const sampleDataPath = path.join(process.cwd(), '..', 'ppm_forms_consolidado_v2_normalizado.json');
    const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));

    // Criar configuração padrão
    console.log('📝 Criando configuração padrão...');
    const config = await prisma.config.create({
      data: {
        forms: JSON.stringify(sampleData.forms),
        lookups: JSON.stringify(sampleData.lookups),
        name: 'Configuração Padrão PPM',
        description: 'Configuração inicial do sistema de pesquisa PPM',
        isActive: true,
      },
    });

    console.log(`✅ Configuração criada com ID: ${config.id}`);

    // Criar algumas entrevistas de exemplo
    console.log('👥 Criando entrevistas de exemplo...');
    
    const sampleInterviews = [
      {
        isInterviewer: true,
        interviewerName: 'Maria Silva',
        respondentName: 'João Santos',
        respondentDepartment: 'TI',
        f1Answers: JSON.stringify({
          'f1_q01': 'TI',
          'f1_q02': 'Gerente de Projeto',
          'f1_q03': '3 5 Anos',
          'f1_q04': ['Microsoft Project', 'Jira'],
          'f1_q05': 'Diariamente',
          'f1_q06': 'Sim',
          'f1_q07': 'Microsoft Project',
          'f1_q08': '4',
          'f1_q09': '2',
          'f1_q10': '4',
          'f1_q11': '4',
          'f1_q12': '4',
          'f1_q13': '4',
          'f1_q14': '7',
          'f1_q15': 'Sim'
        }),
        f2Answers: JSON.stringify({
          'f2_q01': 'Gestão de Cronogramas',
          'f2_q02': 'Controle de Custos',
          'f2_q03': 'Microsoft Project',
          'f2_q04': '4',
          'f2_q05': '3'
        }),
        f3Answers: JSON.stringify({
          'f3_q01': ['ERP Financeiro', 'CRM'],
          'f3_q02': 'Integração Automática',
          'f3_q03': 'Dados de Projeto'
        }),
        isCompleted: true,
        completedAt: new Date(),
        configSnapshot: JSON.stringify(sampleData)
      },
      {
        isInterviewer: false,
        respondentName: 'Ana Costa',
        respondentDepartment: 'Finanças',
        f1Answers: JSON.stringify({
          'f1_q01': 'Finanças',
          'f1_q02': 'Analista',
          'f1_q03': '1 3 Anos',
          'f1_q04': ['Excel', 'Google Sheets'],
          'f1_q05': 'Semanalmente',
          'f1_q06': 'Não',
          'f1_q08': '3',
          'f1_q09': '3',
          'f1_q10': '3',
          'f1_q11': '3',
          'f1_q12': '3',
          'f1_q13': '3',
          'f1_q14': '5',
          'f1_q15': 'Não'
        }),
        f2Answers: JSON.stringify({
          'f2_q01': 'Dashboards e Relatórios',
          'f2_q02': 'Gestão de Recursos',
          'f2_q03': 'Excel',
          'f2_q04': '2',
          'f2_q05': '2'
        }),
        f3Answers: JSON.stringify({
          'f3_q01': ['ERP Financeiro'],
          'f3_q02': 'Export/Import',
          'f3_q03': 'Dados Financeiros'
        }),
        isCompleted: true,
        completedAt: new Date(),
        configSnapshot: JSON.stringify(sampleData)
      },
      {
        isInterviewer: true,
        interviewerName: 'Carlos Oliveira',
        respondentName: 'Patrícia Lima',
        respondentDepartment: 'RH',
        f1Answers: JSON.stringify({
          'f1_q01': 'RH',
          'f1_q02': 'Coordenador',
          'f1_q03': '5 10 Anos',
          'f1_q04': ['Workday', 'SAP'],
          'f1_q05': 'Mensalmente',
          'f1_q06': 'Não',
          'f1_q08': '5',
          'f1_q09': '2',
          'f1_q10': '5',
          'f1_q11': '5',
          'f1_q12': '5',
          'f1_q13': '5',
          'f1_q14': '9',
          'f1_q15': 'Sim'
        }),
        isCompleted: false,
        configSnapshot: JSON.stringify(sampleData)
      }
    ];

    for (const interviewData of sampleInterviews) {
      const interview = await prisma.interview.create({
        data: interviewData,
      });
      console.log(`✅ Entrevista criada com ID: ${interview.id}`);
    }

    // Criar análises de exemplo para entrevistas completadas
    console.log('📊 Criando análises de exemplo...');
    
    const completedInterviews = await prisma.interview.findMany({
      where: { isCompleted: true }
    });

    for (const interview of completedInterviews) {
      const analysis = await prisma.analysis.create({
        data: {
          interviewId: interview.id,
          overallScore: 7.5,
          categoryScores: JSON.stringify([
            { category: 'Satisfação', score: 7.0, percentage: 70 },
            { category: 'Funcionalidade', score: 8.0, percentage: 80 },
            { category: 'Integração', score: 7.5, percentage: 75 }
          ]),
          satisfactionScore: 7.0,
          functionalityScore: 8.0,
          integrationScore: 7.5,
          usageScore: 7.5,
          insights: JSON.stringify([
            'Boa satisfação geral com as ferramentas atuais',
            'Necessidade de melhorias na integração',
            'Funcionalidades básicas atendem às necessidades'
          ]),
          recommendations: JSON.stringify([
            'Considerar ferramentas com melhor integração',
            'Implementar dashboards mais avançados',
            'Treinamento adicional para usuários'
          ])
        }
      });
      console.log(`✅ Análise criada para entrevista: ${interview.id}`);
    }

    console.log('🎉 Banco de dados inicializado com sucesso!');
    console.log(`📊 Total de entrevistas: ${await prisma.interview.count()}`);
    console.log(`📈 Total de análises: ${await prisma.analysis.count()}`);
    console.log(`⚙️ Configurações: ${await prisma.config.count()}`);

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase();
}

export { initDatabase };
