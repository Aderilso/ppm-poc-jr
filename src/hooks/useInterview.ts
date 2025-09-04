import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewsApi, configsApi, analysesApi, healthApi, type ApiInterview } from '@/lib/api';
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
  console.log("🚀 useInterview - HOOK INICIADO");
  
  const queryClient = useQueryClient();
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(() => {
    const stored = localStorage.getItem('currentInterviewId');
    console.log("🔍 useInterview - currentInterviewId inicial:", stored);
    return stored;
  });

  // Helper para sincronizar o ID no estado e no localStorage
  const setInterviewId = (id: string | null) => {
    setCurrentInterviewId(id);
    if (id) {
      localStorage.setItem('currentInterviewId', id);
    } else {
      localStorage.removeItem('currentInterviewId');
    }
  };
  
  console.log("🔍 useInterview - Estado atual:", {
    currentInterviewId,
    hasStoredId: !!localStorage.getItem('currentInterviewId')
  });
  
  const [isOnline, setIsOnline] = useState(true);

  // Verificar se a API está online - APENAS verificar conexão, SEM buscar entrevistas automaticamente
  useEffect(() => {
    console.log("🔍 useInterview: useEffect executado - Verificando APENAS conexão...");
    const checkOnline = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await healthApi.check();
        clearTimeout(timeout);
        if (res && res.status === 'OK') {
          console.log("✅ useInterview: API online");
          setIsOnline(true);
          
          // NÃO buscar entrevistas existentes automaticamente
          // O sistema deve começar limpo e só carregar dados quando explicitamente solicitado
          console.log("🔍 useInterview: Sistema iniciado limpo, aguardando ação do usuário");
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
      setInterviewId(data.id);
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
        setInterviewId(interviewWithData.id);
        return interviewWithData;
      }
      
      // Se não há entrevista com dados, buscar qualquer entrevista ativa
      const activeInterview = allInterviews.find(interview => 
        !interview.isCompleted
      );
      
      if (activeInterview) {
        console.log("✅ useInterview - Entrevista ativa encontrada:", activeInterview.id);
        setInterviewId(activeInterview.id);
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
      console.log("✅ useInterview - Entrevista já existe:", currentInterviewId);
      return currentInterviewId; // Já existe uma entrevista
    }

    console.log("⚠️ useInterview - AVISO: Tentativa de criar entrevista sem metadados!");
    console.log("💡 useInterview - Metadados devem ser salvos primeiro via updateMeta()");
    
    // NÃO criar entrevista aqui - deve ser criada via updateMeta
    throw new Error("Entrevista deve ser criada via updateMeta() com metadados completos");
  };

  // Função para salvar respostas
  const saveFormAnswers = async (formId: 'f1' | 'f2' | 'f3', answers: Answers) => {
    console.log("🔍 useInterview - saveFormAnswers chamada:", { formId, answers, currentInterviewId, isOnline });
    
    try {
      if (isOnline) {
        // Verificar se existe uma entrevista ativa
        if (!currentInterviewId) {
          console.log("❌ useInterview - Nenhuma entrevista ativa para salvar respostas");
          console.log("💡 useInterview - Metadados devem ser salvos primeiro via updateMeta()");
          toast({
            title: "Entrevista não iniciada",
            description: "Preencha os dados do entrevistador primeiro para iniciar a entrevista.",
            variant: "destructive",
          });
          return;
        }
        
        // Verificar se a entrevista atual não está finalizada
        const currentInterviewData = await interviewsApi.getById(currentInterviewId);
        
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
        queryClient.invalidateQueries({ queryKey: interviewKeys.detail(currentInterviewId) });
        
        return result;
      } else {
        console.log("❌ useInterview - Sistema offline, não foi possível salvar respostas");
        throw new Error('Sistema offline. Conecte-se à internet para continuar.');
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
      
      // Logs de progresso
      if (hasF1) console.log("✅ useInterview - F1 preenchido!");
      if (hasF2) console.log("✅ useInterview - F2 preenchido!");
      if (hasF3) console.log("✅ useInterview - F3 preenchido!");
      
      // NÃO marcar como concluída automaticamente - só quando botão Finalizar for clicado
      if (hasF1 && hasF2 && hasF3 && !currentInterviewData.isCompleted) {
        console.log("🎯 useInterview - Todos os formulários preenchidos, mas aguardando botão Finalizar");
        console.log("🚀 useInterview - Entrevista pronta para finalização!");
      } else if (hasF1 && hasF2 && hasF3 && currentInterviewData.isCompleted) {
        console.log("✅ useInterview - Entrevista já está concluída");
      } else {
        console.log("🔍 useInterview - Formulários ainda não estão todos preenchidos");
      }
    } catch (error) {
      console.error('❌ useInterview - Erro ao verificar status da entrevista:', error);
    }
  };

  // Função para atualizar respostas (alias para saveFormAnswers)
  const updateAnswers = saveFormAnswers;

  // Função para atualizar metadados da entrevista
  const updateMeta = async (meta: PpmMeta) => {
    try {
      if (isOnline) {
        console.log("🔍 useInterview - Atualizando metadados:", meta);
        console.log("🔍 useInterview - Tipo dos dados:", {
          isInterviewer: typeof meta.is_interviewer,
          interviewerName: typeof meta.interviewer_name,
          respondentName: typeof meta.respondent_name,
          respondentDepartment: typeof meta.respondent_department
        });
        console.log("🔍 useInterview - Valores dos dados:", {
          isInterviewer: meta.is_interviewer,
          interviewerName: meta.interviewer_name,
          respondentName: meta.respondent_name,
          respondentDepartment: meta.respondent_department
        });
        
        // Verificar se há metadados válidos para criar entrevista
        const hasValidMeta = meta.interviewer_name && meta.respondent_name && meta.respondent_department;
        console.log("🔍 useInterview - Metadados válidos?", hasValidMeta, {
          hasInterviewerName: !!meta.interviewer_name,
          hasRespondentName: !!meta.respondent_name,
          hasDepartment: !!meta.respondent_department
        });
        
        let interviewId = currentInterviewId;

        if (!interviewId) {
          // Só criar entrevista se houver metadados válidos
          if (!hasValidMeta) {
            console.log("⚠️ useInterview - Metadados insuficientes para criar entrevista, aguardando...");
            console.log("💡 useInterview - Entrevista será criada quando todos os campos obrigatórios forem preenchidos");
            return; // Não criar entrevista ainda
          }
          
          console.log("🆕 useInterview - Criando nova entrevista com metadados válidos...");
          const result = await createInterviewMutation.mutateAsync({
            isInterviewer: meta.is_interviewer,
            interviewerName: meta.interviewer_name,
            respondentName: meta.respondent_name,
            respondentDepartment: meta.respondent_department
          });
          console.log("✅ useInterview - Entrevista criada com metadados:", result.id);
          console.log("🔍 useInterview - Dados da entrevista criada:", {
            id: result.id,
            isInterviewer: result.isInterviewer,
            interviewerName: result.interviewerName,
            respondentName: result.respondentName,
            respondentDepartment: result.respondentDepartment
          });
          setInterviewId(result.id);
          interviewId = result.id;
          queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
        } else {
          console.log(`💾 useInterview - Salvando metadados da entrevista ${interviewId} no banco...`);
          const result = await interviewsApi.update(interviewId, {
            isInterviewer: meta.is_interviewer,
            interviewerName: meta.interviewer_name,
            respondentName: meta.respondent_name,
            respondentDepartment: meta.respondent_department
          });
          console.log("✅ useInterview - Metadados atualizados com sucesso:", result);
          console.log("🔍 useInterview - Dados da entrevista atualizada:", {
            id: result.id,
            isInterviewer: result.isInterviewer,
            interviewerName: result.interviewerName,
            respondentName: result.respondentName,
            respondentDepartment: result.respondentDepartment
          });
          console.log(`🎯 useInterview - Entrevista ${interviewId} - Metadados salvos no banco de dados!`);
        }
        queryClient.invalidateQueries({ queryKey: interviewKeys.detail(interviewId) });
        queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
        setTimeout(() => { queryClient.invalidateQueries({ queryKey: interviewKeys.all }); }, 100);
      } else {
        console.log("❌ useInterview - Sistema offline, não foi possível atualizar metadados");
      }
    } catch (error) {
      console.error("❌ useInterview - Erro ao atualizar metadados:", error);
      throw error;
    }
  };

  // Função para limpar a entrevista atual e campos
  const clearCurrentInterview = () => {
    console.log("🧹 useInterview - Limpando entrevista atual e campos...");
    
    // Limpar ID da entrevista atual
    setInterviewId(null);
    
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
    
    // Aguardar um pouco e forçar nova invalidação para garantir limpeza
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
      // Forçar limpeza adicional
      queryClient.clear();
    }, 100);
    
    console.log("✅ useInterview - Estado limpo completamente");
  };

  // Função para retomar uma entrevista específica
  const resumeInterview = async (interviewId: string) => {
    try {
      if (!isOnline) {
        throw new Error('Sistema offline. Conecte-se à internet para continuar.');
      }

      console.log("🔄 useInterview - Retomando entrevista:", interviewId);
      
      // Primeiro, limpar qualquer cache existente
      queryClient.removeQueries({ queryKey: interviewKeys.all });
      queryClient.clear();
      
      // Buscar dados da entrevista diretamente da API
      const interview = await interviewsApi.getById(interviewId);
      
      if (!interview) {
        throw new Error('Entrevista não encontrada');
      }
      
      if (interview.isCompleted) {
        throw new Error('Esta entrevista já foi concluída');
      }
      
      console.log("🔍 useInterview - Dados da entrevista retomada:", {
        id: interview.id,
        isInterviewer: interview.isInterviewer,
        interviewerName: interview.interviewerName,
        respondentName: interview.respondentName,
        respondentDepartment: interview.respondentDepartment,
        f1AnswersCount: interview.f1Answers ? Object.keys(interview.f1Answers).length : 0,
        f2AnswersCount: interview.f2Answers ? Object.keys(interview.f2Answers).length : 0,
        f3AnswersCount: interview.f3Answers ? Object.keys(interview.f3Answers).length : 0
      });
      
      // Definir como entrevista atual
      setInterviewId(interviewId);
      
      // Aguardar um pouco para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Forçar invalidação agressiva do cache
      queryClient.setQueryData(interviewKeys.detail(interviewId), interview);
      queryClient.invalidateQueries({ queryKey: interviewKeys.detail(interviewId) });
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
      
      console.log("✅ useInterview - Entrevista retomada com sucesso:", interviewId);
      console.log("📊 useInterview - Status da entrevista:", {
        f1Answers: interview.f1Answers ? Object.keys(interview.f1Answers).length : 0,
        f2Answers: interview.f2Answers ? Object.keys(interview.f2Answers).length : 0,
        f3Answers: interview.f3Answers ? Object.keys(interview.f3Answers).length : 0,
        isCompleted: interview.isCompleted
      });
      
      return interview;
    } catch (error) {
      console.error('❌ useInterview - Erro ao retomar entrevista:', error);
      throw error;
    }
  };

  // Função para completar entrevista
  const completeInterview = async () => {
    try {
      if (isOnline && currentInterviewId) {
        await interviewsApi.complete(currentInterviewId);
        // invalidar listas e detalhes para refletir status concluído
        queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
        queryClient.invalidateQueries({ queryKey: interviewKeys.all });
        queryClient.invalidateQueries({ queryKey: interviewKeys.detail(currentInterviewId) });
        setInterviewId(null);
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
    resumeInterview,
    error: createInterviewMutation.error || saveAnswersMutation.error || queryError,
  };
}

// Hook para listar todas as entrevistas
export function useInterviews() {
  const queryClient = useQueryClient();

  console.log('🔍 useInterviews - Hook iniciado');

  const { data: interviews, isLoading, error, refetch } = useQuery({
    queryKey: interviewKeys.lists(),
    queryFn: interviewsApi.getAll,
    // Forçar atualização da lista sempre que a tela montar
    staleTime: 0,
    refetchOnMount: 'always',
  });

  console.log('🔍 useInterviews - React Query retornou:', {
    data: interviews,
    isLoading,
    error,
    dataLength: interviews?.length || 0
  });
  
  // Log mais visível para debug
  if (interviews && interviews.length > 0) {
    console.log('🎯 DEBUG VISÍVEL - useInterviews - Primeira entrevista:', interviews[0]);
    console.log('🎯 DEBUG VISÍVEL - useInterviews - Campos da primeira entrevista:', {
      id: interviews[0].id,
      isInterviewer: interviews[0].isInterviewer,
      interviewerName: interviews[0].interviewerName,
      respondentName: interviews[0].respondentName,
      respondentDepartment: interviews[0].respondentDepartment,
      isCompleted: interviews[0].isCompleted
    });
  }

  const deleteInterviewMutation = useMutation({
    mutationFn: interviewsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
    },
  });

  // Função para atualizar status das entrevistas que têm todos os formulários preenchidos
  const updateInterviewStatuses = async () => {
    try {
      console.log('🔧 useInterviews - Atualizando status das entrevistas...');
      
      if (!interviews) return;
      
      for (const interview of interviews) {
        // Verificar se a entrevista tem todos os formulários preenchidos
        const hasF1 = interview.f1Answers && Object.keys(interview.f1Answers).length > 0;
        const hasF2 = interview.f2Answers && Object.keys(interview.f2Answers).length > 0;
        const hasF3 = interview.f3Answers && Object.keys(interview.f3Answers).length > 0;
        
        // Se todos os formulários estão preenchidos mas não está marcada como concluída
        if (hasF1 && hasF2 && hasF3 && !interview.isCompleted) {
          console.log(`🔧 useInterviews - Atualizando entrevista ${interview.id} para CONCLUÍDA`);
          
          // Chamar API para marcar como concluída
          const response = await fetch(`/api/interviews/${interview.id}/complete`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ configSnapshot: {} })
          });
          
          if (response.ok) {
            console.log(`✅ useInterviews - Entrevista ${interview.id} marcada como CONCLUÍDA`);
          } else {
            console.error(`❌ useInterviews - Erro ao marcar entrevista ${interview.id} como concluída`);
          }
        }
      }
      
      // Invalidar cache para refletir mudanças
      queryClient.invalidateQueries({ queryKey: interviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: interviewKeys.all });
      
    } catch (error) {
      console.error('❌ useInterviews - Erro ao atualizar status:', error);
    }
  };

  return {
    interviews: interviews || [],
    isLoading,
    error,
    deleteInterview: deleteInterviewMutation.mutate,
    isDeleting: deleteInterviewMutation.isPending,
    updateInterviewStatuses,
    refetchList: refetch,
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
