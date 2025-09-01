import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ListaPriorizacaoProps {
  value: string | string[];
  onChange: (value: string[]) => void;
  options: string[];
  maxSelections?: number;
}

export function ListaPriorizacao({ value, onChange, options, maxSelections = 3 }: ListaPriorizacaoProps) {
  const currentSelections = Array.isArray(value) ? value : (value ? [value] : []);
  
  const handleToggleOption = (option: string) => {
    const newSelections = currentSelections.includes(option)
      ? currentSelections.filter(item => item !== option)
      : currentSelections.length < maxSelections 
        ? [...currentSelections, option]
        : currentSelections;
    
    onChange(newSelections);
  };

  const handleRemoveSelection = (option: string) => {
    const newSelections = currentSelections.filter(item => item !== option);
    onChange(newSelections);
  };

  return (
    <div className="space-y-4">
      {/* Selected items with ranking */}
      {currentSelections.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selecionados (em ordem de prioridade):</h4>
          <div className="space-y-2">
            {currentSelections.map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-2">
                  <span className="font-semibold">{index + 1}.</span>
                  {item}
                  <button
                    onClick={() => handleRemoveSelection(item)}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available options */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">
          Opções disponíveis ({currentSelections.length}/{maxSelections} selecionados):
        </h4>
        <div className="grid gap-2">
          {options
            .filter(option => !currentSelections.includes(option))
            .map((option) => (
              <Button
                key={option}
                variant="outline"
                onClick={() => handleToggleOption(option)}
                disabled={currentSelections.length >= maxSelections}
                className="justify-start text-left h-auto p-3"
              >
                {option}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}