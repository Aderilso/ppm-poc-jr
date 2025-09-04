import type { PpmConfig, FormAnswers, PpmMeta } from "./types";
import { interviewsApi } from "./api";

export interface ConsolidatedImportResult {
  success: boolean;
  message: string;
  importedInterviews: number;
  skippedInterviews: number;
  errors: string[];
}

// Processar CSV consolidado e criar entrevistas individuais
export async function importConsolidatedCsv(
  csvContent: string, 
  config: PpmConfig, 
  formId: "f1" | "f2" | "f3"
): Promise<ConsolidatedImportResult> {
  const result: ConsolidatedImportResult = {
    success: false,
    message: "",
    importedInterviews: 0,
    skippedInterviews: 0,
    errors: []
  };

  try {
    // Parse CSV
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0] ? parseCsvLine(lines[0]).map(h => h.replace(/"/g, '').trim()) : [];
    
    if (headers.length === 0) {
      result.message = "Arquivo CSV inválido: cabeçalhos não encontrados";
      return result;
    }

    // Encontrar índices das colunas importantes
    const respondentNameIndex = headers.findIndex(h => h === 'respondent_name');
    const respondentDeptIndex = headers.findIndex(h => h === 'respondent_department');
    const interviewerNameIndex = headers.findIndex(h => h === 'interviewer_name');
    const respostaIndex = headers.findIndex(h => h === 'resposta');
    const questionIdIndex = headers.findIndex(h => h === 'question_id');
    const timestampIndex = headers.findIndex(h => h === 'timestamp');
    const isCompletedIndex = headers.findIndex(h => h === 'is_completed');

    if (respondentNameIndex === -1 || respostaIndex === -1 || questionIdIndex === -1) {
      result.message = "Arquivo CSV inválido: colunas obrigatórias não encontradas";
      return result;
    }

    // Agrupar linhas por entrevista (respondent_name + timestamp)
    const interviewsMap = new Map<string, any[]>();
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = parseCsvLine(line).map(v => v.replace(/"/g, '').trim());
      const respondentName = values[respondentNameIndex];
      const timestamp = values[timestampIndex] || new Date().toISOString();
      
      if (!respondentName || respondentName === 'respondent_name') continue;
      
      const interviewKey = `${respondentName}_${timestamp}`;
      
      if (!interviewsMap.has(interviewKey)) {
        interviewsMap.set(interviewKey, []);
      }
      
      interviewsMap.get(interviewKey)!.push({
        respondentName,
        respondentDepartment: values[respondentDeptIndex] || '',
        interviewerName: values[interviewerNameIndex] || '',
        questionId: values[questionIdIndex],
        resposta: values[respostaIndex],
        timestamp,
        isCompleted: values[isCompletedIndex] === 'true'
      });
    }

    // Processar cada entrevista
    // Buscar entrevistas existentes uma vez para deduplicação simples
    const allExisting = await interviewsApi.getAll();

    for (const [interviewKey, responses] of interviewsMap) {
      try {
        const [respondentName, timestamp] = interviewKey.split('_');
        // Deduplicação básica por respondente + data de criação (string exata)
        const existingInterview = allExisting.find(interview => 
          interview.respondentName === respondentName && 
          interview.createdAt === timestamp
        );

        // Organizar respostas por formulário
        const answers: Record<string, any> = {};
        
        responses.forEach(response => {
          if (response.questionId && response.resposta) {
            // Processar resposta baseada no tipo de pergunta
            let processedAnswer = response.resposta;
            
            // Se contém ';', é múltipla escolha
            if (response.resposta.includes(';')) {
              processedAnswer = response.resposta.split(';').map((a: string) => a.trim()).filter((a: string) => a);
            }
            
            answers[response.questionId] = processedAnswer;
          }
        });

        if (existingInterview) {
          // Atualizar entrevista existente (merge)
          const detail = await interviewsApi.getById(existingInterview.id);
          const existingAns = (detail as any)[`${formId}Answers`] || {};
          const merged = { ...existingAns, ...answers };
          if (Object.keys(merged).length > 0) {
            await interviewsApi.saveAnswers(existingInterview.id, formId, merged);
          }
          if (responses[0]?.isCompleted) {
            await interviewsApi.complete(existingInterview.id, JSON.stringify(config));
          }
          result.importedInterviews++;
        } else {
          // Criar nova entrevista
          const interview = await interviewsApi.create({
            isInterviewer: !!responses[0]?.interviewerName,
            interviewerName: responses[0]?.interviewerName || undefined,
            respondentName: responses[0]?.respondentName,
            respondentDepartment: responses[0]?.respondentDepartment || undefined,
            createdAt: timestamp,
          });
          if (Object.keys(answers).length > 0) {
            await interviewsApi.saveAnswers(interview.id, formId, answers);
          }
          if (responses[0]?.isCompleted) {
            await interviewsApi.complete(interview.id, JSON.stringify(config));
          }
          result.importedInterviews++;
        }
        
      } catch (error) {
        const errorMsg = `Erro ao importar entrevista ${interviewKey}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        result.errors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }

    result.success = result.importedInterviews > 0;
    result.message = `Importação concluída: ${result.importedInterviews} entrevistas importadas, ${result.skippedInterviews} ignoradas`;
    
    if (result.errors.length > 0) {
      result.message += `\n${result.errors.length} erros encontrados`;
    }

    return result;
    
  } catch (error) {
    result.message = `Erro geral na importação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
    return result;
  }
}

// Validar arquivo consolidado antes da importação
export function validateConsolidatedCsv(csvContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      errors.push("Arquivo deve ter pelo menos cabeçalho e uma linha de dados");
      return { valid: false, errors };
    }

    const headers = lines[0] ? parseCsvLine(lines[0]).map(h => h.replace(/"/g, '').trim()) : [];
    const requiredHeaders = ['respondent_name', 'question_id', 'resposta'];
    
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        errors.push(`Coluna obrigatória não encontrada: ${required}`);
      }
    }

    // Verificar se há dados válidos
    let hasValidData = false;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const values = parseCsvLine(line).map(v => v.replace(/"/g, '').trim());
      const respondentName = values[headers.indexOf('respondent_name')];
      
      if (respondentName && respondentName !== 'respondent_name' && respondentName !== '') {
        hasValidData = true;
        break;
      }
    }

    if (!hasValidData) {
      errors.push("Nenhum dado válido encontrado no arquivo");
    }

    return { valid: errors.length === 0, errors };
    
  } catch (error) {
    errors.push(`Erro ao validar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    return { valid: false, errors };
  }
}

// Parser robusto para CSV (suporta vírgulas entre aspas)
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // Duas aspas seguidas no modo quoted viram uma aspas literal
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // pular a segunda aspas
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
