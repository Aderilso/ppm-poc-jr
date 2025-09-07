import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, GripVertical } from "lucide-react";

interface ListaPriorizacaoProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  maxSelections?: number;
  hasError?: boolean;
}

export function ListaPriorizacao({ 
  value, 
  onChange, 
  options, 
  maxSelections = 3,
  hasError = false 
}: ListaPriorizacaoProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>(value);

  const handleAdd = (option: string) => {
    if (selectedItems.length < maxSelections && !selectedItems.includes(option)) {
      const newItems = [...selectedItems, option];
      setSelectedItems(newItems);
      onChange(newItems);
    }
  };

  const handleRemove = (option: string) => {
    const newItems = selectedItems.filter(item => item !== option);
    setSelectedItems(newItems);
    onChange(newItems);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newItems = [...selectedItems];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    setSelectedItems(newItems);
    onChange(newItems);
  };

  const availableOptions = options.filter(option => !selectedItems.includes(option));

  return (
    <div className={`mt-2 ${hasError ? 'border border-red-300 rounded-lg p-3 bg-red-50/30' : ''}`}>
      {/* Selected items with drag handles */}
      {selectedItems.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className={`text-sm font-medium ${hasError ? 'text-red-700' : 'text-muted-foreground'}`}>
            Itens selecionados (arraste para reordenar):
          </h4>
          {selectedItems.map((item, index) => (
            <div
              key={item}
              className="flex items-center gap-2 p-2 bg-secondary rounded-md"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
              <Badge variant="secondary" className="flex-1">
                {index + 1}. {item}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(item)}
                className="h-6 w-6 p-0"
                title="Remover item"
                aria-label={`Remover item ${item}`}
              >
                <X className="w-3 h-3" aria-hidden="true" />
                <span className="sr-only">Remover</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Available options */}
      {availableOptions.length > 0 && selectedItems.length < maxSelections && (
        <div className="space-y-2">
          <h4 className={`text-sm font-medium ${hasError ? 'text-red-700' : 'text-muted-foreground'}`}>
            Opções disponíveis:
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableOptions.map((option) => (
              <Button
                key={option}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAdd(option)}
                className={`text-xs ${hasError ? 'border-red-500 text-red-700 hover:bg-red-50' : ''}`}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}

      {selectedItems.length >= maxSelections && (
        <p className="text-xs text-muted-foreground mt-2">
          Máximo de {maxSelections} itens selecionados
        </p>
      )}
    </div>
  );
}
