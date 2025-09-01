import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Lightbulb } from "lucide-react";
import type { AnalysisResult } from "@/lib/analysis";

interface AnalysisReportProps {
  analysis: AnalysisResult;
}

export function AnalysisReport({ analysis }: AnalysisReportProps) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (percentage >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return "Excelente";
    if (percentage >= 70) return "Bom";
    if (percentage >= 60) return "Regular";
    if (percentage >= 40) return "Ruim";
    return "Crítico";
  };

  return (
    <div className="space-y-6">
      {/* Score Geral */}
      <Card className="ppm-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Score Geral da Avaliação PPM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getScoreIcon(analysis.overallScore.percentage)}
              <div>
                <div className="text-3xl font-bold">
                  {analysis.overallScore.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {getScoreLabel(analysis.overallScore.percentage)}
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {analysis.overallScore.score.toFixed(0)} / {analysis.overallScore.maxScore.toFixed(0)} pontos
            </div>
          </div>
          <Progress value={analysis.overallScore.percentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Scores por Dimensão */}
      <Card className="ppm-card">
        <CardHeader>
          <CardTitle>Análise por Dimensão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "Satisfação", data: analysis.satisfactionScore, icon: "😊" },
              { label: "Funcionalidades", data: analysis.functionalityScore, icon: "⚙️" },
              { label: "Integração", data: analysis.integrationScore, icon: "🔗" },
              { label: "Uso e Adoção", data: analysis.usageScore, icon: "📈" }
            ].map(({ label, data, icon }) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className="font-medium">{label}</span>
                  </div>
                  <div className={`font-bold ${getScoreColor(data.percentage)}`}>
                    {data.percentage.toFixed(1)}%
                  </div>
                </div>
                <Progress value={data.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {data.score.toFixed(0)} / {data.maxScore.toFixed(0)} pontos
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top 5 Categorias */}
      <Card className="ppm-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ranking por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.categoryScores.slice(0, 8).map((category, index) => (
              <div key={category.category} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{category.category}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={category.percentage >= 70 ? "default" : category.percentage >= 50 ? "secondary" : "destructive"}>
                        {category.percentage.toFixed(1)}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Peso: {category.weight}
                      </span>
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {category.questionCount} perguntas • {category.score.toFixed(0)}/{category.maxScore.toFixed(0)} pontos
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="ppm-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Principais Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold text-xs mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="ppm-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Recomendações Estratégicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 font-bold text-xs mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}