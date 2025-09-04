import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SimNaoProps {
  value: string;
  onChange: (value: string) => void;
  showPartial?: boolean;
  showTextField?: boolean;
  hasError?: boolean;
}

export function SimNao({
  value,
  onChange,
  showPartial = false,
  showTextField = false,
  hasError = false,
}: SimNaoProps) {
  const options = showPartial ? ["Sim", "Não", "Parcialmente"] : ["Sim", "Não"];

  // Suportar formato "Sim: detalhes" ou "Parcialmente: detalhes"
  const parseSelection = (val: string): "Sim" | "Não" | "Parcialmente" | "" => {
    if (!val) return "";
    if (val.startsWith("Parcialmente")) return "Parcialmente";
    if (val.startsWith("Sim")) return "Sim";
    if (val === "Não") return "Não";
    // fallback: se veio um valor inesperado, mantém como vazio para não quebrar o RadioGroup
    return "";
  };

  const selection = parseSelection(value);
  const details =
    selection === "Sim" || selection === "Parcialmente"
      ? value.split(":").slice(1).join(":").trim()
      : "";

  const handleSelectChange = (newSelection: string) => {
    if (newSelection === "Não") {
      onChange("Não");
    } else if (newSelection === "Sim" || newSelection === "Parcialmente") {
      onChange(newSelection + (details ? `: ${details}` : ""));
    } else {
      onChange("");
    }
  };

  const handleDetailsChange = (text: string) => {
    // Mantém a seleção e atualiza apenas o sufixo de detalhes
    const sel = selection || "Sim"; // fallback razoável
    onChange(sel + (text ? `: ${text}` : ""));
  };

  return (
    <div className={`mt-2 ${hasError ? "border border-red-300 rounded-lg p-3 bg-red-50/30" : ""}`}>
      <RadioGroup value={selection} onValueChange={handleSelectChange} className="flex flex-wrap gap-4">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`simnao-${option}`} className={`text-primary ${hasError ? "border-red-500" : ""}`} />
            <Label htmlFor={`simnao-${option}`} className={`text-sm font-medium cursor-pointer ${hasError ? "text-red-700" : ""}`}>
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {showTextField && (selection === "Parcialmente" || selection === "Sim") && (
        <div className="mt-3">
          <Input
            placeholder="Especifique quais..."
            className={`w-full ${hasError ? "border-red-500" : ""}`}
            value={details}
            onChange={(e) => handleDetailsChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
