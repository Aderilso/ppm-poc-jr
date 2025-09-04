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
import { useInterview, useInterviews } from "@/hooks/useInterview";
import { useConfig } from "@/hooks/useInterview";
import type { PpmConfig, PpmMeta, FormAnswers } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

export default function Resumo() {
  // Config do banco de dados (ativa)
  const { config, isLoading: isConfigLoading } = useConfig();
  
  // Usar hook do banco de dados para entrevista atual e todas as entrevistas
  const { currentInterview, currentInterviewId } = useInterview();
  const { interviews } = useInterviews();

  // Carregar dados da entrevista atual
  const [currentAnswers, setCurrentAnswers] = useState<FormAnswers>({ f1: {}, f2: {}, f3: {} });
  const [currentMeta, setCurrentMeta] = useState<PpmMeta>({ is_interviewer: false });

  // Sem carregamento de config via localStorage — usamos a ativa do banco.

  // Carregar dados para downloads: entrevista atual ou fallback (mais recente concluída)
  useEffect(() => {
    if (!config) return;

    // Escolher fonte: atual > concluída mais recente > qualquer em andamento com dados
    const source = currentInterview 
      || interviews.find(i => i.isCompleted) 
      || interviews.find(i => (i.f1Answers || i.f2Answers || i.f3Answers));

    if (!source) {
      // Sem dados; manter estados vazios
      setCurrentAnswers({ f1: {}, f2: {}, f3: {} });
      setCurrentMeta({ is_interviewer: false });
      return;
    }

    console.log("🔍 Resumo - Entrevista fonte para downloads:", source.id, { isCompleted: source.isCompleted });

    const formAnswers = {
      f1: source.f1Answers || {},
      f2: source.f2Answers || {},
      f3: source.f3Answers || {},
    };
    setCurrentAnswers(formAnswers);

    setCurrentMeta({
      is_interviewer: source.isInterviewer || false,
      interviewer_name: source.interviewerName || "",
      respondent_name: source.respondentName || "",
      respondent_department: source.respondentDepartment || ""
    });
  }, [currentInterview, interviews, config]);

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

  // Novo: Download consolidado global (todas as entrevistas, F1+F2+F3 em um arquivo)
  const handleDownloadAllConsolidated = async () => {
    if (!config) return;
    try {
      // Gerar consolidados por formulário
      const f1 = await consolidateFormInterviews(config, "f1");
      const f2 = await consolidateFormInterviews(config, "f2");
      const f3 = await consolidateFormInterviews(config, "f3");

      const csvF1 = generateConsolidatedFormCsv(f1.data, f1.stats);
      const csvF2 = generateConsolidatedFormCsv(f2.data, f2.stats);
      const csvF3 = generateConsolidatedFormCsv(f3.data, f3.stats);

      // Combinar em um único arquivo com separadores
      const combined = [
        csvF1,
        "",
        "",
        csvF2,
        "",
        "",
        csvF3,
      ].join("\n");

      const blob = new Blob([combined], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const filename = `PPM_Relatorio_Consolidado_Todas_${new Date().toISOString().slice(0,16).replace(/[:-]/g, '').replace('T','-')}.csv`;

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast({ title: "Consolidado gerado", description: `${filename} baixado com F1+F2+F3 de todas as entrevistas.` });
    } catch (error) {
      console.error('Erro ao gerar consolidado global:', error);
      toast({ title: "Erro ao gerar consolidado", description: error instanceof Error ? error.message : 'Erro desconhecido', variant: 'destructive' });
    }
  };

  const getFormStats = (formId: "f1" | "f2" | "f3") => {
    if (!config) return { total: 0, answered: 0 };
    const form = config.forms.find(f => f.id === formId);
    if (!form) return { total: 0, answered: 0 };

    const activeQuestions = form.questions.filter(q => q.active !== false);
    const formAnswers = currentAnswers[formId];
    const answered = activeQuestions.filter(q => {
      const val = formAnswers[q.id];
      if (Array.isArray(val)) return val.length > 0;
      return val !== undefined && val !== "";
    }).length;

    return { total: activeQuestions.length, answered };
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

  if (isConfigLoading) {
    return (
      <Layout>
        <div className="text-center">
          <p className="text-muted-foreground">Carregando configuração...</p>
        </div>
      </Layout>
    );
  }

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

        {/* Removido: Informações da Entrevista (exibiremos apenas na tela de Entrevistas) */}

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
                <div className="space-y-10">
                  {/* Consolidados por Formulário (Todas as Entrevistas) */}
                  <div>
                    <h3 className="font-medium mb-3">Consolidados por Formulário (Todas as Entrevistas)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Para coordenadores: CSV por formulário com todas as entrevistas do banco (cada resposta em uma linha)
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

                  <Separator className="my-2" />

                  {/* Relatório Consolidado (Todas as Entrevistas) */}
                  <div className="pt-2">
                    <h3 className="font-medium mb-2">Relatório Consolidado (Todas as Entrevistas)</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <p className="text-sm text-muted-foreground mb-3 leading-snug">
                          Integra F1 + F2 + F3 em um único arquivo com scores, insights e recomendações
                        </p>
                        <Button
                          className="ppm-button-accent w-full mb-2"
                          onClick={handleDownloadAllConsolidated}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Consolidado
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Todos os formulários (F1+F2+F3)<br/>de todas as entrevistas
                        </p>
                      </div>
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
