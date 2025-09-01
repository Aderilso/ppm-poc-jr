import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, CheckCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { loadConfig, loadConfigWithFallback, loadAnswers, loadMeta } from "@/lib/storage";
import { generateCsvData, downloadCsv, generateFileName } from "@/lib/csv";
import { toast } from "@/hooks/use-toast";
import type { PpmConfig, PpmMeta, FormAnswers } from "@/lib/types";

export default function Resumo() {
  const [config, setConfig] = useState<PpmConfig | null>(null);
  const [answers, setAnswers] = useState<FormAnswers>({ f1: {}, f2: {}, f3: {} });
  const [meta, setMeta] = useState<PpmMeta>({ is_interviewer: false });

  useEffect(() => {
    const configData = loadConfig();
    setConfig(configData);
    setAnswers({
      f1: loadAnswers("f1"),
      f2: loadAnswers("f2"), 
      f3: loadAnswers("f3"),
    });
    setMeta(loadMeta());
  }, []);

  const handleDownload = (formId: "f1" | "f2" | "f3" | "consolidado") => {
    if (!config) return;

    const csvData = generateCsvData(config, formId, answers, meta);
    const filename = generateFileName(formId);
    downloadCsv(csvData, filename);
    
    toast({
      title: "Download realizado",
      description: `Arquivo ${filename} baixado com sucesso!`,
    });
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
          <h1 className="text-3xl font-bold text-primary mb-2">Resumo das Respostas</h1>
          <p className="text-muted-foreground">
            Revise suas respostas e faça o download dos relatórios em CSV
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

        {/* Download Actions */}
        <Card className="ppm-card mb-8">
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
                  CSV Consolidado
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Todos os formulários
                  <br />
                  em um arquivo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms Summary */}
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
      </div>
    </Layout>
  );
}