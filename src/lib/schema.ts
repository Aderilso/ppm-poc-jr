import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().min(1),
  pergunta: z.string().min(1),
  tipo: z.enum([
    "escala_1_5", "escala_0_10", "multipla", "selecionar_1", "texto",
    "lista_suspensa_(ti,_finanças,_rh,_operações,_marketing,_pmo,_estratégia,_outro)",
    "lista_suspensa_(gp,_analista,_coordenador,_diretor,_consultor,_scrum_master,_outro)",
    "lista_suspensa_(<_1_ano,_1_3_anos,_3_5_anos,_5_10_anos,_>_10_anos)",
    "lista_suspensa_(diariamente,_semanalmente,_quinzenalmente,_mensalmente,_esporadicamente)",
    "sim/não_(pergunta_filtro)",
    "lista_suspensa_baseada_na_resposta_anterior",
    "sim/não",
    "sim/não/parcialmente_+_campo_para_especificar_quais",
    "lista_suspensa_(integração_automática,_export/import,_digitação_manual,_não_há_troca,_não_sei)",
    "lista_de_priorização_(arrastar_e_soltar_ou_ranking_1_3)",
    "lista_suspensa_baseada_nas_respostas_anteriores"
  ]),
  legenda: z.string(),
  categoria: z.string().optional(),
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