import type { PpmConfig, FormAnswers, PpmMeta } from "./types";
import { interviewsApi } from "./api";

export interface ConsolidatedFormData {
  form_id: string;
  form_title: string;
  question_id: string;
  pergunta: string;
  question_type: string;
  category?: string;
  respondent_name: string;
  respondent_department: string;
  interviewer_name: string;
  resposta: string;
  timestamp: string;
  interview_id: string;
  is_completed: boolean;
}

export interface FormConsolidationStats {
  form_id: string;
  form_title: string;
  total_interviews: number;
  completed_interviews: number;
  total_questions: number;
  completion_rate: number;
  date_range: {
    earliest: string;
    latest: string;
  };
}

// Buscar todas as entrevistas do banco de dados
async function getAllInterviews() {
  try {
    const interviews = await interviewsApi.getAll();
    return interviews;
  } catch (error) {
    console.error('Erro ao buscar entrevistas:', error);
    throw new Error('Não foi possível buscar as entrevistas do banco de dados');
  }
}

// Consolidar entrevistas por formulário
export async function consolidateFormInterviews(
  config: PpmConfig,
  formId: "f1" | "f2" | "f3"
): Promise<{ data: ConsolidatedFormData[], stats: FormConsolidationStats }> {
  const interviews = await getAllInterviews();
  const form = config.forms.find(f => f.id === formId);
  
  if (!form) {
    throw new Error(`Formulário ${formId} não encontrado`);
  }

  const consolidatedData: ConsolidatedFormData[] = [];
  const formInterviews = interviews.filter(interview => {
    const answers = interview[`${formId}Answers`];
    return answers && typeof answers === 'string' && answers.trim() !== '';
  });

  let earliestDate = new Date();
  let latestDate = new Date(0);

  for (const interview of formInterviews) {
    try {
      const answersString = interview[`${formId}Answers`];
      if (!answersString || typeof answersString !== 'string') {
        console.warn(`Entrevista ${interview.id} não tem respostas válidas para ${formId}`);
        continue;
      }

      const answers = JSON.parse(answersString);
      const interviewDate = new Date(interview.createdAt);
      
      if (interviewDate < earliestDate) earliestDate = interviewDate;
      if (interviewDate > latestDate) latestDate = interviewDate;

      for (const question of form.questions) {
        const answer = answers[question.id];
        if (answer !== undefined && answer !== null && answer !== '') {
          let resposta = answer;
          
          // Para múltipla escolha, juntar com ;
          if (Array.isArray(resposta)) {
            resposta = resposta.join(";");
          }

          consolidatedData.push({
            form_id: form.id,
            form_title: form.title,
            question_id: question.id,
            pergunta: question.pergunta,
            question_type: question.tipo,
            category: question.categoria,
            respondent_name: interview.respondentName || 'Anônimo',
            respondent_department: interview.respondentDepartment || '',
            interviewer_name: interview.interviewerName || '',
            resposta: String(resposta),
            timestamp: interview.createdAt,
            interview_id: interview.id,
            is_completed: interview.isCompleted
          });
        }
      }
    } catch (error) {
      console.error(`Erro ao processar entrevista ${interview.id}:`, error);
      // Continuar com a próxima entrevista
    }
  }

  const stats: FormConsolidationStats = {
    form_id: form.id,
    form_title: form.title,
    total_interviews: formInterviews.length,
    completed_interviews: formInterviews.filter(i => i.isCompleted).length,
    total_questions: form.questions.length,
    completion_rate: formInterviews.length > 0 ? 
      (formInterviews.filter(i => i.isCompleted).length / formInterviews.length) * 100 : 0,
    date_range: {
      earliest: earliestDate.toISOString(),
      latest: latestDate.toISOString()
    }
  };

  return { data: consolidatedData, stats };
}

// Gerar CSV consolidado por formulário
export function generateConsolidatedFormCsv(data: ConsolidatedFormData[], stats: FormConsolidationStats): string {
  const headers = [
    "form_id",
    "form_title", 
    "question_id",
    "pergunta",
    "question_type",
    "category",
    "respondent_name",
    "respondent_department",
    "interviewer_name",
    "resposta",
    "timestamp",
    "interview_id",
    "is_completed"
  ];

  // Adicionar cabeçalho com estatísticas
  const statsHeader = [
    `=== CONSOLIDADO ${stats.form_title.toUpperCase()} ===`,
    `Total de Entrevistas: ${stats.total_interviews}`,
    `Entrevistas Completas: ${stats.completed_interviews}`,
    `Taxa de Conclusão: ${stats.completion_rate.toFixed(1)}%`,
    `Período: ${new Date(stats.date_range.earliest).toLocaleDateString('pt-BR')} a ${new Date(stats.date_range.latest).toLocaleDateString('pt-BR')}`,
    `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
    ""
  ];

  const csvContent = [
    ...statsHeader,
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header as keyof ConsolidatedFormData];
        // Escapar aspas e quebras de linha
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(",")
    )
  ].join("\n");

  return csvContent;
}

// Download do CSV consolidado
export function downloadConsolidatedFormCsv(csvContent: string, formId: string, stats: FormConsolidationStats): void {
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, "").replace("T", "-");
  const filename = `PPM_Consolidado_${formId.toUpperCase()}_${stats.total_interviews}entrevistas_${timestamp}.csv`;
  
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
