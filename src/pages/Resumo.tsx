import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, CheckCircle, BarChart3, Upload } from "lucide-react";
import { Layout } from "@/components/Layout";
import { AnalysisReport } from "@/components/AnalysisReport";
import { CsvImport } from "@/components/CsvImport";
import { loadConfig, loadConfigWithFallback, loadAnswers, loadMeta } from "@/lib/storage";
import { generateCsvData, downloadCsv, generateFileName } from "@/lib/csv";
import { analyzeAnswers } from "@/lib/analysis";
import { generateConsolidatedReport, exportConsolidatedReportToCsv } from "@/lib/consolidatedReport";
import { toast } from "@/hooks/use-toast";
import type { PpmConfig, PpmMeta, FormAnswers, AnalysisResult } from "@/lib/types";

export default function Resumo() {
  const [config, setConfig] = useState<PpmConfig | null>(null);
  const [answers, setAnswers] = useState<FormAnswers>({ f1: {}, f2: {}, f3: {} });
  const [meta, setMeta] = useState<PpmMeta>({ is_interviewer: false });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const loadData = () => {
    const configData = loadConfig();
    setConfig(configData);
    const answersData = {
      f1: loadAnswers("f1"),
      f2: loadAnswers("f2"), 
      f3: loadAnswers("f3"),
    };
    setAnswers(answersData);
    setMeta(loadMeta());
    
    // Gerar análise se há dados suficientes
    if (configData && (Object.keys(answersData.f1).length > 0 || Object.keys(answersData.f2).length > 0 || Object.keys(answersData.f3).length > 0)) {
      const analysisResult = analyzeAnswers(configData, answersData);
      setAnalysis(analysisResult);
    } else {
      setAnalysis(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleImportSuccess = () => {
    loadData(); // Recarregar dados após importação
    toast({
      title: "Dados atualizados",
      description: "As respostas importadas estão agora disponíveis para visualização e análise.",
    });
  };

  const handleDownload = (formId: "f1" | "f2" | "f3" | "consolidado") => {
    if (!config) return;

    if (formId === "consolidado") {
      // Novo relatório consolidado com análise
      const consolidatedReport = generateConsolidatedReport(config, answers, meta);
      const csvContent = exportConsolidatedReportToCsv(consolidatedReport);
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const filename = `PPM_Relatorio_Consolidado_${new Date().toISOString().slice(0, 16).replace(/[:-]/g, "").replace("T", "-")}.csv`;
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast({
        title: "Relatório Consolidado gerado",
        description: `${filename} baixado com análise completa, scores e recomendações!`,
      });
    } else {
      // Download individual dos formulários (formato original)
      const csvData = generateCsvData(config, formId, answers, meta);
      const filename = generateFileName(formId);
      downloadCsv(csvData, filename);
      
      toast({
        title: "Download realizado",
        description: `Arquivo ${filename} baixado com sucesso!`,
      });
    }
  };

  const getFormStats = (formId: "f1" | "f2" | "f3") => {
    if (!config) return { total: 0, answered: 0 };
    
    const form = config.forms.find(f => f.id === formId);
    if (!form) return { total: 0, answered: 0 };
    
    const formAnswers = answers[formId];
    const answered = form.questions.filter(q => formAnswers[q.id]).length;
    
    return { total: form.questions.length, answered };
  };

  const renderAnswerValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return value.map(v => (
        <Badge key={v} variant="secondary" className="mr-1 mb-1">
          {v}
        </Badge>
      ));
    }
    return value || "-";
  };

  if (!config) {
    return (
      <Layout>
        <div className="text-center">
          <p className="text-muted-foreground">Nenhuma configuração encontrada.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Relatório Final - Avaliação PPM</h1>
          <p className="text-muted-foreground">
            Análise completa com pesos, scores e recomendações estratégicas
          </p>
        </div>

        {/* Meta Information */}
        {meta.is_interviewer && (
          <Card className="ppm-card mb-6 bg-[hsl(var(--ppm-gray))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                Informações da Entrevista
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Entrevistador:</strong> {meta.interviewer_name}
                </div>
                <div>
                  <strong>Respondente:</strong> {meta.respondent_name}
                </div>
                <div>
                  <strong>Departamento:</strong> {meta.respondent_department}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Análise e Scores
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resumo das Respostas
            </TabsTrigger>
            <TabsTrigger value="downloads" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Downloads
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Importar CSV
            </TabsTrigger>
          </TabsList>

          {/* Análise com Pesos */}
          <TabsContent value="analysis" className="mt-6">
            {analysis ? (
              <AnalysisReport analysis={analysis} />
            ) : (
              <Card className="ppm-card">
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    Responda pelo menos algumas perguntas para ver a análise detalhada
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Resumo das Respostas */}
          <TabsContent value="summary" className="mt-6">
            <div className="space-y-6">
              {config.forms.map((form) => {
                const formAnswers = answers[form.id];
                const stats = getFormStats(form.id);
                
                return (
                  <Card key={form.id} className="ppm-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{form.title}</span>
                        <Badge variant={stats.answered === stats.total ? "default" : "secondary"}>
                          {stats.answered}/{stats.total}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {form.questions.map((question) => {
                          const answer = formAnswers[question.id];
                          
                          return (
                            <div key={question.id} className="border-l-4 border-primary/20 pl-4">
                              <h4 className="font-medium text-sm mb-1">
                                {question.pergunta}
                              </h4>
                              <div className="text-sm text-muted-foreground mb-2">
                                Tipo: {question.tipo} | {question.categoria}
                              </div>
                              <div className="text-sm">
                                <strong>Resposta:</strong>{" "}
                                {answer ? renderAnswerValue(answer) : (
                                  <span className="text-muted-foreground italic">Não respondida</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Downloads */}
          <TabsContent value="downloads" className="mt-6">
            <Card className="ppm-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Downloads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {["f1", "f2", "f3"].map((formId) => {
                    const stats = getFormStats(formId as "f1" | "f2" | "f3");
                    const form = config.forms.find(f => f.id === formId);
                    
                    return (
                      <div key={formId}>
                        <Button
                          variant="outline"
                          className="w-full mb-2"
                          onClick={() => handleDownload(formId as "f1" | "f2" | "f3")}
                          disabled={stats.answered === 0}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          CSV {formId.toUpperCase()}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          {form?.title}
                          <br />
                          {stats.answered}/{stats.total} respondidas
                        </p>
                      </div>
                    );
                  })}
                  
                  <div>
                    <Button
                      className="ppm-button-accent w-full mb-2"
                      onClick={() => handleDownload("consolidado")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Relatório Consolidado
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Análise completa com scores,
                      <br />
                      insights e recomendações
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Importar CSV */}
          <TabsContent value="import" className="mt-6">
            {config ? (
              <CsvImport config={config} onImportSuccess={handleImportSuccess} />
            ) : (
              <Card className="ppm-card">
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    Carregue uma configuração primeiro para importar dados CSV
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}