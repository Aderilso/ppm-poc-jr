export type QuestionType = "escala_1_5" | "escala_0_10" | "multipla" | "selecionar_1" | "texto";

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