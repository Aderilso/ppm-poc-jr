const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Tipos para a API
export interface ApiInterview {
  id: string;
  createdAt: string;
  updatedAt: string;
  isInterviewer: boolean;
  interviewerName?: string;
  respondentName?: string;
  respondentDepartment?: string;
  f1Answers?: Record<string, any>;
  f2Answers?: Record<string, any>;
  f3Answers?: Record<string, any>;
  isCompleted: boolean;
  completedAt?: string;
  configSnapshot?: any;
}

export interface ApiConfig {
  id: string;
  createdAt: string;
  updatedAt: string;
  forms: any[];
  lookups: any;
  name?: string;
  description?: string;
  isActive: boolean;
}

export interface ApiAnalysis {
  id: string;
  createdAt: string;
  interviewId: string;
  overallScore: number;
  categoryScores: any;
  satisfactionScore: number;
  functionalityScore: number;
  integrationScore: number;
  usageScore: number;
  insights: string[];
  recommendations: string[];
  interview?: ApiInterview;
}

export interface ApiStats {
  totalInterviews: number;
  completedInterviews: number;
  totalAnalyses: number;
  completionRate: number;
  averageScores: {
    overallScore?: number;
    satisfactionScore?: number;
    functionalityScore?: number;
    integrationScore?: number;
    usageScore?: number;
  };
}

// Função helper para fazer requisições
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// API de Entrevistas
export const interviewsApi = {
  // Criar nova entrevista
  create: (data: {
    isInterviewer: boolean;
    interviewerName?: string;
    respondentName?: string;
    respondentDepartment?: string;
  }): Promise<ApiInterview> => {
    return apiRequest<ApiInterview>('/interviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Buscar todas as entrevistas
  getAll: (): Promise<ApiInterview[]> => {
    console.log('🔍 API - interviewsApi.getAll chamada');
    console.log('🔍 API - URL base:', API_BASE_URL);
    console.log('🔍 API - Endpoint completo:', `${API_BASE_URL}/interviews`);
    
    return apiRequest<ApiInterview[]>('/interviews').then(data => {
      console.log('✅ API - interviewsApi.getAll retornou:', {
        totalInterviews: data.length,
        interviews: data.map(i => ({
          id: i.id,
          isInterviewer: i.isInterviewer,
          interviewerName: i.interviewerName,
          respondentName: i.respondentName,
          respondentDepartment: i.respondentDepartment,
          isCompleted: i.isCompleted
        }))
      });
      
      // ALERT FORÇADO PARA DEBUG
      if (data.length > 0) {
        alert(`DEBUG API: Dados retornados do backend!
Total: ${data.length}
Primeira entrevista:
- ID: ${data[0].id}
- Respondente: "${data[0].respondentName || 'NULL'}"
- Departamento: "${data[0].respondentDepartment || 'NULL'}"
- isInterviewer: ${data[0].isInterviewer}`);
      }
      
      return data;
    }).catch(error => {
      console.error('❌ API - interviewsApi.getAll erro:', error);
      throw error;
    });
  },

  // Buscar entrevista por ID
  getById: (id: string): Promise<ApiInterview> => {
    return apiRequest<ApiInterview>(`/interviews/${id}`);
  },

  // Atualizar entrevista
  update: (id: string, data: Partial<ApiInterview>): Promise<ApiInterview> => {
    return apiRequest<ApiInterview>(`/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Salvar respostas de um formulário
  saveAnswers: (id: string, formId: 'f1' | 'f2' | 'f3', answers: Record<string, any>): Promise<ApiInterview> => {
    return apiRequest<ApiInterview>(`/interviews/${id}/answers`, {
      method: 'PUT',
      body: JSON.stringify({ formId, answers }),
    });
  },

  // Completar entrevista
  complete: (id: string, configSnapshot?: any): Promise<ApiInterview> => {
    return apiRequest<ApiInterview>(`/interviews/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ configSnapshot }),
    });
  },

  // Deletar entrevista
  delete: (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/interviews/${id}`, {
      method: 'DELETE',
    });
  },
};

// API de Configurações
export const configsApi = {
  // Criar nova configuração
  create: (data: {
    forms: any[];
    lookups: any;
    name?: string;
    description?: string;
  }): Promise<ApiConfig> => {
    return apiRequest<ApiConfig>('/configs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Buscar todas as configurações
  getAll: (): Promise<ApiConfig[]> => {
    return apiRequest<ApiConfig[]>('/configs');
  },

  // Buscar configuração ativa
  getActive: (): Promise<ApiConfig | null> => {
    return apiRequest<ApiConfig | null>('/configs/active');
  },
};

// API de Operações Críticas
export const criticalApi = {
  // Apagar banco de dados (CRÍTICO)
  clearDatabase: (): Promise<{
    message: string;
    deleted: {
      analyses: number;
      interviews: number;
      configs: number;
    };
  }> => {
    return apiRequest('/database/clear', {
      method: 'DELETE',
    });
  },
};

// API de Análises
export const analysesApi = {
  // Criar nova análise
  create: (data: {
    interviewId: string;
    overallScore: number;
    categoryScores: any;
    satisfactionScore: number;
    functionalityScore: number;
    integrationScore: number;
    usageScore: number;
    insights: string[];
    recommendations: string[];
  }): Promise<ApiAnalysis> => {
    return apiRequest<ApiAnalysis>('/analyses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Buscar todas as análises
  getAll: (): Promise<ApiAnalysis[]> => {
    return apiRequest<ApiAnalysis[]>('/analyses');
  },
};

// API de Estatísticas
export const statsApi = {
  // Buscar estatísticas gerais
  getStats: (): Promise<ApiStats> => {
    return apiRequest<ApiStats>('/stats');
  },
};

// API de Health Check
export const healthApi = {
  // Verificar status da API
  check: (): Promise<{ status: string; timestamp: string }> => {
    return apiRequest<{ status: string; timestamp: string }>('/health');
  },
};

// Hook para verificar se a API está disponível
export const useApiHealth = () => {
  const checkHealth = async (): Promise<boolean> => {
    try {
      await healthApi.check();
      return true;
    } catch {
      return false;
    }
  };

  return { checkHealth };
};
