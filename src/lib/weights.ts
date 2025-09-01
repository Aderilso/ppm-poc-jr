// Sistema de pesos e análise para o questionário PPM
export interface QuestionWeight {
    questionId: string;
    weight: number; // Peso de 1-5 (5 = mais importante)
    category: string;
    analysisType: 'satisfaction' | 'usage' | 'functionality' | 'integration' | 'demographic';
}

export interface CategoryWeight {
    category: string;
    weight: number;
    description: string;
}

// Pesos por pergunta individual
export const QUESTION_WEIGHTS: QuestionWeight[] = [
    // Formulário 1 - Avaliação Geral
    { questionId: "f1_q01", weight: 1, category: "Demográfico", analysisType: "demographic" },
    { questionId: "f1_q02", weight: 1, category: "Demográfico", analysisType: "demographic" },
    { questionId: "f1_q03", weight: 2, category: "Experiência", analysisType: "usage" },
    { questionId: "f1_q04", weight: 3, category: "Ferramentas Utilizadas", analysisType: "usage" },
    { questionId: "f1_q05", weight: 3, category: "Frequência de Uso", analysisType: "usage" },
    { questionId: "f1_q06", weight: 4, category: "Criticidade", analysisType: "usage" },
    { questionId: "f1_q07", weight: 4, category: "Ferramenta Crítica", analysisType: "usage" },
    { questionId: "f1_q08", weight: 5, category: "Usabilidade", analysisType: "satisfaction" },
    { questionId: "f1_q09", weight: 4, category: "Eficiência", analysisType: "satisfaction" },
    { questionId: "f1_q10", weight: 4, category: "Interface", analysisType: "satisfaction" },
    { questionId: "f1_q11", weight: 5, category: "Produtividade", analysisType: "satisfaction" },
    { questionId: "f1_q12", weight: 4, category: "Acompanhamento", analysisType: "functionality" },
    { questionId: "f1_q13", weight: 5, category: "Tomada de Decisão", analysisType: "functionality" },
    { questionId: "f1_q14", weight: 5, category: "Satisfação Geral", analysisType: "satisfaction" },
    { questionId: "f1_q15", weight: 3, category: "Recomendação", analysisType: "satisfaction" },

    // Formulário 2 - Análise de Funcionalidades
    { questionId: "f2_q01", weight: 4, category: "Planejamento", analysisType: "functionality" },
    { questionId: "f2_q02", weight: 4, category: "Gestão de Recursos", analysisType: "functionality" },
    { questionId: "f2_q03", weight: 5, category: "Controle Orçamentário", analysisType: "functionality" },
    { questionId: "f2_q04", weight: 4, category: "Gestão de Riscos", analysisType: "functionality" },
    { questionId: "f2_q05", weight: 5, category: "Visão de Portfólio", analysisType: "functionality" },
    { questionId: "f2_q06", weight: 5, category: "Priorização Estratégica", analysisType: "functionality" },
    { questionId: "f2_q07", weight: 4, category: "Análise de Dependências", analysisType: "functionality" },
    { questionId: "f2_q08", weight: 4, category: "Workflows", analysisType: "functionality" },
    { questionId: "f2_q09", weight: 3, category: "Comunicação", analysisType: "functionality" },
    { questionId: "f2_q10", weight: 3, category: "Notificações", analysisType: "functionality" },
    { questionId: "f2_q11", weight: 5, category: "Business Intelligence", analysisType: "functionality" },
    { questionId: "f2_q12", weight: 4, category: "Relatórios", analysisType: "functionality" },
    { questionId: "f2_q13", weight: 5, category: "KPIs e Métricas", analysisType: "functionality" },
    { questionId: "f2_q14", weight: 4, category: "Gap Analysis", analysisType: "functionality" },

    // Formulário 3 - Necessidades de Integração
    { questionId: "f3_q01", weight: 3, category: "Sistemas Essenciais", analysisType: "integration" },
    { questionId: "f3_q02", weight: 4, category: "Frequência de Integração", analysisType: "integration" },
    { questionId: "f3_q03", weight: 4, category: "Dados para PPM", analysisType: "integration" },
    { questionId: "f3_q04", weight: 3, category: "Integrações Existentes", analysisType: "integration" },
    { questionId: "f3_q05", weight: 3, category: "Fluxo de Dados", analysisType: "integration" },
    { questionId: "f3_q06", weight: 4, category: "Esforço Manual", analysisType: "integration" },
    { questionId: "f3_q07", weight: 5, category: "Integrações Críticas", analysisType: "integration" },
    { questionId: "f3_q08", weight: 4, category: "Sincronização de Dados", analysisType: "integration" },
    { questionId: "f3_q09", weight: 3, category: "Automação de Processos", analysisType: "integration" },
    { questionId: "f3_q10", weight: 4, category: "Impacto do Retrabalho", analysisType: "integration" },
    { questionId: "f3_q11", weight: 4, category: "Inconsistência de Dados", analysisType: "integration" },
    { questionId: "f3_q12", weight: 5, category: "Qualidade das Decisões", analysisType: "integration" },
    { questionId: "f3_q13", weight: 5, category: "Integração Prioritária", analysisType: "integration" },
];

// Pesos por categoria
export const CATEGORY_WEIGHTS: CategoryWeight[] = [
    { category: "Demográfico", weight: 1, description: "Informações básicas do respondente" },
    { category: "Experiência", weight: 2, description: "Tempo de experiência com ferramentas PPM" },
    { category: "Ferramentas Utilizadas", weight: 3, description: "Ferramentas atualmente em uso" },
    { category: "Frequência de Uso", weight: 3, description: "Intensidade de uso das ferramentas" },
    { category: "Criticidade", weight: 4, description: "Importância das ferramentas no trabalho" },
    { category: "Ferramenta Crítica", weight: 4, description: "Ferramenta mais importante" },
    { category: "Usabilidade", weight: 5, description: "Facilidade de uso das ferramentas" },
    { category: "Eficiência", weight: 4, description: "Velocidade para encontrar informações" },
    { category: "Interface", weight: 4, description: "Clareza e intuitividade da interface" },
    { category: "Produtividade", weight: 5, description: "Impacto na produtividade do trabalho" },
    { category: "Acompanhamento", weight: 4, description: "Facilidade para acompanhar projetos" },
    { category: "Tomada de Decisão", weight: 5, description: "Suporte para decisões estratégicas" },
    { category: "Satisfação Geral", weight: 5, description: "Satisfação geral com as ferramentas" },
    { category: "Recomendação", weight: 3, description: "Disposição para recomendar" },
    { category: "Planejamento", weight: 4, description: "Funcionalidades de planejamento" },
    { category: "Gestão de Recursos", weight: 4, description: "Gestão de pessoas e equipamentos" },
    { category: "Controle Orçamentário", weight: 5, description: "Controle de custos e orçamento" },
    { category: "Gestão de Riscos", weight: 4, description: "Identificação e gestão de riscos" },
    { category: "Visão de Portfólio", weight: 5, description: "Visão consolidada de múltiplos projetos" },
    { category: "Priorização Estratégica", weight: 5, description: "Priorização baseada em estratégia" },
    { category: "Análise de Dependências", weight: 4, description: "Análise de interdependências" },
    { category: "Workflows", weight: 4, description: "Fluxos de aprovação e processos" },
    { category: "Comunicação", weight: 3, description: "Facilitação da comunicação" },
    { category: "Notificações", weight: 3, description: "Sistema de alertas e notificações" },
    { category: "Business Intelligence", weight: 5, description: "Painéis e dashboards analíticos" },
    { category: "Relatórios", weight: 4, description: "Geração de relatórios gerenciais" },
    { category: "KPIs e Métricas", weight: 5, description: "Métricas e indicadores de performance" },
    { category: "Gap Analysis", weight: 4, description: "Identificação de lacunas funcionais" },
    { category: "Sistemas Essenciais", weight: 3, description: "Sistemas considerados essenciais" },
    { category: "Frequência de Integração", weight: 4, description: "Necessidade de acessar múltiplos sistemas" },
    { category: "Dados para PPM", weight: 4, description: "Dados que deveriam estar no PPM" },
    { category: "Integrações Existentes", weight: 3, description: "Integrações já implementadas" },
    { category: "Fluxo de Dados", weight: 3, description: "Como os dados transitam hoje" },
    { category: "Esforço Manual", weight: 4, description: "Tempo gasto em transferência manual" },
    { category: "Integrações Críticas", weight: 5, description: "Integrações mais importantes" },
    { category: "Sincronização de Dados", weight: 4, description: "Tipos de dados para sincronização" },
    { category: "Automação de Processos", weight: 3, description: "Processos que podem ser automatizados" },
    { category: "Impacto do Retrabalho", weight: 4, description: "Retrabalho causado por falta de integração" },
    { category: "Inconsistência de Dados", weight: 4, description: "Problemas de consistência entre sistemas" },
    { category: "Qualidade das Decisões", weight: 5, description: "Impacto da integração nas decisões" },
    { category: "Integração Prioritária", weight: 5, description: "Integração que traria maior benefício" },
];

// Função para obter peso de uma pergunta
export function getQuestionWeight(questionId: string): QuestionWeight | undefined {
    return QUESTION_WEIGHTS.find(w => w.questionId === questionId);
}

// Função para obter peso de uma categoria
export function getCategoryWeight(category: string): CategoryWeight | undefined {
    return CATEGORY_WEIGHTS.find(w => w.category === category);
}