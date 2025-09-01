import { Label } from "@/components/ui/label";
import { HelpTooltip } from "./HelpTooltip";
import { Likert15 } from "./questions/Likert15";
import { Likert010 } from "./questions/Likert010";
import { MultiSelectChips } from "./questions/MultiSelectChips";
import { SelectOne } from "./questions/SelectOne";
import { TextAreaAuto } from "./questions/TextAreaAuto";
import type { Question as QuestionType, Lookups } from "@/lib/types";

interface QuestionProps {
  question: QuestionType;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  lookups: Lookups;
}

export function Question({ question, value, onChange, lookups }: QuestionProps) {
  const getOptions = (tipo: string): string[] => {
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
        return lookups.FERRAMENTAS_PPM;
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
          />
        );
      case "escala_0_10":
        return (
          <Likert010
            value={stringValue}
            onChange={(val) => onChange(val)}
          />
        );
      case "multipla":
        return (
          <MultiSelectChips
            value={arrayValue}
            onChange={(val) => onChange(val)}
            options={getOptions(question.tipo)}
          />
        );
      case "selecionar_1":
        return (
          <SelectOne
            value={stringValue}
            onChange={(val) => onChange(val)}
            options={getOptions(question.tipo)}
          />
        );
      case "texto":
        return (
          <TextAreaAuto
            value={stringValue}
            onChange={(val) => onChange(val)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-start">
        <Label className="text-base font-medium leading-relaxed flex-1">
          {question.pergunta}
        </Label>
        <HelpTooltip content={question.legenda} />
      </div>
      
      {question.categoria && (
        <div className="text-xs text-muted-foreground uppercase font-medium tracking-wide">
          {question.categoria}
        </div>
      )}
      
      {renderInput()}
    </div>
  );
}