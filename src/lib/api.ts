// Configuração da API baseada no ambiente
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? '/api'  // Usar proxy do Vite em desenvolvimento
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

console.log('🔧 API - Configuração:', {
  isDevelopment,
  API_BASE_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL
});

// Tipos para a API
export interface ApiInterview {
  id: string;
  code?: string;
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
  
  console.log(`🔍 API - Fazendo requisição para: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  console.log(`🔍 API - Resposta recebida: ${response.status} ${response.statusText}`);
  console.log(`🔍 API - Content-Type: ${response.headers.get('content-type')}`);

  if (!response.ok) {
    console.error(`❌ API - Erro HTTP ${response.status}: ${response.statusText}`);
    
    // Tentar ler o corpo da resposta para debug
    let errorBody = '';
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorBody = JSON.stringify(errorData);
      } else {
        errorBody = await response.text();
        console.error(`❌ API - Corpo da resposta (não-JSON):`, errorBody.substring(0, 200));
      }
    } catch (parseError) {
      console.error(`❌ API - Erro ao ler corpo da resposta:`, parseError);
      errorBody = 'Erro ao ler resposta do servidor';
    }
    
    const snippet = isDevelopment ? errorBody : errorBody.substring(0, 200);
    // Log completo no console para facilitar diagnóstico em dev
    if (isDevelopment) {
      console.error('❌ API - Corpo de erro completo:', errorBody);
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${snippet}`);
  }

  // Verificar se a resposta é JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    console.error(`❌ API - Resposta não é JSON: ${contentType}`);
    throw new Error(`Resposta não é JSON: ${contentType}`);
  }

  try {
    const data = await response.json();
    console.log(`✅ API - Dados recebidos com sucesso para ${endpoint}`);
    return data;
  } catch (parseError) {
    console.error(`❌ API - Erro ao fazer parse JSON:`, parseError);
    throw new Error(`Erro ao fazer parse da resposta JSON: ${parseError.message}`);
  }
}

// API de Entrevistas
export const interviewsApi = {
  // Criar nova entrevista
  create: (data: {
    isInterviewer: boolean;
    interviewerName?: string;
    respondentName?: string;
    respondentDepartment?: string;
    createdAt?: string; // opcional, permite definir o createdAt (ex.: importação via CSV)
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
