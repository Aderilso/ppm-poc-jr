import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SelectOneProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export function SelectOne({ value, onChange, options, placeholder = "Selecione uma opção..." }: SelectOneProps) {
  const [customValue, setCustomValue] = useState("");
  
  // Verificar se o valor atual é uma opção "Outro" customizada
  const outroOption = options.find(opt => opt.toLowerCase().includes("outro"));
  const isCustomValue = value && !options.includes(value) && value !== outroOption;
  const displayValue = isCustomValue ? (outroOption || "Outro") : value;

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue.toLowerCase().includes("outro")) {
      // Para opções "Outro" ou "Outro (especificar)", manter o valor original
      onChange(selectedValue);
    } else {
      onChange(selectedValue);
    }
  };

  const handleCustomChange = (customText: string) => {
    setCustomValue(customText);
    if (customText.trim()) {
      onChange(customText.trim());
    } else {
      // Manter a opção "Outro" original se o campo estiver vazio
      const outroOption = options.find(opt => opt.toLowerCase().includes("outro"));
      onChange(outroOption || "Outro");
    }
  };

  const hasOutroOption = options.some(option => 
    option.toLowerCase().includes("outro")
  );

  const showCustomInput = hasOutroOption && value && (value.toLowerCase().includes("outro") || isCustomValue);

  return (
    <div className="mt-2 space-y-2">
      <Select value={displayValue} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {showCustomInput && (
        <Input
          value={isCustomValue ? value : customValue}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder="Especifique..."
          className="w-full"
        />
      )}
    </div>
  );
}