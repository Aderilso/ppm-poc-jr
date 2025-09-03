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
import { useConfig } from "@/hooks/useInterview";
import type { FormSpec, PpmMeta, Answers, Lookups } from "@/lib/types";

interface FormPageProps {
  formId: "f1" | "f2" | "f3";
}

export default function FormPage({ formId }: FormPageProps) {
  console.log("🚀 FormPage - COMPONENTE MONTADO para:", formId);
  
  const navigate = useNavigate();
  const { currentInterview, currentInterviewId, saveFormAnswers, updateMeta, clearDraft } = useInterview();
  
  console.log("🔍 FormPage - Hook useInterview retornou:", {
    currentInterview: currentInterview?.id,
    currentInterviewId,
    hasSaveFormAnswers: !!saveFormAnswers,
    hasUpdateMeta: !!updateMeta,
    hasClearDraft: !!clearDraft,
    currentInterviewObject: currentInterview
  });
  
  // VERIFICAÇÃO IMEDIATA DOS DADOS
  if (currentInterview) {
    console.log("🔍 FormPage - DADOS IMEDIATOS da entrevista:", {
      id: currentInterview.id,
      isInterviewer: currentInterview.isInterviewer,
      interviewerName: currentInterview.interviewerName,
      respondentName: currentInterview.respondentName,
      respondentDepartment: currentInterview.respondentDepartment,
      f1Answers: currentInterview.f1Answers,
      f2Answers: currentInterview.f2Answers,
      f3Answers: currentInterview.f3Answers,
      isCompleted: currentInterview.isCompleted
    });
  } else {
    console.log("❌ FormPage - NENHUMA ENTREVISTA ATIVA!");
  }

  const [form, setForm] = useState<FormSpec | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [meta, setMeta] = useState<PpmMeta>({ is_interviewer: false });
  const [hasDraftData, setHasDraftData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showValidation, setShowValidation] = useState(false);
  const [lookups, setLookups] = useState<Lookups>({
    SISTEMAS_ESSENCIAIS: [],
    FERRAMENTAS_PPM: [],
    TIPOS_DADOS_SINCRONIZAR: []
  });

  // Usar o hook de entrevista para gerenciar dados no banco
  const { 
    currentInterview: currentInterviewHook, 
    updateAnswers, 
    updateMeta: updateMetaHook, 
    clearDraft: clearDraftHook,
    isSaving,
    error 
  } = useInterview();

  // Usar o hook de configuração para carregar formulários
  const { config, isLoading: configLoading } = useConfig();

  useEffect(() => {
    console.log("🔍 FormPage - useEffect config:", { config, configLoading, formId });
    
    if (configLoading) return;
    
    if (!config) {
      console.log("❌ FormPage - Sem configuração, redirecionando para /config");
      setIsLoading(false);
      navigate("/config");
      return;
    }

    console.log("🔍 FormPage - Configuração carregada:", config);
    console.log("🔍 FormPage - Formulários disponíveis:", config.forms.map(f => ({ id: f.id, title: f.title })));
    
    const currentForm = config.forms.find(f => f.id === formId);
    console.log("🔍 FormPage - Formulário encontrado:", currentForm);
    
    if (!currentForm) {
      console.warn(`❌ FormPage - Formulário ${formId} não encontrado na configuração`);
      setIsLoading(false);
      navigate("/");
      return;
    }

    console.log("✅ FormPage - Definindo formulário:", { formId, title: currentForm.title });
    setForm(currentForm);
    setLookups(config.lookups || {
      SISTEMAS_ESSENCIAIS: [],
      FERRAMENTAS_PPM: [],
      TIPOS_DADOS_SINCRONIZAR: []
    });
    setIsLoading(false);
  }, [config, configLoading, formId, navigate]);

  // Carregar respostas do banco de dados quando a entrevista atual mudar
  useEffect(() => {
    console.log("🔍 FormPage - useEffect executado:", { 
      currentInterview: currentInterviewHook?.id, 
      formId,
      hasRealData: currentInterviewHook ? Object.keys(currentInterviewHook[`${formId}Answers`] || {}).length > 0 : false,
      isCompleted: currentInterviewHook?.isCompleted,
      currentInterviewObject: currentInterviewHook
    });
    
    if (currentInterviewHook && currentInterviewHook.id) {
      console.log("🔍 FormPage - Entrevista carregada:", currentInterviewHook.id);
      console.log("🔍 FormPage - Dados completos da entrevista:", currentInterviewHook);
      console.log("🔍 FormPage - Metadados da entrevista:", {
        isInterviewer: currentInterviewHook.isInterviewer,
        interviewerName: currentInterviewHook.interviewerName,
        respondentName: currentInterviewHook.respondentName,
        respondentDepartment: currentInterviewHook.respondentDepartment
      });
      
      // Verificar se a entrevista tem dados reais E não está concluída
      const formAnswers = currentInterviewHook[`${formId}Answers`] || {};
      const hasRealData = Object.keys(formAnswers).length > 0;
      const isCompleted = currentInterviewHook.isCompleted;
      
      console.log("🔍 FormPage - Status da entrevista:", {
        formId,
        hasRealData,
        isCompleted,
        formAnswers,
        formAnswersKeys: Object.keys(formAnswers)
      });
      
      // NOVA LÓGICA: Carregar dados de TODOS os formulários quando retomar entrevista
      if (!isCompleted) {
        // Verificar se há dados em qualquer formulário (entrevista em andamento)
        const hasF1Data = currentInterviewHook.f1Answers && Object.keys(currentInterviewHook.f1Answers).length > 0;
        const hasF2Data = currentInterviewHook.f2Answers && Object.keys(currentInterviewHook.f2Answers).length > 0;
        const hasF3Data = currentInterviewHook.f3Answers && Object.keys(currentInterviewHook.f3Answers).length > 0;
        const hasAnyData = hasF1Data || hasF2Data || hasF3Data;
        
        console.log("🔍 FormPage - Status dos formulários:", {
          f1: hasF1Data ? "PREENCHIDO" : "VAZIO",
          f2: hasF2Data ? "PREENCHIDO" : "VAZIO", 
          f3: hasF3Data ? "PREENCHIDO" : "VAZIO",
          formId,
          hasAnyData
        });
        
        // FORÇAR CARREGAMENTO DOS DADOS DO FORMULÁRIO ATUAL
        console.log(`🔄 FormPage - Forçando carregamento de dados para ${formId}:`, formAnswers);
        setAnswers(formAnswers);
        
        if (hasAnyData) {
          // IMPORTANTE: Marcar que há dados de entrevista em andamento
          setHasDraftData(true);
          console.log("✅ FormPage - Entrevista em andamento detectada");
        } else {
          // Nova entrevista sem dados
          setHasDraftData(false);
          console.log("🧹 FormPage - Nova entrevista sem dados, limpando campos");
        }
      } else {
        // Entrevista concluída - limpar campos para nova pesquisa
        console.log("🧹 FormPage - Entrevista concluída, limpando campos para nova pesquisa");
        setAnswers({});
        setHasDraftData(false);
      }
      
      // LÓGICA PARA CAMPOS DO ENTREVISTADOR:
      // FORÇAR CARREGAMENTO DOS METADADOS
      const bankMeta = {
        is_interviewer: currentInterviewHook.isInterviewer || false,
        interviewer_name: currentInterviewHook.interviewerName || "",
        respondent_name: currentInterviewHook.respondentName || "",
        respondent_department: currentInterviewHook.respondentDepartment || ""
      };
      
      console.log("🔍 FormPage - Debug metadados:", {
        formId,
        bankMeta,
        f1Answers: currentInterviewHook.f1Answers,
        isCompleted,
        currentMeta: meta
      });
      
      // SIMPLIFICAÇÃO: Sempre carregar metadados do banco quando há entrevista ativa
      if (!isCompleted) {
        console.log("🔄 FormPage - FORÇANDO carregamento de metadados do banco para", formId, ":", bankMeta);
        setMeta(bankMeta);
        
        // FORÇAR RE-RENDER DOS COMPONENTES
        setTimeout(() => {
          console.log("⏰ FormPage - Timeout executado, forçando re-render");
          setMeta(prevMeta => {
            console.log("🔄 FormPage - setMeta executado:", { prevMeta, newMeta: bankMeta });
            return { ...bankMeta };
          });
          console.log("✅ FormPage - Metadados forçados após timeout:", bankMeta);
        }, 100);
      } else {
        // Entrevista concluída - limpar metadados
        console.log("🧹 FormPage - Entrevista concluída, limpando metadados");
        setMeta({ is_interviewer: false });
      }
      
      // Limpar validação visual quando nova entrevista é carregada
      setShowValidation(false);
      
    } else {
      // Se não há entrevista ativa, limpar todos os campos
      console.log("🧹 FormPage - Limpando campos (sem entrevista ativa)");
      setAnswers({});
      setMeta({ is_interviewer: false });
      setHasDraftData(false);
      setShowValidation(false);
    }
  }, [currentInterviewHook, formId]);

  // NOVA FUNÇÃO: Forçar recarga da entrevista
  const forceReloadInterview = async () => {
    if (!currentInterviewHook?.id) return;
    
    console.log("🔄 FormPage - Forçando recarga da entrevista:", currentInterviewHook.id);
    
    try {
      // Buscar dados diretamente da API
      const response = await fetch(`/api/interviews/${currentInterviewHook.id}`);
      if (response.ok) {
        const interview = await response.json();
        console.log("✅ FormPage - Entrevista recarregada da API:", interview);
        
        // Atualizar estado local com os dados da API
        if (interview.f1Answers && Object.keys(interview.f1Answers).length > 0) {
          console.log("📊 FormPage - F1 tem dados:", Object.keys(interview.f1Answers).length, "respostas");
        }
        
        // Forçar re-render
        window.location.reload();
      } else {
        console.error("❌ FormPage - Erro ao recarregar entrevista:", response.status);
      }
    } catch (error) {
      console.error("❌ FormPage - Erro ao recarregar entrevista:", error);
    }
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    console.log(`📝 FormPage - Resposta alterada em ${formId}:`, { questionId, value });
    
    // Salvar no banco de dados
    updateAnswers(formId, newAnswers);
  };

  const handleMetaChange = (newMeta: PpmMeta) => {
    console.log(`📝 FormPage - Metadados alterados em ${formId}:`, newMeta);
    
    setMeta(newMeta);
    
    // Salvar no banco de dados
    updateMetaHook(newMeta);
  };

  const handleClearDraft = () => {
    console.log("🧹 FormPage - Limpando rascunho manualmente...");
    
    // Limpar estado local
    setAnswers({});
    setMeta({ is_interviewer: false });
    setHasDraftData(false);
    setShowValidation(false);
    
    // Limpar entrevista atual via hook
    clearDraftHook();
    
    // Forçar re-render para garantir limpeza
    setTimeout(() => {
      console.log("✅ FormPage - Rascunho limpo completamente");
    }, 100);
  };

  const getNextRoute = () => {
    switch (formId) {
      case "f1": return "/f2";
      case "f2": return "/f3";
      case "f3": return "/dashboard"; // Mudança: F3 agora vai para Dashboard em vez de Resumo
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
            {/* Botão de Sincronizar Dados */}
            {currentInterviewHook?.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={forceReloadInterview}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                🔄 Sincronizar Dados
              </Button>
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