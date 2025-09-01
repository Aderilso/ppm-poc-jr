import type { PpmConfig, PpmMeta, Answers } from "./types";

export interface CsvRow {
  form_id: string;
  question_id: string;
  pergunta: string;
  resposta: string;
  is_interviewer: boolean;
  interviewer_name: string;
  respondent_name: string;
  respondent_department: string;
  timestamp: string;
}

export function generateCsvData(
  config: PpmConfig,
  formId: "f1" | "f2" | "f3" | "consolidado",
  answers: { f1: Answers; f2: Answers; f3: Answers },
  meta: PpmMeta
): CsvRow[] {
  const timestamp = new Date().toISOString();
  const rows: CsvRow[] = [];

  const formsToProcess = formId === "consolidado" 
    ? config.forms 
    : config.forms.filter(form => form.id === formId);

  for (const form of formsToProcess) {
    const formAnswers = answers[form.id] || {};
    
    for (const question of form.questions) {
      let resposta = formAnswers[question.id] || "";
      
      // Para múltipla escolha, juntar com ;
      if (Array.isArray(resposta)) {
        resposta = resposta.join(";");
      }

      rows.push({
        form_id: form.id,
        question_id: question.id,
        pergunta: question.pergunta,
        resposta: String(resposta),
        is_interviewer: meta.is_interviewer,
        interviewer_name: meta.interviewer_name || "",
        respondent_name: meta.respondent_name || "",
        respondent_department: meta.respondent_department || "",
        timestamp
      });
    }
  }

  return rows;
}

export function downloadCsv(data: CsvRow[], filename: string): void {
  const headers = [
    "form_id",
    "question_id", 
    "pergunta",
    "resposta",
    "is_interviewer",
    "interviewer_name",
    "respondent_name", 
    "respondent_department",
    "timestamp"
  ];

  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header as keyof CsvRow];
        // Escapar aspas e quebras de linha
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function generateFileName(formId: "f1" | "f2" | "f3" | "consolidado"): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 16).replace(/[:-]/g, "").replace("T", "-");
  
  return `PPM_${formId === "consolidado" ? "consolidado" : `form_${formId}`}_${timestamp}.csv`;
}