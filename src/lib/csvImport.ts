import type { PpmConfig, FormAnswers, PpmMeta } from "./types";
import { saveAnswers, saveMeta } from "./storage";
import { toast } from "@/hooks/use-toast";

// Gerar template CSV para um formulário específico
export function generateFormCsvTemplate(config: PpmConfig, formId: "f1" | "f2" | "f3"): string {
  const form = config.forms.find(f => f.id === formId);
  if (!form) {
    throw new Error(`Formulário ${formId} não encontrado`);
  }

  const activeQuestions = form.questions.filter(q => q.active !== false);
  
  // Cabeçalhos básicos
  const headers = [
    "respondent_name",
    "respondent_department", 
    "interviewer_name",
    "timestamp"
  ];

  // Adicionar IDs das perguntas como colunas
  activeQuestions.forEach(question => {
    headers.push(question.id);
  });

  // Linha com as perguntas (para facilitar o preenchimento)
  const questionRow = [
    "PERGUNTA →",
    "Departamento/Área",
    "Entrevistador (opcional)",
    "Data/Hora"
  ];

  activeQuestions.forEach(question => {
    questionRow.push(question.pergunta);
  });

  // Linha com as opções de resposta
  const optionsRow = [
    "OPÇÕES →",
    "Ex: TI, Finanças, RH...",
    "Nome do entrevistador",
    "AAAA-MM-DD HH:MM"
  ];

  activeQuestions.forEach(question => {
    let options = "";
    
    switch (question.tipo) {
      case "escala_1_5":
        options = "1, 2, 3, 4, 5";
        break;
      case "escala_0_10":
        options = "0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10";
        break;
      case "sim/não":
        options = "Sim, Não";
        break;
      case "sim/não/parcialmente_+_campo_para_especificar_quais":
        options = "Sim, Não, Parcialmente";
        break;
      case "multipla":
        options = getQuestionOptions(question, config) || "Opção1;Opção2;Opção3 (separar por ;)";
        break;
      case "selecionar_1":
        options = getQuestionOptions(question, config) || "Escolher uma opção";
        break;
      case "texto":
        options = "Resposta em texto livre";
        break;
      case "lista_de_priorização_(arrastar_e_soltar_ou_ranking_1_3)":
        options = "1, 2, 3 (ordem de prioridade)";
        break;
      default:
        if (question.tipo.includes("lista_suspensa")) {
          options = getQuestionOptions(question, config) || "Ver opções na pergunta";
        } else {
          options = "Conforme tipo da pergunta";
        }
    }
    
    optionsRow.push(options);
  });

  // Linha de exemplo preenchida
  const exampleRow = [
    "João Silva",
    "TI",
    "Maria Santos",
    new Date().toISOString().slice(0, 19).replace('T', ' ')
  ];

  activeQuestions.forEach(question => {
    let example = "";
    
    switch (question.tipo) {
      case "escala_1_5":
        example = "4";
        break;
      case "escala_0_10":
        example = "8";
        break;
      case "sim/não":
        example = "Sim";
        break;
      case "sim/não/parcialmente_+_campo_para_especificar_quais":
        example = "Parcialmente";
        break;
      case "multipla":
        example = "Opção1;Opção2";
        break;
      case "selecionar_1":
        example = "Opção1";
        break;
      case "texto":
        example = "Exemplo de resposta em texto";
        break;
      case "lista_de_priorização_(arrastar_e_soltar_ou_ranking_1_3)":
        example = "2";
        break;
      default:
        example = "Exemplo";
    }
    
    exampleRow.push(example);
  });

  // Montar CSV com múltiplas linhas explicativas
  const csvLines = [
    headers.join(","),
    questionRow.map(cell => `"${cell}"`).join(","),
    optionsRow.map(cell => `"${cell}"`).join(","),
    "", // Linha vazia para separar
    "// EXEMPLO DE PREENCHIMENTO:",
    exampleRow.map(cell => `"${cell}"`).join(","),
    "", // Linha vazia
    "// SEUS DADOS AQUI (apague as linhas de exemplo acima):"
  ];

  return csvLines.join("\n");
}

// Função auxiliar para extrair opções de uma pergunta
function getQuestionOptions(question: any, config: PpmConfig): string | null {
  // Verificar se é uma lista suspensa com opções definidas
  if (question.tipo.includes("lista_suspensa")) {
    // Extrair opções do tipo da pergunta
    const match = question.tipo.match(/\(([^)]+)\)/);
    if (match) {
      const options = match[1].split(',').map((opt: string) => opt.trim().replace(/_/g, ' '));
      return options.join(", ");
    }
  }

  // Verificar lookups
  if (question.tipo.includes("SISTEMAS_ESSENCIAIS")) {
    return config.lookups.SISTEMAS_ESSENCIAIS.join(", ");
  }
  if (question.tipo.includes("FERRAMENTAS_PPM")) {
    return config.lookups.FERRAMENTAS_PPM.join(", ");
  }
  if (question.tipo.includes("TIPOS_DADOS_SINCRONIZAR")) {
    return config.lookups.TIPOS_DADOS_SINCRONIZAR.join(", ");
  }

  return null;
}

// Gerar template CSV consolidado (mantido para compatibilidade)
export function generateCsvTemplate(config: PpmConfig): string {
  return generateFormCsvTemplate(config, "f1"); // Padrão para F1
}

// Baixar template CSV para formulário específico
export function downloadFormCsvTemplate(config: PpmConfig, formId: "f1" | "f2" | "f3") {
  const form = config.forms.find(f => f.id === formId);
  if (!form) {
    throw new Error(`Formulário ${formId} não encontrado`);
  }

  const csvContent = generateFormCsvTemplate(config, formId);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const filename = `PPM_Template_${formId.toUpperCase()}_${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  return filename;
}

// Baixar template CSV (mantido para compatibilidade)
export function downloadCsvTemplate(config: PpmConfig) {
  return downloadFormCsvTemplate(config, "f1");
}

// Parsear CSV importado
export function parseCsvContent(csvContent: string): any[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error("CSV deve conter pelo menos cabeçalho e uma linha de dados");
  }

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length !== headers.length) {
      console.warn(`Linha ${i + 1} tem ${values.length} colunas, esperado ${headers.length}`);
      continue;
    }

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    rows.push(row);
  }

  return rows;
}

// Parser mais robusto para linhas CSV (lida com vírgulas dentro de aspas)
function parseCsvLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Validar dados importados
export function validateImportedData(rows: any[], config: PpmConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (rows.length === 0) {
    errors.push("Nenhuma linha de dados encontrada");
    return { valid: false, errors };
  }

  // Verificar se tem campos obrigatórios
  const requiredFields = ['respondent_name'];
  
  rows.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field] || row[field].trim() === '') {
        errors.push(`Linha ${index + 2}: Campo obrigatório '${field}' está vazio`);
      }
    });

    // Validar respostas de escala
    config.forms.forEach(form => {
      form.questions
        .filter(q => q.active !== false)
        .forEach(question => {
          const answer = row[question.id];
          if (answer && answer.trim() !== '') {
            if (question.tipo === "escala_1_5") {
              const num = parseInt(answer);
              if (isNaN(num) || num < 1 || num > 5) {
                errors.push(`Linha ${index + 2}: Pergunta ${question.id} deve ser um número entre 1 e 5`);
              }
            } else if (question.tipo === "escala_0_10") {
              const num = parseInt(answer);
              if (isNaN(num) || num < 0 || num > 10) {
                errors.push(`Linha ${index + 2}: Pergunta ${question.id} deve ser um número entre 0 e 10`);
              }
            }
          }
        });
    });
  });

  return { valid: errors.length === 0, errors };
}

// Processar dados importados e salvar
export function processImportedData(rows: any[], config: PpmConfig, targetFormId?: "f1" | "f2" | "f3"): { success: boolean; message: string; count: number } {
  try {
    let processedCount = 0;

    rows.forEach((row, index) => {
      // Pular linhas de exemplo/comentário
      if (row.respondent_name?.startsWith("PERGUNTA") || 
          row.respondent_name?.startsWith("OPÇÕES") || 
          row.respondent_name?.startsWith("//") ||
          row.respondent_name === "" ||
          !row.respondent_name) {
        return;
      }

      // Extrair metadados
      const meta: PpmMeta = {
        is_interviewer: !!row.interviewer_name,
        interviewer_name: row.interviewer_name || undefined,
        respondent_name: row.respondent_name || undefined,
        respondent_department: row.respondent_department || undefined
      };

      // Extrair respostas por formulário
      const answers: FormAnswers = { f1: {}, f2: {}, f3: {} };

      // Se targetFormId for especificado, processar apenas esse formulário
      const formsToProcess = targetFormId ? [config.forms.find(f => f.id === targetFormId)!] : config.forms;

      formsToProcess.forEach(form => {
        if (!form) return;
        
        form.questions
          .filter(q => q.active !== false)
          .forEach(question => {
            const answer = row[question.id];
            if (answer && answer.trim() !== '') {
              // Processar resposta baseada no tipo
              let processedAnswer: string | string[] = answer.trim();
              
              if (question.tipo === "multipla" && answer.includes(';')) {
                processedAnswer = answer.split(';').map((a: string) => a.trim()).filter((a: string) => a);
              }
              
              answers[form.id][question.id] = processedAnswer;
            }
          });
      });

      // Salvar dados (sobrescreve dados existentes)
      saveMeta(meta);
      saveAnswers("f1", answers.f1);
      saveAnswers("f2", answers.f2);
      saveAnswers("f3", answers.f3);
      
      processedCount++;
    });

    return {
      success: true,
      message: `${processedCount} registro(s) importado(s) com sucesso`,
      count: processedCount
    };

  } catch (error) {
    return {
      success: false,
      message: `Erro ao processar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      count: 0
    };
  }
}

// Função principal de importação
export async function importCsvData(file: File, config: PpmConfig, targetFormId?: "f1" | "f2" | "f3"): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const csvContent = await file.text();
    const rows = parseCsvContent(csvContent);
    
    const validation = validateImportedData(rows, config);
    if (!validation.valid) {
      return {
        success: false,
        message: `Erros de validação:\n${validation.errors.join('\n')}`,
        count: 0
      };
    }

    return processImportedData(rows, config, targetFormId);
    
  } catch (error) {
    return {
      success: false,
      message: `Erro ao ler arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      count: 0
    };
  }
}