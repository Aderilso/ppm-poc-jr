import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Star, 
  ThumbsUp, 
  TrendingUp, 
  Clock, 
  Target, 
  BarChart3, 
  RefreshCw,
  Upload,
  CheckCircle,
  AlertTriangle,
  Zap
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { loadConfig, loadAnswers, loadMeta } from "@/lib/storage";
import type { PpmConfig, FormAnswers, PpmMeta } from "@/lib/types";

interface DashboardMetric {
  title: string;
  value: string | number;
  subtitle?: string;
  percentage?: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function Dashboard() {
  const [config, setConfig] = useState<PpmConfig | null>(null);
  const [answers, setAnswers] = useState<FormAnswers>({ f1: {}, f2: {}, f3: {} });
  const [meta, setMeta] = useState<PpmMeta>({ is_interviewer: false });
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);

  useEffect(() => {
    const configData = loadConfig();
    setConfig(configData);
    const answersData = {
      f1: loadAnswers("f1"),
      f2: loadAnswers("f2"), 
      f3: loadAnswers("f3"),
    };
    setAnswers(answersData);
    setMeta(loadMeta());
    
    if (configData) {
      calculateMetrics(configData, answersData);
    }
  }, []);

  const calculateMetrics = (config: PpmConfig, answers: FormAnswers) => {
    const calculatedMetrics: DashboardMetric[] = [];

    // 1. Total de Entrevistados/Respondentes
    const totalRespondents = getTotalRespondents(answers);
    calculatedMetrics.push({
      title: "Total de",
      subtitle: "Respondentes",
      value: totalRespondents,
      icon: <Users className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    });

    // 2. Questionários Concluídos
    const completedForms = getCompletedForms(config, answers);
    calculatedMetrics.push({
      title: "Concluídos",
      value: completedForms.completed,
      subtitle: `${completedForms.total} formulários`,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    });

    // 3. Avaliação Média das Ferramentas (f1_q14 - nota 0-10)
    const toolsRating = getAverageToolsRating(answers);
    calculatedMetrics.push({
      title: "Avaliação Média",
      subtitle: "Ferramentas Atuais",
      value: `${toolsRating.average}/10`,
      percentage: toolsRating.percentage,
      icon: <Star className="w-6 h-6" />,
      color: toolsRating.percentage >= 70 ? "text-yellow-600" : toolsRating.percentage >= 50 ? "text-orange-600" : "text-red-600",
      bgColor: toolsRating.percentage >= 70 ? "bg-yellow-50 dark:bg-yellow-950/20" : toolsRating.percentage >= 50 ? "bg-orange-50 dark:bg-orange-950/20" : "bg-red-50 dark:bg-red-950/20"
    });

    // 4. Índice de Aprovação (f1_q15 - recomendaria?)
    const approvalRate = getApprovalRate(answers);
    calculatedMetrics.push({
      title: "Índice de",
      subtitle: "Aprovação",
      value: `${approvalRate.percentage.toFixed(1)}%`,
      percentage: approvalRate.percentage,
      icon: <ThumbsUp className="w-6 h-6" />,
      color: approvalRate.percentage >= 70 ? "text-green-600" : approvalRate.percentage >= 50 ? "text-yellow-600" : "text-red-600",
      bgColor: approvalRate.percentage >= 70 ? "bg-green-50 dark:bg-green-950/20" : approvalRate.percentage >= 50 ? "bg-yellow-50 dark:bg-yellow-950/20" : "bg-red-50 dark:bg-red-950/20"
    });

    // 5. Produtividade Média (f1_q11 - ferramenta aumenta produtividade?)
    const productivityScore = getProductivityScore(answers);
    calculatedMetrics.push({
      title: "Impacto na",
      subtitle: "Produtividade",
      value: `${productivityScore.average.toFixed(1)}/5`,
      percentage: productivityScore.percentage,
      icon: <TrendingUp className="w-6 h-6" />,
      color: productivityScore.percentage >= 70 ? "text-green-600" : productivityScore.percentage >= 50 ? "text-yellow-600" : "text-red-600",
      bgColor: productivityScore.percentage >= 70 ? "bg-green-50 dark:bg-green-950/20" : productivityScore.percentage >= 50 ? "bg-yellow-50 dark:bg-yellow-950/20" : "bg-red-50 dark:bg-red-950/20"
    });

    // 6. Uso Diário (f1_q06 - utiliza diariamente?)
    const dailyUsage = getDailyUsageRate(answers);
    calculatedMetrics.push({
      title: "Uso Diário",
      value: `${dailyUsage.percentage.toFixed(1)}%`,
      percentage: dailyUsage.percentage,
      icon: <Clock className="w-6 h-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    });

    // 7. Necessidade de Integração (f3_q02 - frequência de acesso a múltiplos sistemas)
    const integrationNeed = getIntegrationNeed(answers);
    calculatedMetrics.push({
      title: "Necessidade de",
      subtitle: "Integração",
      value: `${integrationNeed.percentage.toFixed(1)}%`,
      percentage: integrationNeed.percentage,
      icon: <Zap className="w-6 h-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    });

    // 8. Satisfação com BI/Dashboards (f2_q11)
    const biSatisfaction = getBISatisfaction(answers);
    calculatedMetrics.push({
      title: "Satisfação com",
      subtitle: "Dashboards/BI",
      value: `${biSatisfaction.average.toFixed(1)}/5`,
      percentage: biSatisfaction.percentage,
      icon: <BarChart3 className="w-6 h-6" />,
      color: biSatisfaction.percentage >= 70 ? "text-blue-600" : biSatisfaction.percentage >= 50 ? "text-yellow-600" : "text-red-600",
      bgColor: biSatisfaction.percentage >= 70 ? "bg-blue-50 dark:bg-blue-950/20" : biSatisfaction.percentage >= 50 ? "bg-yellow-50 dark:bg-yellow-950/20" : "bg-red-50 dark:bg-red-950/20"
    });

    setMetrics(calculatedMetrics);
  };

  // Funções de cálculo das métricas
  const getTotalRespondents = (answers: FormAnswers): number => {
    const allAnswers = { ...answers.f1, ...answers.f2, ...answers.f3 };
    return Object.keys(allAnswers).length > 0 ? 1 : 0; // Por enquanto, 1 respondente por sessão
  };

  const getCompletedForms = (config: PpmConfig, answers: FormAnswers) => {
    let completed = 0;
    const total = config.forms.length;
    
    config.forms.forEach(form => {
      const formAnswers = answers[form.id];
      const answeredQuestions = form.questions.filter(q => formAnswers[q.id]).length;
      const completionRate = answeredQuestions / form.questions.length;
      if (completionRate >= 0.8) completed++; // 80% das perguntas respondidas = concluído
    });
    
    return { completed, total };
  };

  const getAverageToolsRating = (answers: FormAnswers) => {
    const ratings = answers.f1["f1_q14"]; // Nota de 0 a 10
    if (!ratings) return { average: 0, percentage: 0 };
    
    const rating = parseInt(String(ratings));
    if (isNaN(rating)) return { average: 0, percentage: 0 };
    
    return {
      average: rating,
      percentage: (rating / 10) * 100
    };
  };

  const getApprovalRate = (answers: FormAnswers) => {
    const recommendation = answers.f1["f1_q15"]; // Recomendaria?
    if (!recommendation) return { percentage: 0 };
    
    const wouldRecommend = String(recommendation).toLowerCase().includes("sim");
    return { percentage: wouldRecommend ? 100 : 0 };
  };

  const getProductivityScore = (answers: FormAnswers) => {
    const productivity = answers.f1["f1_q11"]; // Escala 1-5
    if (!productivity) return { average: 0, percentage: 0 };
    
    const score = parseInt(String(productivity));
    if (isNaN(score)) return { average: 0, percentage: 0 };
    
    return {
      average: score,
      percentage: (score / 5) * 100
    };
  };

  const getDailyUsageRate = (answers: FormAnswers) => {
    const dailyUse = answers.f1["f1_q06"]; // Utiliza diariamente?
    if (!dailyUse) return { percentage: 0 };
    
    const useDaily = String(dailyUse).toLowerCase().includes("sim");
    return { percentage: useDaily ? 100 : 0 };
  };

  const getIntegrationNeed = (answers: FormAnswers) => {
    const frequency = answers.f3["f3_q02"]; // Frequência de acesso a múltiplos sistemas
    if (!frequency) return { percentage: 0 };
    
    const score = parseInt(String(frequency));
    if (isNaN(score)) return { percentage: 0 };
    
    return { percentage: (score / 5) * 100 };
  };

  const getBISatisfaction = (answers: FormAnswers) => {
    const biScore = answers.f2["f2_q11"]; // Dashboards úteis?
    if (!biScore) return { average: 0, percentage: 0 };
    
    const score = parseInt(String(biScore));
    if (isNaN(score)) return { average: 0, percentage: 0 };
    
    return {
      average: score,
      percentage: (score / 5) * 100
    };
  };

  const handleRefresh = () => {
    if (config) {
      const answersData = {
        f1: loadAnswers("f1"),
        f2: loadAnswers("f2"), 
        f3: loadAnswers("f3"),
      };
      setAnswers(answersData);
      calculateMetrics(config, answersData);
    }
  };

  if (!config) {
    return (
      <Layout>
        <div className="text-center">
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Dashboard PPM</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie todos os indicadores da pesquisa
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button className="ppm-button-accent flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Nova Pesquisa
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <Card key={index} className={`ppm-card ${metric.bgColor} border-l-4 border-l-current`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`${metric.color} mb-2`}>
                      {metric.icon}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {metric.title}
                      </p>
                      {metric.subtitle && (
                        <p className="text-xs text-muted-foreground">
                          {metric.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${metric.color}`}>
                      {metric.value}
                    </div>
                    {metric.percentage !== undefined && (
                      <div className="mt-2">
                        <Progress 
                          value={metric.percentage} 
                          className="h-2 w-16" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status Summary */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="ppm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Status Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Formulário 1 - Avaliação Geral</span>
                  <Badge variant={Object.keys(answers.f1).length > 0 ? "default" : "secondary"}>
                    {Object.keys(answers.f1).length > 0 ? "Respondido" : "Pendente"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Formulário 2 - Funcionalidades</span>
                  <Badge variant={Object.keys(answers.f2).length > 0 ? "default" : "secondary"}>
                    {Object.keys(answers.f2).length > 0 ? "Respondido" : "Pendente"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Formulário 3 - Integração</span>
                  <Badge variant={Object.keys(answers.f3).length > 0 ? "default" : "secondary"}>
                    {Object.keys(answers.f3).length > 0 ? "Respondido" : "Pendente"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="ppm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.find(m => m.title.includes("Aprovação") && m.percentage && m.percentage < 50) && (
                  <div className="text-sm text-yellow-600">
                    • Baixo índice de aprovação das ferramentas
                  </div>
                )}
                {metrics.find(m => m.title.includes("Produtividade") && m.percentage && m.percentage < 50) && (
                  <div className="text-sm text-yellow-600">
                    • Ferramentas não estão aumentando produtividade
                  </div>
                )}
                {metrics.find(m => m.title.includes("Integração") && m.percentage && m.percentage > 70) && (
                  <div className="text-sm text-orange-600">
                    • Alta necessidade de integração entre sistemas
                  </div>
                )}
                {!metrics.some(m => (m.percentage && m.percentage < 50) || (m.title.includes("Integração") && m.percentage && m.percentage > 70)) && (
                  <div className="text-sm text-green-600">
                    • Nenhum alerta crítico identificado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="ppm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Próximos Passos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {Object.keys(answers.f1).length === 0 && (
                  <div>• Completar Avaliação Geral</div>
                )}
                {Object.keys(answers.f2).length === 0 && (
                  <div>• Completar Análise de Funcionalidades</div>
                )}
                {Object.keys(answers.f3).length === 0 && (
                  <div>• Completar Necessidades de Integração</div>
                )}
                {Object.keys(answers.f1).length > 0 && Object.keys(answers.f2).length > 0 && Object.keys(answers.f3).length > 0 && (
                  <div className="text-green-600">• Visualizar Relatório Final</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}