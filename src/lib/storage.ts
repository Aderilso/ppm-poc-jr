import type { PpmConfig, PpmMeta, Answers } from "./types";

const STORAGE_KEYS = {
  CONFIG: "ppm.config.json",
  ANSWERS_F1: "ppm.answers.f1", 
  ANSWERS_F2: "ppm.answers.f2",
  ANSWERS_F3: "ppm.answers.f3",
  META: "ppm.meta",
} as const;

export function saveConfig(config: PpmConfig): void {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

export function loadConfig(): PpmConfig | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Função para componentes que precisam de fallback
export function loadConfigWithFallback(): PpmConfig {
  const config = loadConfig();
  if (config) return config;
  
  // Importar o fallback aqui para evitar dependência circular
  const { SAMPLE_JSON } = require("./sampleData");
  return SAMPLE_JSON;
}

export function saveAnswers(formId: "f1" | "f2" | "f3", answers: Answers): void {
  const key = formId === "f1" ? STORAGE_KEYS.ANSWERS_F1 
            : formId === "f2" ? STORAGE_KEYS.ANSWERS_F2 
            : STORAGE_KEYS.ANSWERS_F3;
  localStorage.setItem(key, JSON.stringify(answers));
}

export function loadAnswers(formId: "f1" | "f2" | "f3"): Answers {
  try {
    const key = formId === "f1" ? STORAGE_KEYS.ANSWERS_F1 
              : formId === "f2" ? STORAGE_KEYS.ANSWERS_F2 
              : STORAGE_KEYS.ANSWERS_F3;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveMeta(meta: PpmMeta): void {
  localStorage.setItem(STORAGE_KEYS.META, JSON.stringify(meta));
}

export function loadMeta(): PpmMeta {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.META);
    return data ? JSON.parse(data) : { is_interviewer: false };
  } catch {
    return { is_interviewer: false };
  }
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

export function hasData(): boolean {
  return Object.values(STORAGE_KEYS).some(key => 
    localStorage.getItem(key) !== null
  );
}