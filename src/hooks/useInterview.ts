import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewsApi, configsApi, analysesApi, type ApiInterview } from '@/lib/api';
import { loadConfig, saveAnswers, loadAnswers, saveMeta, loadMeta, clearAnswersData } from '@/lib/storage';
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
export function useCurrentInterview() {
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const queryClient = useQueryClient();

  // Verificar se a API está online
  useEffect(() => {
    const checkOnline = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
        });
        if (response.ok) {
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch (error) {
        // Silenciosamente definir como offline em caso de erro
        setIsOnline(false);
      }
    };
    
    // Verificar apenas uma vez na inicialização
    checkOnline();
    
    // Verificar periodicamente apenas se estiver online
    const interval = setInterval(() => {
      if (isOnline) {
        checkOnline();
      }
    }, 60000); // Verificar a cada 1 minuto
    
    return () => clearInterval(interval);
  }, [isOnline]);

  // Buscar entrevista atual
  const { data: currentInterview, isLoading } = useQuery({
    queryKey: interviewKeys.detail(currentInterviewId || ''),
    queryFn: () => interviewsApi.getById(currentInterviewId!),
    enabled: !!currentInterviewId && isOnline,
    retry: 1, // Tentar apenas uma vez
    retryDelay: 1000, // Esperar 1 segundo antes de tentar novamente
    staleTime: 30000, // Considerar dados frescos por 30 segundos
  });

  // Mutação para criar entrevista
  const createInterviewMutation = useMutation({
    mutationFn: interviewsApi.create,
    onSuccess: (data) => {
      setCurrentInterviewId(data.id);
      // Sincronizar com localStorage
      const meta = loadMeta();
      saveMeta({
        ...meta,
        interviewId: data.id,
      });
    },
  });

  // Mutação para salvar respostas
  const saveAnswersMutation = useMutation({
    mutationFn: ({ formId, answers }: { formId: 'f1' | 'f2' | 'f3'; answers: Answers }) => {
      if (!currentInterviewId) throw new Error('Nenhuma entrevista ativa');
      return interviewsApi.saveAnswers(currentInterviewId, formId, answers);
    },
    onSuccess: (data) => {
      // Sincronizar com localStorage
      if (data.f1Answers) saveAnswers('f1', data.f1Answers);
      if (data.f2Answers) saveAnswers('f2', data.f2Answers);
      if (data.f3Answers) saveAnswers('f3', data.f3Answers);
    },
  });

  // Mutação para completar entrevista
  const completeInterviewMutation = useMutation({
    mutationFn: (configSnapshot?: any) => {
      if (!currentInterviewId) throw new Error('Nenhuma entrevista ativa');
      return interviewsApi.complete(currentInterviewId, configSnapshot);
    },
    onSuccess: () => {
      // Limpar localStorage após completar
      clearAnswersData();
      setCurrentInterviewId(null);
    },
  });

  // Função para iniciar nova entrevista
  const startInterview = async (meta: PpmMeta) => {
    try {
      if (isOnline) {
        // Criar no banco de dados
        const interview = await createInterviewMutation.mutateAsync({
          isInterviewer: meta.is_interviewer,
          interviewerName: meta.interviewer_name,
          respondentName: meta.respondent_name,
          respondentDepartment: meta.respondent_department,
        });
        return interview;
      } else {
        // Modo offline - usar localStorage
        const interviewId = `offline_${Date.now()}`;
        setCurrentInterviewId(interviewId);
        saveMeta({
          ...meta,
          interviewId,
        });
        return { id: interviewId, isCompleted: false };
      }
    } catch (error) {
      console.error('Erro ao iniciar entrevista:', error);
      throw error;
    }
  };

  // Função para salvar respostas
  const saveFormAnswers = async (formId: 'f1' | 'f2' | 'f3', answers: Answers) => {
    try {
      // Sempre salvar no localStorage primeiro
      saveAnswers(formId, answers);
      
      if (isOnline && currentInterviewId) {
        // Sincronizar com banco de dados
        await saveAnswersMutation.mutateAsync({ formId, answers });
      }
    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
      // Em caso de erro, pelo menos temos no localStorage
    }
  };

  // Função para atualizar respostas (alias para saveFormAnswers)
  const updateAnswers = saveFormAnswers;

  // Função para atualizar metadados
  const updateMeta = async (meta: PpmMeta) => {
    try {
      // Salvar no localStorage
      saveMeta(meta);
      
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
    clearAnswersData();
    setCurrentInterviewId(null);
  };

  // Função para completar entrevista
  const completeInterview = async () => {
    try {
      const config = loadConfig();
      
      if (isOnline && currentInterviewId) {
        await completeInterviewMutation.mutateAsync(config);
      } else {
        // Modo offline - apenas limpar localStorage
        clearAnswersData();
        setCurrentInterviewId(null);
      }
    } catch (error) {
      console.error('Erro ao completar entrevista:', error);
      throw error;
    }
  };

  // Carregar entrevista existente do localStorage
  useEffect(() => {
    const meta = loadMeta();
    if (meta.interviewId && !meta.interviewId.startsWith('offline_')) {
      setCurrentInterviewId(meta.interviewId);
    }
  }, []);

  return {
    currentInterview,
    currentInterviewId,
    isOnline,
    isLoading: isLoading || createInterviewMutation.isPending,
    isSaving: saveAnswersMutation.isPending,
    isCompleting: completeInterviewMutation.isPending,
    startInterview,
    saveFormAnswers,
    updateAnswers,
    updateMeta,
    clearDraft,
    completeInterview,
    error: createInterviewMutation.error || saveAnswersMutation.error || completeInterviewMutation.error,
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
