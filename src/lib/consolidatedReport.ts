import type { PpmConfig, FormAnswers, PpmMeta } from "./types";
import { analyzeAnswers, type AnalysisResult } from "./analysis";
import { QUESTION_WEIGHTS, CATEGORY_WEIGHTS } from "./weights";

export interface ConsolidatedReportData {
  // Metadados
  metadata: {
    generated_at: string;
    respondent_info: PpmMeta;
    total_questions: number;
    answered_questions: number;
    completion_rate: number;
  };
  
  // Scores e análises
  analysis: AnalysisResult;
  
  // Respostas detalhadas
  detailed_responses: DetailedResponse[];
  
  // Resumo por categoria
  category_summary: CategorySummary[];
  
  // Recomendações priorizadas
  prioritized_recommendations: PrioritizedRecommendation[];
}

export interface DetailedResponse {
  form_id: string;
  form_title: string;
  question_id: string;
  question_text: string;
  question_type: string;
  category: string;
  weight: number;
  raw_answer: string | string[];
  numeric_score: number;
  max_possible_score: number;
  score_percentage: number;
}

export interface CategorySummary {
  category: string;
  total_questions: number;
  answered_questions: number;
  average_score: number;
  max_score: number;
  score_percentage: number;
  weight: number;
  weighted_score: number;
  status: "Excelente" | "Bom" | "Regular" | "Ruim" | "Crítico";
  key_insights: string[];
}

export interface PrioritizedRecommendation {
  priority: "Alta" | "Média" | "Baixa";
  category: string;
  recommendation: string;
  impact: string;
  effort: string;
  timeline: string;
}

// Gerar relatório consolidado completo
export function generateConsolidatedReport(
  config: PpmConfig,
  answers: FormAnswers,
  meta: PpmMeta
): ConsolidatedReportData {
  const analysis = analyzeAnswers(config, answers);
  
  // Calcular metadados
  const totalQuestions = config.forms.reduce((sum, form) => sum + form.questions.length, 0);
  const answeredQuestions = Object.keys({...answers.f1, ...answers.f2, ...answers.f3}).length;
  
  const metadata = {
    generated_at: new Date().toISOString(),
    respondent_info: meta,
    total_questions: totalQuestions,
    answered_questions: answeredQuestions,
    completion_rate: (answeredQuestions / totalQuestions) * 100
  };
  
  // Gerar respostas detalhadas
  const detailed_responses = generateDetailedResponses(config, answers);
  
  // Gerar resumo por categoria
  const category_summary = generateCategorySummary(analysis.categoryScores);
  
  // Gerar recomendações priorizadas
  const prioritized_recommendations = generatePrioritizedRecommendations(analysis);
  
  return {
    metadata,
    analysis,
    detailed_responses,
    category_summary,
    prioritized_recommendations
  };
}

// Gerar respostas detalhadas com scores
function generateDetailedResponses(config: PpmConfig, answers: FormAnswers): DetailedResponse[] {
  const responses: DetailedResponse[] = [];
  
  for (const form of config.forms) {
    const formAnswers = answers[form.id] || {};
    
    for (const question of form.questions) {
      const weightConfig = QUESTION_WEIGHTS.find(w => w.questionId === question.id);
      const answer = formAnswers[question.id];
      
      const numericScore = getNumericValue(answer, question);
      const maxScore = getMaxValue(question);
      
      responses.push({
        form_id: form.id,
        form_title: form.title,
        question_id: question.id,
        question_text: question.pergunta,
        question_type: question.tipo,
        category: weightConfig?.category || "Sem Categoria",
        weight: weightConfig?.weight || 1,
        raw_answer: answer || "",
        numeric_score: numericScore,
        max_possible_score: maxScore,
        score_percentage: maxScore > 0 ? (numericScore / maxScore) * 100 : 0
      });
    }
  }
  
  return responses;
}

// Gerar resumo por categoria
function generateCategorySummary(categoryScores: any[]): CategorySummary[] {
  return categoryScores.map(cat => {
    const status = getStatusLabel(cat.percentage);
    const insights = generateCategoryInsights(cat.category, cat.percentage);
    
    return {
      category: cat.category,
      total_questions: cat.questionCount,
      answered_questions: cat.questionCount, // Assumindo que todas foram respondidas
      average_score: cat.score / cat.questionCount,
      max_score: cat.maxScore / cat.questionCount,
      score_percentage: cat.percentage,
      weight: cat.weight,
      weighted_score: cat.score * cat.weight,
      status,
      key_insights: insights
    };
  });
}

// Gerar recomendações priorizadas
function generatePrioritizedRecommendations(analysis: AnalysisResult): PrioritizedRecommendation[] {
  const recommendations: PrioritizedRecommendation[] = [];
  
  // Recomendações de alta prioridade (scores < 50%)
  const criticalCategories = analysis.categoryScores.filter(c => c.percentage < 50 && c.weight >= 4);
  
  for (const category of criticalCategories.slice(0, 3)) {
    recommendations.push({
      priority: "Alta",
      category: category.category,
      recommendation: getSpecificRecommendation(category.category, "high"),
      impact: "Alto",
      effort: getEffortEstimate(category.category),
      timeline: "3-6 meses"
    });
  }
  
  // Recomendações de média prioridade (scores 50-70%)
  const mediumCategories = analysis.categoryScores.filter(c => c.percentage >= 50 && c.percentage < 70);
  
  for (const category of mediumCategories.slice(0, 2)) {
    recommendations.push({
      priority: "Média",
      category: category.category,
      recommendation: getSpecificRecommendation(category.category, "medium"),
      impact: "Médio",
      effort: getEffortEstimate(category.category),
      timeline: "6-12 meses"
    });
  }
  
  return recommendations;
}

// Funções auxiliares
function getNumericValue(answer: string | string[], question: any): number {
  if (!answer) return 0;
  
  const answerStr = Array.isArray(answer) ? answer.join(";") : answer;
  
  if (question.tipo === "escala_0_10") {
    const num = parseInt(answerStr);
    return isNaN(num) ? 0 : num;
  }
  
  if (question.tipo === "escala_1_5") {
    const num = parseInt(answerStr);
    return isNaN(num) ? 0 : num;
  }
  
  if (question.tipo.includes("sim/não")) {
    if (answerStr.toLowerCase().includes("sim")) return 5;
    if (answerStr.toLowerCase().includes("parcialmente")) return 3;
    if (answerStr.toLowerCase().includes("não")) return 1;
    return 0;
  }
  
  if (question.tipo === "multipla") {
    if (Array.isArray(answer)) {
      return Math.min(answer.length, 5);
    }
    return answerStr.split(";").length;
  }
  
  return answerStr.trim().length > 0 ? 3 : 0;
}

function getMaxValue(question: any): number {
  if (question.tipo === "escala_0_10") return 10;
  if (question.tipo === "escala_1_5") return 5;
  if (question.tipo.includes("sim/não")) return 5;
  if (question.tipo === "multipla") return 5;
  return 5;
}

function getStatusLabel(percentage: number): "Excelente" | "Bom" | "Regular" | "Ruim" | "Crítico" {
  if (percentage >= 80) return "Excelente";
  if (percentage >= 70) return "Bom";
  if (percentage >= 60) return "Regular";
  if (percentage >= 40) return "Ruim";
  return "Crítico";
}

function generateCategoryInsights(category: string, percentage: number): string[] {
  const insights: string[] = [];
  
  if (percentage < 50) {
    insights.push(`${category} requer atenção imediata`);
    insights.push("Impacto significativo na eficiência operacional");
  } else if (percentage < 70) {
    insights.push(`${category} tem potencial de melhoria`);
    insights.push("Oportunidade de otimização identificada");
  } else {
    insights.push(`${category} está funcionando bem`);
    insights.push("Manter práticas atuais");
  }
  
  return insights;
}

function getSpecificRecommendation(category: string, priority: "high" | "medium"): string {
  const recommendations: Record<string, Record<string, string>> = {
    "Business Intelligence": {
      high: "Implementar dashboards executivos com KPIs em tempo real",
      medium: "Melhorar relatórios existentes com mais visualizações"
    },
    "Visão de Portfólio": {
      high: "Configurar visão consolidada de múltiplos projetos com priorização",
      medium: "Otimizar filtros e agrupamentos na visão atual"
    },
    "Controle Orçamentário": {
      high: "Integrar sistema financeiro com ferramenta PPM para controle em tempo real",
      medium: "Implementar alertas de desvio orçamentário"
    },
    "Integrações Críticas": {
      high: "Desenvolver integrações prioritárias identificadas na pesquisa",
      medium: "Automatizar transferência de dados entre sistemas principais"
    }
  };
  
  return recommendations[category]?.[priority] || `Melhorar ${category} conforme análise detalhada`;
}

function getEffortEstimate(category: string): string {
  const highEffortCategories = ["Business Intelligence", "Integrações Críticas"];
  const mediumEffortCategories = ["Visão de Portfólio", "Controle Orçamentário"];
  
  if (highEffortCategories.includes(category)) return "Alto";
  if (mediumEffortCategories.includes(category)) return "Médio";
  return "Baixo";
}

// Exportar para CSV expandido
export function exportConsolidatedReportToCsv(reportData: ConsolidatedReportData): string {
  const sections: string[] = [];
  
  // Seção 1: Metadados
  sections.push("=== METADADOS ===");
  sections.push(`Data de Geração,${reportData.metadata.generated_at}`);
  sections.push(`Total de Perguntas,${reportData.metadata.total_questions}`);
  sections.push(`Perguntas Respondidas,${reportData.metadata.answered_questions}`);
  sections.push(`Taxa de Conclusão,${reportData.metadata.completion_rate.toFixed(1)}%`);
  sections.push("");
  
  // Seção 2: Scores Gerais
  sections.push("=== SCORES GERAIS ===");
  sections.push(`Score Geral,${reportData.analysis.overallScore.percentage.toFixed(1)}%`);
  sections.push(`Satisfação,${reportData.analysis.satisfactionScore.percentage.toFixed(1)}%`);
  sections.push(`Funcionalidades,${reportData.analysis.functionalityScore.percentage.toFixed(1)}%`);
  sections.push(`Integração,${reportData.analysis.integrationScore.percentage.toFixed(1)}%`);
  sections.push(`Uso e Adoção,${reportData.analysis.usageScore.percentage.toFixed(1)}%`);
  sections.push("");
  
  // Seção 3: Resumo por Categoria
  sections.push("=== RESUMO POR CATEGORIA ===");
  sections.push("Categoria,Score,Status,Peso,Perguntas,Insights");
  for (const cat of reportData.category_summary) {
    sections.push(`"${cat.category}",${cat.score_percentage.toFixed(1)}%,${cat.status},${cat.weight},${cat.total_questions},"${cat.key_insights.join('; ')}"`);
  }
  sections.push("");
  
  // Seção 4: Recomendações
  sections.push("=== RECOMENDAÇÕES PRIORIZADAS ===");
  sections.push("Prioridade,Categoria,Recomendação,Impacto,Esforço,Timeline");
  for (const rec of reportData.prioritized_recommendations) {
    sections.push(`${rec.priority},"${rec.category}","${rec.recommendation}",${rec.impact},${rec.effort},${rec.timeline}`);
  }
  sections.push("");
  
  // Seção 5: Respostas Detalhadas
  sections.push("=== RESPOSTAS DETALHADAS ===");
  sections.push("Formulário,Pergunta,Categoria,Peso,Resposta,Score,Score%");
  for (const resp of reportData.detailed_responses) {
    const answer = Array.isArray(resp.raw_answer) ? resp.raw_answer.join("; ") : resp.raw_answer;
    sections.push(`"${resp.form_title}","${resp.question_text}","${resp.category}",${resp.weight},"${answer}",${resp.numeric_score},${resp.score_percentage.toFixed(1)}%`);
  }
  
  return sections.join("\n");
}