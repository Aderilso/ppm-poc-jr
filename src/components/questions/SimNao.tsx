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
  hasError = false 
}: SimNaoProps) {
  const options = showPartial 
    ? ["Sim", "Não", "Parcialmente"] 
    : ["Sim", "Não"];

  return (
    <div className={`mt-2 ${hasError ? 'border border-red-300 rounded-lg p-3 bg-red-50/30' : ''}`}>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex flex-wrap gap-4"
      >
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option}
              id={`simnao-${option}`}
              className={`text-primary ${hasError ? 'border-red-500' : ''}`}
            />
            <Label
              htmlFor={`simnao-${option}`}
              className={`text-sm font-medium cursor-pointer ${hasError ? 'text-red-700' : ''}`}
            >
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      {showTextField && (value === "Parcialmente" || value === "Sim") && (
        <div className="mt-3">
          <Input
            placeholder="Especifique quais..."
            className={`w-full ${hasError ? 'border-red-500' : ''}`}
            onChange={(e) => {
              // Aqui você pode implementar lógica adicional se necessário
              // Por enquanto, apenas atualiza o valor
              onChange(value + (e.target.value ? `: ${e.target.value}` : ''));
            }}
          />
        </div>
      )}
    </div>
  );
}