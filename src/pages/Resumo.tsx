import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Upload } from "lucide-react";
import { Layout } from "@/components/Layout";
import { CsvImport } from "@/components/CsvImport";
import { generateCsvData, downloadCsv, generateFileName } from "@/lib/csv";
import { generateConsolidatedReport, exportConsolidatedReportToCsv } from "@/lib/consolidatedReport";
import { consolidateFormInterviews, generateConsolidatedFormCsv, downloadConsolidatedFormCsv } from "@/lib/consolidatedFormExport";
import { toast } from "@/hooks/use-toast";
import { useInterview } from "@/hooks/useInterview";
import { loadConfig } from "@/lib/storage";
import type { PpmConfig, PpmMeta, FormAnswers } from "@/lib/types";

export default function Resumo() {
  const [config, setConfig] = useState<PpmConfig | null>(null);
  
  // Usar hook do banco de dados para entrevista
  const { currentInterview, currentInterviewId } = useInterview();

  // Carregar dados da entrevista atual
  const [currentAnswers, setCurrentAnswers] = useState<FormAnswers>({ f1: {}, f2: {}, f3: {} });
  const [currentMeta, setCurrentMeta] = useState<PpmMeta>({ is_interviewer: false });

  // Carregar configuração
  useEffect(() => {
    const configData = loadConfig();
    setConfig(configData);
  }, []);

  // Carregar dados da entrevista atual quando ela mudar
  useEffect(() => {
    if (currentInterview && config) {
      console.log("🔍 Resumo - Entrevista atual carregada:", currentInterview);
      
      // Carregar respostas dos formulários
      const formAnswers = {
        f1: currentInterview.f1Answers || {},
        f2: currentInterview.f2Answers || {},
        f3: currentInterview.f3Answers || {},
      };
      setCurrentAnswers(formAnswers);
      
      // Carregar metadados
      setCurrentMeta({
        is_interviewer: currentInterview.isInterviewer || false,
        interviewer_name: currentInterview.interviewerName || "",
        respondent_name: currentInterview.respondentName || "",
        respondent_department: currentInterview.respondentDepartment || ""
      });
      
      // Gerar análise se há dados suficientes
      // if (Object.keys(formAnswers.f1).length > 0 || Object.keys(formAnswers.f2).length > 0 || Object.keys(formAnswers.f3).length > 0) {
      //   console.log("🔍 Resumo - Gerando análise com dados:", formAnswers);
      //   const analysisResult = analyzeAnswers(config, formAnswers);
      //   setAnalysis(analysisResult);
      // } else {
      //   console.log("🔍 Resumo - Sem dados suficientes para análise");
      //   setAnalysis(null);
      // }
    }
  }, [currentInterview, config]);

  const handleImportSuccess = () => {
    // Recarregar dados após importação
    // A lógica de recarregar dados da entrevista atual já está no useEffect
    toast({
      title: "Dados atualizados",
      description: "As respostas importadas estão agora disponíveis para visualização e análise.",
    });
  };

  const handleDownload = (formId: "f1" | "f2" | "f3" | "consolidado") => {
    if (!config) return;

    if (formId === "consolidado") {
      // Novo relatório consolidado com análise
      const consolidatedReport = generateConsolidatedReport(config, currentAnswers, currentMeta);
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
      const csvData = generateCsvData(config, formId, currentAnswers, currentMeta);
      const filename = generateFileName(formId);
      downloadCsv(csvData, filename);
      
      toast({
        title: "Download realizado",
        description: `Arquivo ${filename} baixado com sucesso!`,
      });
    }
  };

  const handleConsolidatedDownload = async (formId: "f1" | "f2" | "f3") => {
    if (!config) return;

    try {
      toast({
        title: "Processando...",
        description: "Buscando entrevistas do banco de dados...",
      });

      const { data, stats } = await consolidateFormInterviews(config, formId);
      
      if (data.length === 0) {
        toast({
          title: "Nenhuma entrevista encontrada",
          description: `Não há entrevistas completadas para o formulário ${formId.toUpperCase()}`,
          variant: "destructive",
        });
        return;
      }

      const csvContent = generateConsolidatedFormCsv(data, stats);
      downloadConsolidatedFormCsv(csvContent, formId, stats);

      toast({
        title: "Consolidado gerado!",
        description: `${stats.total_interviews} entrevistas do ${formId.toUpperCase()} consolidadas com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao gerar consolidado:', error);
      toast({
        title: "Erro ao gerar consolidado",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const getFormStats = (formId: "f1" | "f2" | "f3") => {
    if (!config) return { total: 0, answered: 0 };
    
    const form = config.forms.find(f => f.id === formId);
    if (!form) return { total: 0, answered: 0 };
    
    const formAnswers = currentAnswers[formId];
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
        {currentMeta.is_interviewer && (
          <Card className="ppm-card mb-6 bg-[hsl(var(--ppm-gray))]">
                          <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Informações da Entrevista
                </CardTitle>
              </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Entrevistador:</strong> {currentMeta.interviewer_name}
                </div>
                <div>
                  <strong>Respondente:</strong> {currentMeta.respondent_name}
                </div>
                <div>
                  <strong>Departamento:</strong> {currentMeta.respondent_department}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="downloads" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="downloads" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Downloads
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Importar CSV
            </TabsTrigger>
          </TabsList>

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
                <div className="space-y-6">
                  {/* Downloads Individuais */}
                  <div>
                    <h3 className="font-medium mb-3">Downloads Individuais (Entrevista Atual)</h3>
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
                  </div>

                  {/* Downloads Consolidados por Formulário */}
                  <div>
                    <h3 className="font-medium mb-3">Consolidados por Formulário (Todas as Entrevistas)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Para coordenadores: consolida todas as entrevistas do banco de dados por formulário
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      {["f1", "f2", "f3"].map((formId) => {
                        const form = config.forms.find(f => f.id === formId);
                        
                        return (
                          <div key={`consolidated-${formId}`}>
                            <Button
                              variant="default"
                              className="w-full mb-2 bg-green-600 hover:bg-green-700"
                              onClick={() => handleConsolidatedDownload(formId as "f1" | "f2" | "f3")}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Consolidado {formId.toUpperCase()}
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                              {form?.title}
                              <br />
                              Todas as entrevistas do banco
                            </p>
                          </div>
                        );
                      })}
                    </div>
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