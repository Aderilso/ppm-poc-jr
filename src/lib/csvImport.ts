import type { PpmConfig, FormAnswers, PpmMeta } from "./types";
import { saveAnswers, saveMeta } from "./storage";
import { toast } from "@/hooks/use-toast";

// Gerar template CSV para importação
export function generateCsvTemplate(config: PpmConfig): string {
  const headers = [
    "respondent_name",
    "respondent_department", 
    "interviewer_name",
    "timestamp"
  ];

  // Adicionar todas as perguntas ativas como colunas
  config.forms.forEach(form => {
    form.questions
      .filter(q => q.active !== false)
      .forEach(question => {
        headers.push(`${question.id}`);
      });
  });

  // Criar linha de exemplo com instruções
  const exampleRow = [
    "Nome do Respondente",
    "Departamento/Área",
    "Nome do Entrevistador (opcional)",
    new Date().toISOString().slice(0, 19).replace('T', ' ')
  ];

  // Adicionar exemplos de respostas baseados no tipo de pergunta
  config.forms.forEach(form => {
    form.questions
      .filter(q => q.active !== false)
      .forEach(question => {
        let example = "";
        
        switch (question.tipo) {
          case "escala_1_5":
            example = "3";
            break;
          case "escala_0_10":
            example = "7";
            break;
          case "sim/não":
            example = "Sim";
            break;
          case "sim/não/parcialmente_+_campo_para_especificar_quais":
            example = "Parcialmente";
            break;
          case "multipla":
            example = "Opção 1;Opção 2";
            break;
          case "selecionar_1":
            example = "Opção escolhida";
            break;
          case "texto":
            example = "Resposta em texto livre";
            break;
          default:
            example = "Resposta conforme tipo da pergunta";
        }
        
        exampleRow.push(example);
      });
  });

  // Montar CSV
  const csvLines = [
    headers.join(","),
    exampleRow.map(cell => `"${cell}"`).join(",")
  ];

  return csvLines.join("\n");
}

// Baixar template CSV
export function downloadCsvTemplate(config: PpmConfig) {
  const csvContent = generateCsvTemplate(config);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const filename = `PPM_Template_Import_${new Date().toISOString().slice(0, 10)}.csv`;
  
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
export function processImportedData(rows: any[], config: PpmConfig): { success: boolean; message: string; count: number } {
  try {
    let processedCount = 0;

    rows.forEach((row, index) => {
      // Extrair metadados
      const meta: PpmMeta = {
        is_interviewer: !!row.interviewer_name,
        interviewer_name: row.interviewer_name || undefined,
        respondent_name: row.respondent_name || undefined,
        respondent_department: row.respondent_department || undefined
      };

      // Extrair respostas por formulário
      const answers: FormAnswers = { f1: {}, f2: {}, f3: {} };

      config.forms.forEach(form => {
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
export async function importCsvData(file: File, config: PpmConfig): Promise<{ success: boolean; message: string; count: number }> {
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

    return processImportedData(rows, config);
    
  } catch (error) {
    return {
      success: false,
      message: `Erro ao ler arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      count: 0
    };
  }
}