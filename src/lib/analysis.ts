import type { PpmConfig, FormAnswers, Question } from "./types";
import { QUESTION_WEIGHTS, CATEGORY_WEIGHTS, getQuestionWeight, getCategoryWeight } from "./weights";

export interface ScoreResult {
  score: number;
  maxScore: number;
  percentage: number;
  category: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  questionCount: number;
  weight: number;
}

export interface AnalysisResult {
  overallScore: ScoreResult;
  categoryScores: CategoryScore[];
  satisfactionScore: ScoreResult;
  functionalityScore: ScoreResult;
  integrationScore: ScoreResult;
  usageScore: ScoreResult;
  insights: string[];
  recommendations: string[];
}

// Converter resposta para valor numérico
function getNumericValue(answer: string | string[], question: Question): number {
  if (!answer) return 0;
  
  const answerStr = Array.isArray(answer) ? answer.join(";") : answer;
  
  // Escalas numéricas
  if (question.tipo === "escala_0_10") {
    const num = parseInt(answerStr);
    return isNaN(num) ? 0 : num;
  }
  
  if (question.tipo === "escala_1_5") {
    const num = parseInt(answerStr);
    return isNaN(num) ? 0 : num;
  }
  
  // Sim/Não
  if (question.tipo.includes("sim/não")) {
    if (answerStr.toLowerCase().includes("sim")) return 5;
    if (answerStr.toLowerCase().includes("parcialmente")) return 3;
    if (answerStr.toLowerCase().includes("não")) return 1;
    return 0;
  }
  
  // Frequência de uso
  if (question.tipo.includes("Diariamente")) {
    if (answerStr.includes("Diariamente")) return 5;
    if (answerStr.includes("Semanalmente")) return 4;
    if (answerStr.includes("Quinzenalmente")) return 3;
    if (answerStr.includes("Mensalmente")) return 2;
    if (answerStr.includes("Esporadicamente")) return 1;
    return 0;
  }
  
  // Experiência
  if (question.tipo.includes("1_Ano")) {
    if (answerStr.includes("> 10 Anos")) return 5;
    if (answerStr.includes("5 10 Anos")) return 4;
    if (answerStr.includes("3 5 Anos")) return 3;
    if (answerStr.includes("1 3 Anos")) return 2;
    if (answerStr.includes("< 1 Ano")) return 1;
    return 0;
  }
  
  // Para múltipla escolha, contar número de opções selecionadas
  if (question.tipo === "multipla") {
    if (Array.isArray(answer)) {
      return Math.min(answer.length, 5); // Máximo 5 pontos
    }
    return answerStr.split(";").length;
  }
  
  // Para texto e outras respostas, dar pontuação baseada na presença de resposta
  if (answerStr.trim().length > 0) {
    return 3; // Pontuação média por ter respondido
  }
  
  return 0;
}

// Calcular score por categoria
function calculateCategoryScore(
  config: PpmConfig,
  answers: FormAnswers,
  category: string
): CategoryScore {
  const categoryQuestions = QUESTION_WEIGHTS.filter(w => w.category === category);
  let totalScore = 0;
  let maxScore = 0;
  let questionCount = 0;
  
  for (const weightConfig of categoryQuestions) {
    const question = findQuestion(config, weightConfig.questionId);
    if (!question) continue;
    
    const formId = weightConfig.questionId.substring(0, 2) as "f1" | "f2" | "f3";
    const answer = answers[formId][weightConfig.questionId];
    
    const numericValue = getNumericValue(answer, question);
    const maxValue = getMaxValue(question);
    
    totalScore += numericValue * weightConfig.weight;
    maxScore += maxValue * weightConfig.weight;
    questionCount++;
  }
  
  const categoryWeight = getCategoryWeight(category)?.weight || 1;
  
  return {
    category,
    score: totalScore,
    maxScore,
    percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
    questionCount,
    weight: categoryWeight
  };
}

// Encontrar pergunta por ID
function findQuestion(config: PpmConfig, questionId: string): Question | undefined {
  for (const form of config.forms) {
    const question = form.questions.find(q => q.id === questionId);
    if (question) return question;
  }
  return undefined;
}

// Obter valor máximo possível para uma pergunta
function getMaxValue(question: Question): number {
  if (question.tipo === "escala_0_10") return 10;
  if (question.tipo === "escala_1_5") return 5;
  if (question.tipo.includes("sim/não")) return 5;
  if (question.tipo === "multipla") return 5;
  return 5; // Valor padrão
}

// Calcular score por tipo de análise
function calculateAnalysisTypeScore(
  config: PpmConfig,
  answers: FormAnswers,
  analysisType: string
): ScoreResult {
  const typeQuestions = QUESTION_WEIGHTS.filter(w => w.analysisType === analysisType);
  let totalScore = 0;
  let maxScore = 0;
  
  for (const weightConfig of typeQuestions) {
    const question = findQuestion(config, weightConfig.questionId);
    if (!question) continue;
    
    const formId = weightConfig.questionId.substring(0, 2) as "f1" | "f2" | "f3";
    const answer = answers[formId][weightConfig.questionId];
    
    const numericValue = getNumericValue(answer, question);
    const maxValue = getMaxValue(question);
    
    totalScore += numericValue * weightConfig.weight;
    maxScore += maxValue * weightConfig.weight;
  }
  
  return {
    score: totalScore,
    maxScore,
    percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
    category: analysisType
  };
}

// Gerar insights baseados nos scores
function generateInsights(
  categoryScores: CategoryScore[],
  satisfactionScore: ScoreResult,
  functionalityScore: ScoreResult,
  integrationScore: ScoreResult
): string[] {
  const insights: string[] = [];
  
  // Análise de satisfação
  if (satisfactionScore.percentage >= 80) {
    insights.push("Alta satisfação geral com as ferramentas PPM atuais");
  } else if (satisfactionScore.percentage >= 60) {
    insights.push("Satisfação moderada com as ferramentas PPM - há espaço para melhorias");
  } else {
    insights.push("Baixa satisfação com as ferramentas PPM atuais - necessária revisão urgente");
  }
  
  // Análise de funcionalidades
  if (functionalityScore.percentage < 60) {
    insights.push("Funcionalidades das ferramentas PPM não atendem adequadamente às necessidades");
  }
  
  // Análise de integração
  if (integrationScore.percentage < 50) {
    insights.push("Forte necessidade de melhorar integrações entre sistemas");
  }
  
  // Análise por categoria - identificar pontos fracos
  const weakCategories = categoryScores
    .filter(c => c.percentage < 60)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3);
    
  if (weakCategories.length > 0) {
    insights.push(`Principais áreas de melhoria: ${weakCategories.map(c => c.category).join(", ")}`);
  }
  
  // Análise por categoria - identificar pontos fortes
  const strongCategories = categoryScores
    .filter(c => c.percentage >= 80)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 2);
    
  if (strongCategories.length > 0) {
    insights.push(`Pontos fortes identificados: ${strongCategories.map(c => c.category).join(", ")}`);
  }
  
  return insights;
}

// Gerar recomendações baseadas na análise
function generateRecommendations(
  categoryScores: CategoryScore[],
  satisfactionScore: ScoreResult,
  functionalityScore: ScoreResult,
  integrationScore: ScoreResult
): string[] {
  const recommendations: string[] = [];
  
  // Recomendações baseadas em satisfação
  if (satisfactionScore.percentage < 70) {
    recommendations.push("Considerar treinamento adicional ou mudança de ferramenta PPM");
    recommendations.push("Realizar workshop de usabilidade com usuários");
  }
  
  // Recomendações baseadas em funcionalidades
  if (functionalityScore.percentage < 60) {
    recommendations.push("Avaliar ferramentas PPM com funcionalidades mais robustas");
    recommendations.push("Implementar customizações nas ferramentas atuais");
  }
  
  // Recomendações baseadas em integração
  if (integrationScore.percentage < 50) {
    recommendations.push("Priorizar projeto de integração entre sistemas");
    recommendations.push("Considerar plataforma de integração (iPaaS)");
  }
  
  // Recomendações específicas por categoria
  const criticalCategories = categoryScores
    .filter(c => c.percentage < 50 && c.weight >= 4)
    .sort((a, b) => a.percentage - b.percentage);
    
  for (const category of criticalCategories.slice(0, 3)) {
    switch (category.category) {
      case "Business Intelligence":
        recommendations.push("Implementar dashboards executivos e relatórios automatizados");
        break;
      case "Visão de Portfólio":
        recommendations.push("Configurar visões consolidadas de múltiplos projetos");
        break;
      case "Controle Orçamentário":
        recommendations.push("Integrar sistema financeiro com ferramenta PPM");
        break;
      case "Integrações Críticas":
        recommendations.push("Mapear e implementar integrações prioritárias identificadas");
        break;
    }
  }
  
  return recommendations;
}

// Função principal de análise
export function analyzeAnswers(config: PpmConfig, answers: FormAnswers): AnalysisResult {
  // Calcular scores por categoria
  const categories = [...new Set(QUESTION_WEIGHTS.map(w => w.category))];
  const categoryScores = categories.map(category => 
    calculateCategoryScore(config, answers, category)
  );
  
  // Calcular score geral
  const totalScore = categoryScores.reduce((sum, cat) => sum + (cat.score * cat.weight), 0);
  const totalMaxScore = categoryScores.reduce((sum, cat) => sum + (cat.maxScore * cat.weight), 0);
  
  const overallScore: ScoreResult = {
    score: totalScore,
    maxScore: totalMaxScore,
    percentage: totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0,
    category: "Geral"
  };
  
  // Calcular scores por tipo de análise
  const satisfactionScore = calculateAnalysisTypeScore(config, answers, "satisfaction");
  const functionalityScore = calculateAnalysisTypeScore(config, answers, "functionality");
  const integrationScore = calculateAnalysisTypeScore(config, answers, "integration");
  const usageScore = calculateAnalysisTypeScore(config, answers, "usage");
  
  // Gerar insights e recomendações
  const insights = generateInsights(categoryScores, satisfactionScore, functionalityScore, integrationScore);
  const recommendations = generateRecommendations(categoryScores, satisfactionScore, functionalityScore, integrationScore);
  
  return {
    overallScore,
    categoryScores: categoryScores.sort((a, b) => b.percentage - a.percentage),
    satisfactionScore,
    functionalityScore,
    integrationScore,
    usageScore,
    insights,
    recommendations
  };
}