import { QUESTION_WEIGHTS, CATEGORY_WEIGHTS, type QuestionWeight, type CategoryWeight } from "./weights";
import type { Question } from "./types";

// Gerenciar pesos dinamicamente
export class WeightManager {
  private static instance: WeightManager;
  private questionWeights: QuestionWeight[] = [...QUESTION_WEIGHTS];
  private categoryWeights: CategoryWeight[] = [...CATEGORY_WEIGHTS];
  private readonly STORAGE_KEY = 'ppm.weights';

  private constructor() {
    // Tentar carregar de localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          if (data?.questionWeights && data?.categoryWeights) {
            this.questionWeights = data.questionWeights;
            this.categoryWeights = data.categoryWeights;
          }
        }
      }
    } catch (e) {
      // Silencioso: permanece com defaults
      console.warn('WeightManager: falha ao carregar pesos do localStorage', e);
    }
  }

  static getInstance(): WeightManager {
    if (!WeightManager.instance) {
      WeightManager.instance = new WeightManager();
    }
    return WeightManager.instance;
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const payload = JSON.stringify({
          questionWeights: this.questionWeights,
          categoryWeights: this.categoryWeights,
        });
        localStorage.setItem(this.STORAGE_KEY, payload);
      }
    } catch (e) {
      console.warn('WeightManager: falha ao salvar pesos no localStorage', e);
    }
  }

  // Adicionar peso para nova pergunta
  addQuestionWeight(question: Question, weight: number, category: string, analysisType: 'satisfaction' | 'usage' | 'functionality' | 'integration' | 'demographic' = 'functionality'): void {
    const newWeight: QuestionWeight = {
      questionId: question.id,
      weight,
      category,
      analysisType
    };

    // Remover peso existente se houver
    this.questionWeights = this.questionWeights.filter(w => w.questionId !== question.id);
    
    // Adicionar novo peso
    this.questionWeights.push(newWeight);

    // Adicionar categoria se não existir
    if (!this.categoryWeights.find(c => c.category === category)) {
      this.addCategoryWeight(category, weight, `Categoria adicionada dinamicamente: ${category}`);
    }
    this.persist();
  }

  // Adicionar peso para nova categoria
  addCategoryWeight(category: string, weight: number, description: string): void {
    const newCategoryWeight: CategoryWeight = {
      category,
      weight,
      description
    };

    // Remover categoria existente se houver
    this.categoryWeights = this.categoryWeights.filter(c => c.category !== category);
    
    // Adicionar nova categoria
    this.categoryWeights.push(newCategoryWeight);
    this.persist();
  }

  // Obter peso de uma pergunta
  getQuestionWeight(questionId: string): QuestionWeight | undefined {
    return this.questionWeights.find(w => w.questionId === questionId);
  }

  // Obter peso de uma categoria
  getCategoryWeight(category: string): CategoryWeight | undefined {
    return this.categoryWeights.find(w => w.category === category);
  }

  // Obter todos os pesos de perguntas
  getAllQuestionWeights(): QuestionWeight[] {
    return [...this.questionWeights];
  }

  // Obter todos os pesos de categorias
  getAllCategoryWeights(): CategoryWeight[] {
    return [...this.categoryWeights];
  }

  // Remover peso de pergunta
  removeQuestionWeight(questionId: string): void {
    this.questionWeights = this.questionWeights.filter(w => w.questionId !== questionId);
    this.persist();
  }

  // Atualizar peso de pergunta existente
  updateQuestionWeight(questionId: string, updates: Partial<QuestionWeight>): void {
    const index = this.questionWeights.findIndex(w => w.questionId === questionId);
    if (index !== -1) {
      this.questionWeights[index] = { ...this.questionWeights[index], ...updates };
      this.persist();
    }
  }

  // Exportar configuração atual de pesos
  exportWeights(): { questionWeights: QuestionWeight[], categoryWeights: CategoryWeight[] } {
    return {
      questionWeights: [...this.questionWeights],
      categoryWeights: [...this.categoryWeights]
    };
  }

  // Importar configuração de pesos
  importWeights(weights: { questionWeights: QuestionWeight[], categoryWeights: CategoryWeight[] }): void {
    this.questionWeights = [...weights.questionWeights];
    this.categoryWeights = [...weights.categoryWeights];
    this.persist();
  }

  // Reset para pesos padrão
  resetToDefaults(): void {
    this.questionWeights = [...QUESTION_WEIGHTS];
    this.categoryWeights = [...CATEGORY_WEIGHTS];
    this.persist();
  }
}

// Função helper para usar o WeightManager
export function addNewQuestionWeight(question: Question, weight: number, category: string, analysisType?: 'satisfaction' | 'usage' | 'functionality' | 'integration' | 'demographic'): void {
  const manager = WeightManager.getInstance();
  manager.addQuestionWeight(question, weight, category, analysisType);
}

// Função helper para obter peso de pergunta
export function getQuestionWeight(questionId: string): QuestionWeight | undefined {
  const manager = WeightManager.getInstance();
  return manager.getQuestionWeight(questionId);
}

// Função helper para obter peso de categoria
export function getCategoryWeight(category: string): CategoryWeight | undefined {
  const manager = WeightManager.getInstance();
  return manager.getCategoryWeight(category);
}

// Função helper para obter todos os pesos
export function getAllWeights(): { questionWeights: QuestionWeight[], categoryWeights: CategoryWeight[] } {
  const manager = WeightManager.getInstance();
  return manager.exportWeights();
}
