import { Button } from "@/components/ui/button";

interface SimNaoProps {
  value: string;
  onChange: (value: string) => void;
  showPartial?: boolean;
  showTextField?: boolean;
}

export function SimNao({ value, onChange, showPartial = false, showTextField = false }: SimNaoProps) {
  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  const options = showPartial 
    ? ["Sim", "Não", "Parcialmente"]
    : ["Sim", "Não"];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {options.map((option) => (
          <Button
            key={option}
            variant={value === option ? "default" : "outline"}
            onClick={() => handleChange(option)}
            className="flex-1"
          >
            {option}
          </Button>
        ))}
      </div>
      
      {showTextField && (value === "Parcialmente" || value === "Sim") && (
        <textarea
          placeholder="Especifique quais..."
          className="w-full p-2 border border-border rounded-md resize-none"
          rows={3}
          onChange={(e) => onChange(`${value}|${e.target.value}`)}
          value={value.includes("|") ? value.split("|")[1] : ""}
        />
      )}
    </div>
  );
}