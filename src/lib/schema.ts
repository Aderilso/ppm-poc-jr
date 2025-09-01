import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().min(1),
  pergunta: z.string().min(1),
  tipo: z.enum(["escala_1_5", "escala_0_10", "multipla", "selecionar_1", "texto"]),
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