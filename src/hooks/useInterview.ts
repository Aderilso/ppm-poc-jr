import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewsApi, configsApi, analysesApi, type ApiInterview } from '@/lib/api';
import type { PpmMeta, Answers } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

// Chaves para React Query
export const interviewKeys = {
  all: ['interviews'] as const,
  lists: () => [...interviewKeys.all, 'list'] as const,
  list: (filters: string) => [...interviewKeys.lists(), { filters }] as const,
  details: () => [...interviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...interviewKeys.details(), id] as const,
};

export const configKeys = {
  all: ['configs'] as const,
  active: () => [...configKeys.all, 'active'] as const,
};

export const analysisKeys = {
  all: ['analyses'] as const,
  lists: () => [...analysisKeys.all, 'list'] as const,
};

// Hook para gerenciar entrevista atual
export function useInterview() {
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const queryClient = useQueryClient();

  // Verificar se a API está online - APENAS verificar conexão, SEM buscar entrevistas
  useEffect(() => {
    console.log("🔍 useInterview: useEffect executado - Verificando APENAS conexão...");
    const checkOnline = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
        });
        if (response.ok) {
          console.log("✅ useInterview: API online");
          setIsOnline(true);
          
          // Se a API está online E não há currentInterviewId, buscar entrevista existente
          if (!currentInterviewId) {
            console.log("🔍 useInterview: Verificando se há entrevista existente para definir currentInterviewId...");
            try {
              const allInterviews = await interviewsApi.getAll();
              console.log("🔍 useInterview: Total de entrevistas encontradas:", allInterviews.length);
              
              // Priorizar entrevistas com dados (respostas salvas)
              const interviewWithData = allInterviews.find(interview => 
                !interview.isCompleted && 
                (interview.f1Answers || interview.f2Answers || interview.f3Answers)
              );
              
              if (interviewWithData) {
                console.log("✅ useInterview: Entrevista com dados encontrada, definindo currentInterviewId:", interviewWithData.id);
                setCurrentInterviewId(interviewWithData.id);
              } else {
                console.log("🔍 useInterview: Nenhuma entrevista com dados encontrada");
              }
            } catch (error) {
              console.log("🔍 useInterview: Erro ao verificar entrevistas existentes:", error);
            }
          }
        } else {
          console.log("❌ useInterview: API offline");
          setIsOnline(false);
        }
      } catch (error) {
        console.error("❌ useInterview: Erro ao verificar API:", error);
        setIsOnline(false);
      }
    };
    
    checkOnline();
  }, []); // Array de dependências vazio - só executa uma vez

  // Buscar entrevista atual - otimizado para evitar re-renderizações
  const { data: currentInterview, isLoading, error: queryError } = useQuery({
    queryKey: interviewKeys.detail(currentInterviewId || ''),
    queryFn: () => {
      console.log("🔍 useInterview: Buscando entrevista:", currentInterviewId);
      if (!currentInterviewId) {
        console.log("⚠️ useInterview: Sem ID da entrevista, retornando null");
        return null; // Retornar null em vez de throw error
      }
      return interviewsApi.getById(currentInterviewId);
    },
    enabled: !!currentInterviewId && isOnline,
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000, // 30 segundos
    gcTime: 60000, // 1 minuto
  });

  // Log de erros para debug
  useEffect(() => {
    if (queryError) {
      console.error("❌ useInterview: Erro na query:", queryError);
    }
  }, [queryError]);

  // Mutação para criar entrevista
  const createInterviewMutation = useMutation({
    mutationFn: interviewsApi.create,
    onSuccess: (data) => {
      setCurrentInterviewId(data.id);
    },
  });

  // Mutação para salvar respostas
  const saveAnswersMutation = useMutation({
    mutationFn: ({ formId, answers }: { formId: 'f1' | 'f2' | 'f3'; answers: Answers }) => {
      if (!currentInterviewId) throw new Error('Nenhuma entrevista ativa');
      return interviewsApi.saveAnswers(currentInterviewId, formId, answers);
    },
  });

  // Função para buscar entrevista ativa ou criar nova se necessário
  const findOrCreateInterview = async () => {
    try {
      if (!isOnline) {
        throw new Error('Sistema offline. Conecte-se à internet para continuar.');
      }

      // Primeiro, verificar se já existe uma entrevista em andamento
      console.log("🔍 useInterview - Buscando entrevistas existentes...");
      const allInterviews = await interviewsApi.getAll();
      console.log("🔍 useInterview - Total de entrevistas encontradas:", allInterviews.length);
      
      // Priorizar entrevistas com dados (respostas salvas)
      const interviewWithData = allInterviews.find(interview => 
        !interview.isCompleted && 
        (interview.f1Answers || interview.f2Answers || interview.f3Answers)
      );
      
      if (interviewWithData) {
        console.log("✅ useInterview - Entrevista com dados encontrada:", interviewWithData.id);
        setCurrentInterviewId(interviewWithData.id);
        return interviewWithData;
      }
      
      // Se não há entrevista com dados, buscar qualquer entrevista ativa
      const activeInterview = allInterviews.find(interview => 
        !interview.isCompleted
      );
      
      if (activeInterview) {
        console.log("✅ useInterview - Entrevista ativa encontrada:", activeInterview.id);
        setCurrentInterviewId(activeInterview.id);
        return activeInterview;
      }

      // Se não há entrevista ativa, criar uma nova
      console.log("🔍 useInterview - Criando nova entrevista...");
      const result = await createInterviewMutation.mutateAsync({
        isInterviewer: false,
        interviewerName: "",
        respondentName: "",
        respondentDepartment: ""
      });
      console.log("✅ useInterview - Nova entrevista criada:", result.id);
      return result;
    } catch (error) {
      console.error('❌ useInterview - Erro ao buscar/criar entrevista:', error);
      throw error;
    }
  };

  // Função para iniciar nova pesquisa (NÃO cria entrevista, só limpa campos)
  const startInterview = async () => {
    try {
      if (!isOnline) {
        throw new Error('Sistema offline. Conecte-se à internet para continuar.');
      }

      console.log("🔍 useInterview - Iniciando nova pesquisa (sem criar entrevista vazia)...");
      
      // Limpar estado atual para preparar nova pesquisa
      clearCurrentInterview();
      
      // NÃO criar entrevista aqui - será criada apenas quando necessário
      console.log("✅ useInterview - Campos limpos para nova pesquisa");
      
      return null; // Retorna null pois não há entrevista criada ainda
    } catch (error) {
      console.error('❌ useInterview - Erro ao iniciar nova pesquisa:', error);
      throw error;
    }
  };

  // Função para criar entrevista quando necessário (chamada internamente)
  const createInterviewIfNeeded = async () => {
    if (currentInterviewId) {
      return currentInterviewId; // Já existe uma entrevista
    }

    console.log("🔍 useInterview - Criando entrevista (primeira vez que salva dados)...");
    
    const result = await createInterviewMutation.mutateAsync({
      isInterviewer: false,
      interviewerName: "",
      respondentName: "",
      respondentDepartment: ""
    });
    
    console.log("✅ useInterview - Entrevista criada:", result.id);
    setCurrentInterviewId(result.id);
    
    return result.id;
  };

  // Função para salvar respostas
  const saveFormAnswers = async (formId: 'f1' | 'f2' | 'f3', answers: Answers) => {
    console.log("🔍 useInterview - saveFormAnswers chamada:", { formId, answers, currentInterviewId, isOnline });
    
    try {
      if (isOnline) {
        // Criar entrevista se não existir (primeira vez que salva dados)
        const interviewId = await createInterviewIfNeeded();
        
        // Verificar se a entrevista atual não está finalizada
        const currentInterviewData = await interviewsApi.getById(interviewId);
        
        if (currentInterviewData.isCompleted) {
          console.log("❌ useInterview - Entrevista já finalizada, não é possível salvar mais dados");
          toast({
            title: "Entrevista Finalizada",
            description: "Esta entrevista já foi finalizada. Inicie uma nova entrevista para continuar.",
            variant: "destructive",
          });
          return;
        }
        
        console.log("✅ useInterview - Salvando respostas no banco...");
        // Sincronizar com banco de dados
        const result = await saveAnswersMutation.mutateAsync({ formId, answers });
        console.log("✅ useInterview - Respostas salvas com sucesso:", result);
        
        // Verificar se todos os formulários estão preenchidos para marcar como concluída
        await checkAndCompleteInterview();
        
        // Invalidar cache para refletir mudanças
        queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
        queryClient.invalidateQueries({ queryKey: interviewKeys.detail(interviewId) });
        
        return result;
      } else {
        console.log("❌ useInterview - Sistema offline, não foi possível salvar");
        throw new Error('Sistema offline');
      }
    } catch (error) {
      console.error('❌ useInterview - Erro ao salvar respostas:', error);
      throw error;
    }
  };

  // Função para verificar e completar entrevista automaticamente
  const checkAndCompleteInterview = async () => {
    if (!currentInterviewId || !isOnline) return;
    
    try {
      console.log("🔍 useInterview - Verificando se entrevista pode ser marcada como concluída...");
      const currentInterviewData = await interviewsApi.getById(currentInterviewId);
      
      // Verificar se todos os formulários têm respostas
      const hasF1 = currentInterviewData.f1Answers && Object.keys(currentInterviewData.f1Answers).length > 0;
      const hasF2 = currentInterviewData.f2Answers && Object.keys(currentInterviewData.f2Answers).length > 0;
      const hasF3 = currentInterviewData.f3Answers && Object.keys(currentInterviewData.f3Answers).length > 0;
      
      console.log("🔍 useInterview - Status dos formulários:", { hasF1, hasF2, hasF3 });
      console.log("🔍 useInterview - Entrevista já concluída:", currentInterviewData.isCompleted);
      
      // Se todos os formulários estão preenchidos E não está concluída, marcar como concluída
      if (hasF1 && hasF2 && hasF3 && !currentInterviewData.isCompleted) {
        console.log("✅ useInterview - Todos os formulários preenchidos, marcando como concluída...");
        
        try {
          await interviewsApi.complete(currentInterviewId);
          console.log("✅ useInterview - Entrevista marcada como concluída com sucesso!");
          
          // Invalidar cache para refletir mudanças
          queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
          queryClient.invalidateQueries({ queryKey: interviewKeys.detail(currentInterviewId) });
          
          // Mostrar toast de sucesso
          toast({
            title: "Entrevista Concluída!",
            description: "Todos os formulários foram preenchidos. Análise sendo gerada...",
          });
          
        } catch (completeError) {
          console.error('❌ useInterview - Erro ao marcar como concluída:', completeError);
        }
      } else if (hasF1 && hasF2 && hasF3 && currentInterviewData.isCompleted) {
        console.log("✅ useInterview - Entrevista já está concluída");
      } else {
        console.log("⏳ useInterview - Entrevista ainda em andamento");
      }
    } catch (error) {
      console.error('❌ useInterview - Erro ao verificar conclusão:', error);
    }
  };

  // Função para atualizar respostas (alias para saveFormAnswers)
  const updateAnswers = saveFormAnswers;

  // Função para atualizar metadados
  const updateMeta = async (meta: PpmMeta) => {
    try {
      if (isOnline && currentInterviewId) {
        // Atualizar no banco de dados
        await interviewsApi.update(currentInterviewId, {
          isInterviewer: meta.is_interviewer,
          interviewerName: meta.interviewer_name,
          respondentName: meta.respondent_name,
          respondentDepartment: meta.respondent_department
        });
        
        // Invalidar cache para refletir mudanças
        queryClient.invalidateQueries({ queryKey: interviewKeys.detail(currentInterviewId) });
      }
    } catch (error) {
      console.error('Erro ao atualizar metadados:', error);
    }
  };

  // Função para limpar a entrevista atual e campos
  const clearCurrentInterview = () => {
    console.log("🧹 useInterview - Limpando entrevista atual e campos...");
    
    // Limpar ID da entrevista atual
    setCurrentInterviewId(null);
    
    // Forçar limpeza completa do cache
    queryClient.removeQueries({ queryKey: interviewKeys.lists() });
    
    // Limpar cache específico da entrevista atual se existir
    if (currentInterviewId) {
      queryClient.removeQueries({ queryKey: interviewKeys.detail(currentInterviewId) });
    }
    
    // Limpar todos os caches relacionados a entrevistas
    queryClient.removeQueries({ queryKey: interviewKeys.all });
    
    // Forçar invalidação para garantir atualização
    queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
    
    console.log("✅ useInterview - Estado limpo completamente");
  };

  // Função para completar entrevista
  const completeInterview = async () => {
    try {
      if (isOnline && currentInterviewId) {
        await interviewsApi.complete(currentInterviewId);
        setCurrentInterviewId(null);
      } else {
        throw new Error('Sistema offline. Conecte-se à internet para continuar.');
      }
    } catch (error) {
      console.error('Erro ao completar entrevista:', error);
      throw error;
    }
  };

  return {
    currentInterview,
    currentInterviewId,
    isOnline,
    isLoading: isLoading || createInterviewMutation.isPending,
    isSaving: saveAnswersMutation.isPending,
    isCompleting: false, // Temporariamente desabilitado
    startInterview,
    saveFormAnswers,
    updateAnswers,
    updateMeta,
    clearDraft: clearCurrentInterview,
    completeInterview,
    error: createInterviewMutation.error || saveAnswersMutation.error || queryError,
  };
}

// Hook para listar todas as entrevistas
export function useInterviews() {
  const queryClient = useQueryClient();

  const { data: interviews, isLoading, error } = useQuery({
    queryKey: interviewKeys.lists(),
    queryFn: interviewsApi.getAll,
  });

  const deleteInterviewMutation = useMutation({
    mutationFn: interviewsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
    },
  });

  return {
    interviews: interviews || [],
    isLoading,
    error,
    deleteInterview: deleteInterviewMutation.mutate,
    isDeleting: deleteInterviewMutation.isPending,
  };
}

// Hook para configurações
export function useConfig() {
  const { data: config, isLoading, error } = useQuery({
    queryKey: configKeys.active(),
    queryFn: configsApi.getActive,
  });

  const createConfigMutation = useMutation({
    mutationFn: configsApi.create,
  });

  return {
    config,
    isLoading,
    error,
    createConfig: createConfigMutation.mutate,
    isCreating: createConfigMutation.isPending,
  };
}

// Hook para análises
export function useAnalyses() {
  const { data: analyses, isLoading, error } = useQuery({
    queryKey: analysisKeys.lists(),
    queryFn: analysesApi.getAll,
  });

  const createAnalysisMutation = useMutation({
    mutationFn: analysesApi.create,
  });

  return {
    analyses: analyses || [],
    isLoading,
    error,
    createAnalysis: createAnalysisMutation.mutate,
    isCreating: createAnalysisMutation.isPending,
  };
}
