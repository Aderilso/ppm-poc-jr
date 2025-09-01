export type QuestionType = 
  "escala_0_10" |
  "escala_1_5" |
  "lista_de_priorização_(arrastar_e_soltar_ou_ranking_1_3)" |
  "lista_suspensa_(<_1_Ano,_1_3_Anos,_3_5_Anos,_5_10_Anos,_>_10_Anos)" |
  "lista_suspensa_(Diariamente,_Semanalmente,_Quinzenalmente,_Mensalmente,_Esporadicamente)" |
  "lista_suspensa_(Gerente_de_Projeto,_Analista,_Coordenador,_Diretor,_Consultor,_Scrum_Master,_Outro)" |
  "lista_suspensa_(Integração_Automática,_Export/Import,_Digitação_Manual,_Não_Há_Troca,_Não_Sei)" |
  "lista_suspensa_(TI,_Finanças,_RH,_Operações,_Marketing,_PMO,_Estratégia,_Outro)" |
  "lista_suspensa_baseada_na_resposta_anterior" |
  "lista_suspensa_baseada_nas_respostas_anteriores" |
  "multipla" |
  "selecionar_1" |
  "sim/não" |
  "sim/não/parcialmente_+_campo_para_especificar_quais" |
  "sim/não_(pergunta_filtro)" |
  "texto";

export interface Question {
  id: string;
  pergunta: string;
  tipo: QuestionType;
  legenda: string;
  categoria?: string;
}

export interface FormSpec {
  id: "f1" | "f2" | "f3";
  title: string;
  questions: Question[];
}

export interface Lookups {
  SISTEMAS_ESSENCIAIS: string[];
  FERRAMENTAS_PPM: string[];
  TIPOS_DADOS_SINCRONIZAR: string[];
}

export interface PpmConfig {
  forms: FormSpec[];
  lookups: Lookups;
}

export interface PpmMeta {
  is_interviewer: boolean;
  interviewer_name?: string;
  respondent_name?: string;
  respondent_department?: string;
}

export interface Answers {
  [questionId: string]: string | string[];
}

export interface FormAnswers {
  f1: Answers;
  f2: Answers;
  f3: Answers;
}

// Re-export from analysis for convenience
export type { AnalysisResult } from "./analysis";