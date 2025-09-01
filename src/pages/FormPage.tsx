import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { DraftBanner } from "@/components/DraftBanner";
import { InterviewerFields } from "@/components/InterviewerFields";
import { ProgressBar } from "@/components/ProgressBar";
import { Question } from "@/components/Question";
import { loadConfig, saveAnswers, loadAnswers, saveMeta, loadMeta, hasData, clearAnswersData } from "@/lib/storage";
import type { FormSpec, PpmMeta, Answers, Lookups } from "@/lib/types";

interface FormPageProps {
  formId: "f1" | "f2" | "f3";
}

export function FormPage({ formId }: FormPageProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormSpec | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [meta, setMeta] = useState<PpmMeta>({ is_interviewer: false });
  const [hasDraftData, setHasDraftData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lookups, setLookups] = useState<Lookups>({
    SISTEMAS_ESSENCIAIS: [],
    FERRAMENTAS_PPM: [],
    TIPOS_DADOS_SINCRONIZAR: []
  });

  useEffect(() => {
    try {
      const config = loadConfig();
      if (!config) {
        setIsLoading(false);
        navigate("/config");
        return;
      }

      const currentForm = config.forms.find(f => f.id === formId);
      if (!currentForm) {
        console.warn(`Formulário ${formId} não encontrado na configuração`);
        setIsLoading(false);
        navigate("/");
        return;
      }

      setForm(currentForm);
      setAnswers(loadAnswers(formId));
      setMeta(loadMeta());
      setHasDraftData(hasData());
      setLookups(config.lookups || {
        SISTEMAS_ESSENCIAIS: [],
        FERRAMENTAS_PPM: [],
        TIPOS_DADOS_SINCRONIZAR: []
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error);
      setIsLoading(false);
      // Em caso de erro, tentar navegar para configuração
      navigate("/config");
    }
  }, [formId, navigate]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    saveAnswers(formId, newAnswers);
  };

  const handleMetaChange = (newMeta: PpmMeta) => {
    setMeta(newMeta);
    saveMeta(newMeta);
  };

  const handleClearDraft = () => {
    clearAnswersData();
    setAnswers({});
    setMeta({ is_interviewer: false });
    setHasDraftData(false);
  };

  const getNextRoute = () => {
    switch (formId) {
      case "f1": return "/f2";
      case "f2": return "/f3";
      case "f3": return "/resumo";
      default: return "/";
    }
  };

  const getPrevRoute = () => {
    switch (formId) {
      case "f1": return "/";
      case "f2": return "/f1";
      case "f3": return "/f2";
      default: return "/";
    }
  };

  const getProgress = () => {
    if (!form) return { current: 0, total: 0 };
    const activeQuestions = form.questions.filter(q => q.active !== false);
    const answered = activeQuestions.filter(q => answers[q.id]).length;
    return { current: answered, total: activeQuestions.length };
  };

  const canProceed = () => {
    if (!form) return false;
    const progress = getProgress();
    return progress.current === progress.total;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Carregando formulário...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!form) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <Alert className="border-destructive bg-[hsl(var(--ppm-error-bg))]">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Formulário não encontrado. Configure os formulários antes de continuar.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/config")}
                >
                  Ir para Configurações
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const progress = getProgress();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {hasDraftData && <DraftBanner onClearDraft={handleClearDraft} />}
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">{form.title}</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Progresso: {progress.current} de {progress.total} perguntas
            </span>
            <ProgressBar 
              current={progress.current} 
              total={progress.total} 
              className="flex-1 max-w-xs"
            />
          </div>
        </div>

        {/* Interviewer Fields */}
        <InterviewerFields meta={meta} onMetaChange={handleMetaChange} />

        {/* Questions */}
        <Card className="ppm-card mb-8">
          <CardHeader>
            <CardTitle>Perguntas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {form.questions
                .filter(question => question.active !== false) // Filtrar apenas perguntas ativas
                .map((question) => (
                <Question
                  key={question.id}
                  question={question}
                  value={answers[question.id] || ""}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  lookups={lookups}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate(getPrevRoute())}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="text-center">
            {!canProceed() && (
              <p className="text-sm text-muted-foreground mb-2">
                Responda todas as perguntas para continuar
              </p>
            )}
          </div>

          <Button
            onClick={() => navigate(getNextRoute())}
            disabled={!canProceed()}
            className="ppm-button-primary flex items-center gap-2"
          >
            {formId === "f3" ? "Finalizar" : "Próximo"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}