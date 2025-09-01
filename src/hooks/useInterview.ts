import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewsApi, configsApi, analysesApi, type ApiInterview } from '@/lib/api';
import type { PpmMeta, Answers } from '@/lib/types';

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

  // Verificar se a API está online - simplificado temporariamente
  useEffect(() => {
    console.log("🔍 useInterview: Verificando conexão...");
    const checkOnline = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
        });
        if (response.ok) {
          console.log("✅ useInterview: API online");
          setIsOnline(true);
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
  }, []);

  // Buscar entrevista atual - simplificado
  const { data: currentInterview, isLoading, error: queryError } = useQuery({
    queryKey: interviewKeys.detail(currentInterviewId || ''),
    queryFn: () => {
      console.log("🔍 useInterview: Buscando entrevista:", currentInterviewId);
      if (!currentInterviewId) {
        throw new Error("ID da entrevista não fornecido");
      }
      return interviewsApi.getById(currentInterviewId);
    },
    enabled: !!currentInterviewId && isOnline,
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
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

  // Função para iniciar nova entrevista
  const startInterview = async () => {
    try {
      if (isOnline) {
        // Criar no banco de dados
        const result = await createInterviewMutation.mutateAsync({
          isInterviewer: false,
          interviewerName: "",
          respondentName: "",
          respondentDepartment: ""
        });
        return result;
      } else {
        throw new Error('Sistema offline. Conecte-se à internet para continuar.');
      }
    } catch (error) {
      console.error('Erro ao iniciar entrevista:', error);
      throw error;
    }
  };

  // Função para salvar respostas
  const saveFormAnswers = async (formId: 'f1' | 'f2' | 'f3', answers: Answers) => {
    try {
      if (isOnline && currentInterviewId) {
        // Sincronizar com banco de dados
        await saveAnswersMutation.mutateAsync({ formId, answers });
      }
    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
      throw error;
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
          interviewerName: meta.interviewerName,
          respondentName: meta.respondentName,
          respondentDepartment: meta.respondentDepartment
        });
        
        // Invalidar cache para refletir mudanças
        queryClient.invalidateQueries({ queryKey: interviewKeys.detail(currentInterviewId) });
      }
    } catch (error) {
      console.error('Erro ao atualizar metadados:', error);
    }
  };

  // Função para limpar rascunho
  const clearDraft = () => {
    setCurrentInterviewId(null);
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
    clearDraft,
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
