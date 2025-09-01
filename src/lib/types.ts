export type QuestionType = "escala_1_5" | "escala_0_10" | "multipla" | "selecionar_1" | "texto" | 
  "lista_suspensa_(ti,_finanças,_rh,_operações,_marketing,_pmo,_estratégia,_outro)" |
  "lista_suspensa_(gp,_analista,_coordenador,_diretor,_consultor,_scrum_master,_outro)" |
  "lista_suspensa_(<_1_ano,_1_3_anos,_3_5_anos,_5_10_anos,_>_10_anos)" |
  "lista_suspensa_(diariamente,_semanalmente,_quinzenalmente,_mensalmente,_esporadicamente)" |
  "sim/não_(pergunta_filtro)" |
  "lista_suspensa_baseada_na_resposta_anterior" |
  "sim/não" |
  "sim/não/parcialmente_+_campo_para_especificar_quais" |
  "lista_suspensa_(integração_automática,_export/import,_digitação_manual,_não_há_troca,_não_sei)" |
  "lista_de_priorização_(arrastar_e_soltar_ou_ranking_1_3)" |
  "lista_suspensa_baseada_nas_respostas_anteriores";

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