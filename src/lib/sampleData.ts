import type { PpmConfig } from "./types";

// Fallback vazio, só para não quebrar a UI quando não houver config salva
export const SAMPLE_JSON: PpmConfig = {
  "forms": [],
  "lookups": {
    "SISTEMAS_ESSENCIAIS": [],
    "FERRAMENTAS_PPM": [],
    "TIPOS_DADOS_SINCRONIZAR": []
  }
};