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
import { useInterview } from "@/hooks/useInterview";
import { loadConfig } from "@/lib/storage";
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
  const [showValidation, setShowValidation] = useState(false); // Nova state para controlar validação
  const [lookups, setLookups] = useState<Lookups>({
    SISTEMAS_ESSENCIAIS: [],
    FERRAMENTAS_PPM: [],
    TIPOS_DADOS_SINCRONIZAR: []
  });

  // Usar o hook de entrevista para gerenciar dados no banco
  const { 
    currentInterview, 
    updateAnswers, 
    updateMeta, 
    clearDraft,
    isSaving,
    error 
  } = useInterview();

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
      setLookups(config.lookups || {
        SISTEMAS_ESSENCIAIS: [],
        FERRAMENTAS_PPM: [],
        TIPOS_DADOS_SINCRONIZAR: []
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error);
      setIsLoading(false);
      navigate("/config");
    }
  }, [formId, navigate]);

  // Carregar respostas do banco de dados quando a entrevista atual mudar
  useEffect(() => {
    if (currentInterview) {
      // Carregar respostas do formulário atual
      const formAnswers = currentInterview[`${formId}Answers`] || {};
      setAnswers(formAnswers);
      
      // Carregar metadados
      setMeta({
        is_interviewer: currentInterview.isInterviewer || false,
        interviewerName: currentInterview.interviewerName || "",
        respondentName: currentInterview.respondentName || "",
        respondentDepartment: currentInterview.respondentDepartment || ""
      });
      
      // Verificar se há dados salvos
      setHasDraftData(Object.keys(formAnswers).length > 0);
    }
  }, [currentInterview, formId]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Salvar no banco de dados
    updateAnswers(formId, newAnswers);
  };

  const handleMetaChange = (newMeta: PpmMeta) => {
    setMeta(newMeta);
    
    // Salvar no banco de dados
    updateMeta(newMeta);
  };

  const handleClearDraft = () => {
    clearDraft();
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

  // Função para verificar se uma pergunta específica tem erro
  const hasQuestionError = (questionId: string) => {
    if (!showValidation) return false; // Só mostrar erro se validação estiver ativa
    if (!form) return false;
    const question = form.questions.find(q => q.id === questionId);
    if (!question || question.active === false) return false;
    
    const answer = answers[questionId];
    return !answer || (Array.isArray(answer) && answer.length === 0) || answer === "";
  };

  // Função para obter todas as perguntas com erro
  const getQuestionsWithErrors = () => {
    if (!showValidation) return []; // Só mostrar erros se validação estiver ativa
    if (!form) return [];
    return form.questions
      .filter(q => q.active !== false)
      .filter(q => hasQuestionError(q.id))
      .map(q => q.id);
  };

  // Função para tentar avançar (ativa validação se necessário)
  const handleNext = () => {
    if (canProceed()) {
      // Se pode avançar, navegar normalmente
      navigate(getNextRoute());
    } else {
      // Se não pode avançar, ativar validação para mostrar erros
      setShowValidation(true);
    }
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

  // Mostrar erro se houver problema com o banco de dados
  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <Alert className="border-destructive bg-[hsl(var(--ppm-error-bg))]">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Erro ao conectar com o banco de dados: {error.message}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Tentar Novamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const progress = getProgress();
  const questionsWithErrors = getQuestionsWithErrors();

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
            {isSaving && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Salvando...
              </span>
            )}
          </div>
        </div>

        {/* Mostrar alerta de validação se houver erros */}
        {showValidation && questionsWithErrors.length > 0 && (
          <Alert className="border-destructive bg-[hsl(var(--ppm-error-bg))] mb-6">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription>
              <p>Por favor, responda todas as perguntas obrigatórias antes de continuar.</p>
            </AlertDescription>
          </Alert>
        )}

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
                  hasError={hasQuestionError(question.id)}
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
            {!canProceed() && showValidation && (
              <p className="text-sm text-destructive mb-2">
                {questionsWithErrors.length} pergunta{questionsWithErrors.length !== 1 ? 's' : ''} obrigatória{questionsWithErrors.length !== 1 ? 's' : ''} não respondida{questionsWithErrors.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={isSaving}
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