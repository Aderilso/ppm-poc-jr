import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().min(1),
  pergunta: z.string().min(1),
  tipo: z.enum([
    "escala_0_10",
    "escala_1_5",
    "lista_de_priorização_(arrastar_e_soltar_ou_ranking_1_3)",
    "lista_suspensa_(<_1_Ano,_1-3_Anos,_3-5_Anos,_5-10_Anos,_>_10_Anos)",
    "lista_suspensa_(Diariamente,_Semanalmente,_Quinzenalmente,_Mensalmente,_Esporadicamente)",
    "lista_suspensa_(Gerente_de_Projeto,_Analista,_Coordenador,_Diretor,_Consultor,_Scrum_Master,_Outro)",
    "lista_suspensa_(Integração_Automática,_Export/Import,_Digitação_Manual,_Não_Há_Troca,_Não_Sei)",
    "lista_suspensa_(TI,_Finanças,_RH,_Operações,_Marketing,_PMO,_Estratégia,_Outro)",
    "lista_suspensa_baseada_na_resposta_anterior",
    "lista_suspensa_baseada_nas_respostas_anteriores",
    "multipla",
    "selecionar_1",
    "sim/não",
    "sim/não/parcialmente_+_campo_para_especificar_quais",
    "sim/não_(pergunta_filtro)",
    "texto"
  ]),
  legenda: z.string(),
  categoria: z.string().optional(),
  active: z.boolean().optional(), // Campo para controlar se a pergunta está ativa
});

export const formSpecSchema = z.object({
  id: z.enum(["f1", "f2", "f3"]),
  title: z.string().min(1),
  questions: z.array(questionSchema),
});

export const lookupsSchema = z.object({
  SISTEMAS_ESSENCIAIS: z.array(z.string()),
  FERRAMENTAS_PPM: z.array(z.string()),
  TIPOS_DADOS_SINCRONIZAR: z.array(z.string()),
});

export const ppmConfigSchema = z.object({
  forms: z.array(formSpecSchema),
  lookups: lookupsSchema,
});

export function validatePpmConfig(data: unknown): { success: true; data: any } | { success: false; errors: string[] } {
  try {
    const result = ppmConfigSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { success: false, errors: ["Erro de validação desconhecido"] };
  }
}