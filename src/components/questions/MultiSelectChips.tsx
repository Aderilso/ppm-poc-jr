import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface MultiSelectChipsProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
}

export function MultiSelectChips({ value, onChange, options }: MultiSelectChipsProps) {
  const [customValue, setCustomValue] = useState("");

  const handleToggle = (option: string, checked: boolean) => {
    if (checked) {
      onChange([...value, option]);
    } else {
      onChange(value.filter(v => v !== option));
    }
  };

  const handleCustomAdd = () => {
    if (customValue.trim() && !value.includes(customValue.trim())) {
      // Remover "Outro (especificar)" e adicionar o valor customizado
      const newValue = value.filter(v => !v.toLowerCase().includes("outro"));
      onChange([...newValue, customValue.trim()]);
      setCustomValue("");
    }
  };

  const handleRemove = (option: string) => {
    onChange(value.filter(v => v !== option));
  };

  return (
    <div className="space-y-4 mt-2">
      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <Badge 
              key={item} 
              variant="secondary" 
              className="flex items-center gap-1 px-2 py-1"
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {options.map((option) => {
          const isOther = option.toLowerCase().includes("outro");
          const isSelected = value.includes(option);
          
          return (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`multi-${option}`}
                checked={isSelected}
                onCheckedChange={(checked) => handleToggle(option, !!checked)}
              />
              <Label
                htmlFor={`multi-${option}`}
                className="text-sm cursor-pointer flex-1"
              >
                {option}
              </Label>
              
              {isOther && isSelected && (
                <div className="flex items-center gap-2 ml-4">
                  <Input
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="Especifique..."
                    className="w-32 h-8 text-xs"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCustomAdd();
                      }
                    }}
                  />
                  {customValue && (
                    <button
                      type="button"
                      onClick={handleCustomAdd}
                      className="text-primary text-xs font-medium hover:underline"
                    >
                      Adicionar
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}