import { Label } from "@/components/ui/label";
import { HelpTooltip } from "./HelpTooltip";
import { Likert15 } from "./questions/Likert15";
import { Likert010 } from "./questions/Likert010";
import { MultiSelectChips } from "./questions/MultiSelectChips";
import { SelectOne } from "./questions/SelectOne";
import { TextAreaAuto } from "./questions/TextAreaAuto";
import { ListaSuspensa } from "./questions/ListaSuspensa";
import { SimNao } from "./questions/SimNao";
import { ListaPriorizacao } from "./questions/ListaPriorizacao";
import type { Question as QuestionType, Lookups } from "@/lib/types";

interface QuestionProps {
  question: QuestionType;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  lookups: Lookups;
  hasError?: boolean; // Nova prop para indicar erro de validação
}

export function Question({ question, value, onChange, lookups, hasError = false }: QuestionProps) {
  
  const parseDropdownOptions = (tipo: string): string[] => {
    // Extrair opções de tipos lista_suspensa_()
    const match = tipo.match(/lista_suspensa_\(([^)]+)\)/);
    if (match) {
      return match[1].split(',').map(opt => {
        // Remover underscores do início e substituir underscores internos por espaços
        return opt.replace(/^_/, '').replace(/_/g, ' ').trim();
      });
    }
    return [];
  };

  const getOptions = (tipo: string): string[] => {
    // Primeiro verificar se é uma lista suspensa com opções definidas
    const dropdownOptions = parseDropdownOptions(tipo);
    if (dropdownOptions.length > 0) {
      return dropdownOptions;
    }

    switch (tipo) {
      case "multipla":
        // Determinar qual lookup usar baseado no ID da pergunta ou categoria
        if (question.id.toLowerCase().includes("sistema") || 
            question.pergunta.toLowerCase().includes("sistema")) {
          return lookups.SISTEMAS_ESSENCIAIS;
        }
        if (question.id.toLowerCase().includes("ferramenta") || 
            question.pergunta.toLowerCase().includes("ferramenta")) {
          return lookups.FERRAMENTAS_PPM;
        }
        if (question.id.toLowerCase().includes("dados") || 
            question.pergunta.toLowerCase().includes("dados") ||
            question.pergunta.toLowerCase().includes("sincronizar")) {
          return lookups.TIPOS_DADOS_SINCRONIZAR;
        }
        // Funcionalidades genéricas
        return [
          "Gestão de Cronogramas",
          "Controle de Custos", 
          "Gestão de Recursos",
          "Dashboards e Relatórios",
          "Gestão de Riscos",
          "Colaboração em Equipe",
          "Outro (especificar)"
        ];
      case "selecionar_1":
      case "lista_suspensa_baseada_na_resposta_anterior":
      case "lista_suspensa_baseada_nas_respostas_anteriores":
        return lookups.FERRAMENTAS_PPM;
      case "lista_de_priorização_(arrastar_e_soltar_ou_ranking_1_3)":
        return [
          "PPM com ERP Financeiro",
          "PPM com CRM",
          "PPM com Business Intelligence", 
          "PPM com HRIS/RH",
          "PPM com Service Desk",
          "PPM com Ferramentas de Desenvolvimento",
          "PPM com Sistemas de Comunicação"
        ];
      default:
        return [];
    }
  };

  const renderInput = () => {
    const stringValue = Array.isArray(value) ? value.join(",") : String(value || "");
    const arrayValue = Array.isArray(value) ? value : [];

    switch (question.tipo) {
      case "escala_1_5":
        return (
          <Likert15
            value={stringValue}
            onChange={(val) => onChange(val)}
            hasError={hasError}
          />
        );
      case "escala_0_10":
        return (
          <Likert010
            value={stringValue}
            onChange={(val) => onChange(val)}
            hasError={hasError}
          />
        );
      case "multipla":
        return (
          <MultiSelectChips
            value={arrayValue}
            onChange={(val) => onChange(val)}
            options={getOptions(question.tipo)}
            hasError={hasError}
          />
        );
      case "selecionar_1":
      case "lista_suspensa_baseada_na_resposta_anterior":
      case "lista_suspensa_baseada_nas_respostas_anteriores":
        return (
          <SelectOne
            value={stringValue}
            onChange={(val) => onChange(val)}
            options={getOptions(question.tipo)}
            hasError={hasError}
          />
        );
      case "texto":
        return (
          <TextAreaAuto
            value={stringValue}
            onChange={(val) => onChange(val)}
            hasError={hasError}
          />
        );
      // Novos tipos de pergunta
      case "sim/não":
      case "sim/não_(pergunta_filtro)":
        return (
          <SimNao
            value={stringValue}
            onChange={(val) => onChange(val)}
            hasError={hasError}
          />
        );
      case "sim/não/parcialmente_+_campo_para_especificar_quais":
        return (
          <SimNao
            value={stringValue}
            onChange={(val) => onChange(val)}
            showPartial={true}
            showTextField={true}
            hasError={hasError}
          />
        );
      case "lista_de_priorização_(arrastar_e_soltar_ou_ranking_1_3)":
        return (
          <ListaPriorizacao
            value={arrayValue}
            onChange={(val) => onChange(val)}
            options={getOptions(question.tipo)}
            maxSelections={3}
            hasError={hasError}
          />
        );
      default:
        // Para todos os tipos lista_suspensa_() 
        if (question.tipo.startsWith("lista_suspensa_")) {
          return (
            <ListaSuspensa
              value={stringValue}
              onChange={(val) => onChange(val)}
              options={getOptions(question.tipo)}
              hasError={hasError}
            />
          );
        }
        return null;
    }
  };

  return (
    <div className={`space-y-2 p-4 border rounded-lg bg-card transition-colors duration-200 ${
      hasError 
        ? 'border-red-500 bg-red-50/50' 
        : 'border-border'
    }`}>
      <div className="flex items-start">
        <Label className={`text-base font-medium leading-relaxed flex-1 ${
          hasError ? 'text-red-700' : ''
        }`}>
          {question.pergunta}
          {hasError && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <HelpTooltip content={question.legenda} />
      </div>
      
      {question.categoria && (
        <div className={`text-xs uppercase font-medium tracking-wide ${
          hasError ? 'text-red-600' : 'text-muted-foreground'
        }`}>
          {question.categoria}
        </div>
      )}
      
      {renderInput()}
      
      {hasError && (
        <div className="text-sm text-red-600 mt-2 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-600 rounded-full"></span>
          Esta pergunta é obrigatória
        </div>
      )}
    </div>
  );
}