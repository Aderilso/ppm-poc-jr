import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Zap,
  PieChart,
  Activity,
  Calendar,
  UserCheck,
  UserX,
  Building,
  Briefcase,
  Thermometer,
  Award,
  Lightbulb
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { interviewsApi } from "@/lib/api";
import { interviewKeys } from "@/hooks/useInterview";
import type { ApiInterview } from "@/lib/api";

interface DashboardMetric {
  title: string;
  value: string | number;
  subtitle?: string;
  percentage?: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface OperationalMetrics {
  totalInvited: number;
  totalStarted: number;
  totalCompleted: number;
  completionRate: number;
  averageResponseTime: number;
  dropoutRate: number;
  departmentDistribution: Record<string, number>;
  roleDistribution: Record<string, number>;
  formProgress: {
    f1: { started: number; completed: number; rate: number };
    f2: { started: number; completed: number; rate: number };
    f3: { started: number; completed: number; rate: number };
  };
}

interface AnalyticalMetrics {
  npsScore: number;
  npsCategory: string;
  averageSatisfaction: number;
  productivityImpact: number;
  dailyUsageRate: number;
  functionalityHeatmap: Record<string, number>;
  topIntegrationSystems: Array<{ name: string; count: number }>;
  topImprovements: Array<{ text: string; count: number }>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [operationalMetrics, setOperationalMetrics] = useState<OperationalMetrics | null>(null);
  const [analyticalMetrics, setAnalyticalMetrics] = useState<AnalyticalMetrics | null>(null);

  // Buscar entrevistas do banco de dados
  const { data: interviews = [], isLoading, refetch } = useQuery({
    queryKey: interviewKeys.lists(),
    queryFn: interviewsApi.getAll,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  useEffect(() => {
    console.log("🔍 Dashboard - Entrevistas carregadas:", interviews.length);
    if (interviews.length > 0) {
      console.log("🔍 Dashboard - Dados das entrevistas:", interviews.map(i => ({
        id: i.id,
        isCompleted: i.isCompleted,
        hasF1: !!i.f1Answers,
        hasF2: !!i.f2Answers,
        hasF3: !!i.f3Answers,
        createdAt: i.createdAt
      })));
      calculateOperationalMetrics(interviews);
      calculateAnalyticalMetrics(interviews);
    } else {
      console.log("🔍 Dashboard - Nenhuma entrevista encontrada");
      // Limpar métricas quando não há entrevistas
      setOperationalMetrics(null);
      setAnalyticalMetrics(null);
    }
  }, [interviews]);

  const calculateOperationalMetrics = (interviews: ApiInterview[]) => {
    const totalInvited = interviews.length;
    const totalStarted = interviews.filter(i => i.f1Answers || i.f2Answers || i.f3Answers).length;
    const totalCompleted = interviews.filter(i => i.isCompleted).length;
    
    // Calcular taxa de conclusão
    const completionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;
    
    // Calcular tempo médio de resposta (em minutos)
    const completedInterviews = interviews.filter(i => i.isCompleted && i.completedAt);
    const totalResponseTime = completedInterviews.reduce((total, interview) => {
      const startTime = new Date(interview.createdAt);
      const endTime = new Date(interview.completedAt!);
      return total + (endTime.getTime() - startTime.getTime());
    }, 0);
    const averageResponseTime = completedInterviews.length > 0 
      ? Math.round(totalResponseTime / completedInterviews.length / (1000 * 60))
      : 0;
    
    // Calcular taxa de desistência
    const dropoutRate = totalStarted > 0 ? ((totalStarted - totalCompleted) / totalStarted) * 100 : 0;
    
    // Distribuição por departamento
    const departmentDistribution: Record<string, number> = {};
    interviews.forEach(interview => {
      if (interview.respondentDepartment) {
        departmentDistribution[interview.respondentDepartment] = 
          (departmentDistribution[interview.respondentDepartment] || 0) + 1;
      }
    });
    
    // Distribuição por cargo (extraído de f1_q02)
    const roleDistribution: Record<string, number> = {};
    interviews.forEach(interview => {
      if (interview.f1Answers?.f1_q02) {
        const role = interview.f1Answers.f1_q02;
        roleDistribution[role] = (roleDistribution[role] || 0) + 1;
      }
    });
    
    // Progresso por formulário
    const hasAnyAnswer = (ans?: Record<string, any>) => !!ans && Object.keys(ans).length > 0;

    const formProgress = {
      f1: {
        started: interviews.filter(i => hasAnyAnswer(i.f1Answers)).length,
        completed: interviews.filter(i => hasAnyAnswer(i.f1Answers) && i.isCompleted).length,
        rate: 0
      },
      f2: {
        started: interviews.filter(i => hasAnyAnswer(i.f2Answers)).length,
        completed: interviews.filter(i => hasAnyAnswer(i.f2Answers) && i.isCompleted).length,
        rate: 0
      },
      f3: {
        started: interviews.filter(i => hasAnyAnswer(i.f3Answers)).length,
        completed: interviews.filter(i => hasAnyAnswer(i.f3Answers) && i.isCompleted).length,
        rate: 0
      }
    };
    
    // Calcular taxas de conclusão por formulário
    formProgress.f1.rate = formProgress.f1.started > 0 ? (formProgress.f1.completed / formProgress.f1.started) * 100 : 0;
    formProgress.f2.rate = formProgress.f2.started > 0 ? (formProgress.f2.completed / formProgress.f2.started) * 100 : 0;
    formProgress.f3.rate = formProgress.f3.started > 0 ? (formProgress.f3.completed / formProgress.f3.started) * 100 : 0;
    
    setOperationalMetrics({
      totalInvited,
      totalStarted,
      totalCompleted,
      completionRate,
      averageResponseTime,
      dropoutRate,
      departmentDistribution,
      roleDistribution,
      formProgress
    });
  };

  const calculateAnalyticalMetrics = (interviews: ApiInterview[]) => {
    const completedInterviews = interviews.filter(i => i.isCompleted);
    
    // NPS Score (f1_q15 - recomendaria?)
    const promoters = completedInterviews.filter(i => 
      i.f1Answers?.f1_q15 && String(i.f1Answers.f1_q15).toLowerCase().includes('sim')
    ).length;
    const detractors = completedInterviews.filter(i => 
      i.f1Answers?.f1_q15 && String(i.f1Answers.f1_q15).toLowerCase().includes('não')
    ).length;
    const npsScore = completedInterviews.length > 0 
      ? Math.round(((promoters - detractors) / completedInterviews.length) * 100)
      : 0;
    
    // Categorizar NPS
    let npsCategory = "Neutro";
    if (npsScore >= 50) npsCategory = "Excelente";
    else if (npsScore >= 0) npsCategory = "Bom";
    else if (npsScore >= -50) npsCategory = "Ruim";
    else npsCategory = "Crítico";
    
    // Satisfação Geral Média (f1_q14 - nota 0-10)
    const satisfactionScores = completedInterviews
      .map(i => i.f1Answers?.f1_q14)
      .filter(score => score !== undefined && !isNaN(Number(score)))
      .map(score => Number(score));
    const averageSatisfaction = satisfactionScores.length > 0 
      ? satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
      : 0;
    
    // Impacto na Produtividade (f1_q11 - escala 1-5)
    const productivityScores = completedInterviews
      .map(i => i.f1Answers?.f1_q11)
      .filter(score => score !== undefined && !isNaN(Number(score)))
      .map(score => Number(score));
    const productivityImpact = productivityScores.length > 0 
      ? productivityScores.reduce((sum, score) => sum + score, 0) / productivityScores.length
      : 0;
    
    // Uso Diário (f1_q06 - utiliza diariamente?)
    const dailyUsers = completedInterviews.filter(i => 
      i.f1Answers?.f1_q06 && String(i.f1Answers.f1_q06).toLowerCase().includes('sim')
    ).length;
    const dailyUsageRate = completedInterviews.length > 0 
      ? (dailyUsers / completedInterviews.length) * 100
      : 0;
    
    // Heatmap de Funcionalidades (F2)
    const functionalityHeatmap: Record<string, number> = {};
    const functionalityQuestions = ['f2_q01', 'f2_q02', 'f2_q03', 'f2_q04', 'f2_q05'];
    const categories = ['Dashboards e Relatórios', 'Gestão de Recursos', 'Colaboração', 'Planejamento', 'Análise'];
    
    functionalityQuestions.forEach((question, index) => {
      const scores = completedInterviews
        .map(i => i.f2Answers?.[question])
        .filter(score => score !== undefined && !isNaN(Number(score)))
        .map(score => Number(score));
      
      if (scores.length > 0) {
        functionalityHeatmap[categories[index]] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      }
    });
    
    // Top 5 Sistemas para Integração (F3)
    const integrationSystems: Record<string, number> = {};
    completedInterviews.forEach(interview => {
      if (interview.f3Answers?.f3_q01) {
        const systems = Array.isArray(interview.f3Answers.f3_q01) 
          ? interview.f3Answers.f3_q01 
          : [interview.f3Answers.f3_q01];
        
        systems.forEach(system => {
          integrationSystems[system] = (integrationSystems[system] || 0) + 1;
        });
      }
    });
    
    const topIntegrationSystems = Object.entries(integrationSystems)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Top 5 Melhorias Sugeridas (respostas abertas)
    const improvements: Record<string, number> = {};
    completedInterviews.forEach(interview => {
      // Buscar respostas abertas que podem conter melhorias
      const openAnswers = [
        interview.f1Answers?.f1_q16,
        interview.f2Answers?.f2_q06,
        interview.f3Answers?.f3_q04
      ].filter(answer => answer && typeof answer === 'string');
      
      openAnswers.forEach(answer => {
        const words = answer.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 3 && !['para', 'com', 'uma', 'das', 'dos', 'que', 'não', 'mais', 'muito', 'bem', 'boa'].includes(word)) {
            improvements[word] = (improvements[word] || 0) + 1;
          }
        });
      });
    });
    
    const topImprovements = Object.entries(improvements)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    setAnalyticalMetrics({
      npsScore,
      npsCategory,
      averageSatisfaction,
      productivityImpact,
      dailyUsageRate,
      functionalityHeatmap,
      topIntegrationSystems,
      topImprovements
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleNewSurvey = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
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
            <h1 className="text-3xl font-bold text-black mb-2">Dashboard PPM</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie todos os indicadores da pesquisa
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button 
              onClick={handleNewSurvey}
              className="ppm-button-accent flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Nova Pesquisa
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="operational" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="operational" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Visão Operacional
            </TabsTrigger>
            <TabsTrigger value="analytical" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Visão Analítica
            </TabsTrigger>
          </TabsList>

          {/* Visão Operacional */}
          <TabsContent value="operational" className="space-y-6">
            {operationalMetrics && (
              <>
                {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="ppm-card bg-blue-50 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                          <div className="text-blue-600 mb-2">
                            <Users className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                              Total de Respondentes
                      </p>
                        <p className="text-xs text-muted-foreground">
                              Convidados / Iniciados / Concluídos
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {operationalMetrics.totalInvited}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {operationalMetrics.totalStarted} iniciados
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {operationalMetrics.totalCompleted} concluídos
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="ppm-card bg-green-50 border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-green-600 mb-2">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              Taxa de Conclusão
                            </p>
                    </div>
                  </div>
                  <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {operationalMetrics.completionRate.toFixed(1)}%
                    </div>
                      <div className="mt-2">
                        <Progress 
                              value={operationalMetrics.completionRate} 
                          className="h-2 w-16" 
                        />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="ppm-card bg-orange-50 border-l-4 border-l-orange-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-orange-600 mb-2">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              Tempo Médio
                            </p>
                            <p className="text-xs text-muted-foreground">
                              de Resposta
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-600">
                            {operationalMetrics.averageResponseTime}min
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="ppm-card bg-red-50 border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-red-600 mb-2">
                            <UserX className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              Taxa de Desistência
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            {operationalMetrics.dropoutRate.toFixed(1)}%
                          </div>
                          <div className="mt-2">
                            <Progress 
                              value={operationalMetrics.dropoutRate} 
                              className="h-2 w-16" 
                            />
                          </div>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>

                {/* Progresso por Formulário */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="ppm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                        <Target className="w-5 h-5 text-blue-600" />
                        Formulário 1 - Avaliação Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                          <span className="text-sm">Iniciados</span>
                          <Badge variant="outline">{operationalMetrics.formProgress.f1.started}</Badge>
                </div>
                <div className="flex items-center justify-between">
                          <span className="text-sm">Concluídos</span>
                          <Badge variant="default">{operationalMetrics.formProgress.f1.completed}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Taxa de Conclusão</span>
                            <span>{operationalMetrics.formProgress.f1.rate.toFixed(1)}%</span>
                          </div>
                          <Progress value={operationalMetrics.formProgress.f1.rate} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

          <Card className="ppm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[1.35rem] leading-tight">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Formulário 2 - Funcionalidades
              </CardTitle>
            </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Iniciados</span>
                          <Badge variant="outline">{operationalMetrics.formProgress.f2.started}</Badge>
                </div>
                <div className="flex items-center justify-between">
                          <span className="text-sm">Concluídos</span>
                          <Badge variant="default">{operationalMetrics.formProgress.f2.completed}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Taxa de Conclusão</span>
                            <span>{operationalMetrics.formProgress.f2.rate.toFixed(1)}%</span>
                          </div>
                          <Progress value={operationalMetrics.formProgress.f2.rate} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="ppm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                        <Zap className="w-5 h-5 text-purple-600" />
                        Formulário 3 - Integração
              </CardTitle>
            </CardHeader>
            <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Iniciados</span>
                          <Badge variant="outline">{operationalMetrics.formProgress.f3.started}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Concluídos</span>
                          <Badge variant="default">{operationalMetrics.formProgress.f3.completed}</Badge>
                        </div>
              <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Taxa de Conclusão</span>
                            <span>{operationalMetrics.formProgress.f3.rate.toFixed(1)}%</span>
                          </div>
                          <Progress value={operationalMetrics.formProgress.f3.rate} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Distribuições */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="ppm-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-blue-600" />
                        Distribuição por Área
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(operationalMetrics.departmentDistribution)
                          .sort(([,a], [,b]) => b - a)
                          .map(([department, count]) => (
                            <div key={department} className="flex items-center justify-between">
                              <span className="text-sm">{department}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="ppm-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-green-600" />
                        Distribuição por Cargo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(operationalMetrics.roleDistribution)
                          .sort(([,a], [,b]) => b - a)
                          .map(([role, count]) => (
                            <div key={role} className="flex items-center justify-between">
                              <span className="text-sm">{role}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                  </div>
              </>
            )}
          </TabsContent>

          {/* Visão Analítica */}
          <TabsContent value="analytical" className="space-y-6">
            {analyticalMetrics && (
              <>
                {/* KPIs Analíticos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="ppm-card bg-yellow-50 border-l-4 border-l-yellow-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-yellow-600 mb-2">
                            <Award className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              NPS Score
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {analyticalMetrics.npsCategory}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-600">
                            {analyticalMetrics.npsScore}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="ppm-card bg-blue-50 border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-blue-600 mb-2">
                            <Star className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              Satisfação Geral
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Média (0-10)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {analyticalMetrics.averageSatisfaction.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="ppm-card bg-green-50 border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-green-600 mb-2">
                            <TrendingUp className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              Impacto na
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Produtividade (1-5)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {analyticalMetrics.productivityImpact.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="ppm-card bg-purple-50 border-l-4 border-l-purple-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-purple-600 mb-2">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              Uso Diário
                            </p>
                            <p className="text-xs text-muted-foreground">
                              % dos respondentes
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">
                            {analyticalMetrics.dailyUsageRate.toFixed(1)}%
                          </div>
                          <div className="mt-2">
                            <Progress 
                              value={analyticalMetrics.dailyUsageRate} 
                              className="h-2 w-16" 
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Heatmap de Funcionalidades */}
                <Card className="ppm-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="w-5 h-5 text-red-600" />
                      Heatmap de Funcionalidades (Formulário 2)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(analyticalMetrics.functionalityHeatmap).map(([category, score]) => (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{category}</span>
                            <span className="text-sm text-muted-foreground">{score.toFixed(1)}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
                              style={{ width: `${(score / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                  </CardContent>
                </Card>

                {/* Top Rankings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="ppm-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-600" />
                        Top 5 Sistemas para Integração
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticalMetrics.topIntegrationSystems.map((system, index) => (
                          <div key={system.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                                {index + 1}
                              </Badge>
                              <span className="text-sm">{system.name}</span>
                  </div>
                            <Badge variant="secondary">{system.count}</Badge>
                  </div>
                        ))}
              </div>
            </CardContent>
          </Card>

          <Card className="ppm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        Top 5 Melhorias Sugeridas
              </CardTitle>
            </CardHeader>
            <CardContent>
                      <div className="space-y-3">
                        {analyticalMetrics.topImprovements.map((improvement, index) => (
                          <div key={improvement.text} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                                {index + 1}
                              </Badge>
                              <span className="text-sm">{improvement.text}</span>
                            </div>
                            <Badge variant="secondary">{improvement.count}</Badge>
                          </div>
                        ))}
              </div>
            </CardContent>
          </Card>
        </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
