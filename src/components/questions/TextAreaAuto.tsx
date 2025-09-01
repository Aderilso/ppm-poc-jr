import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

interface TextAreaAutoProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export function TextAreaAuto({ 
  value, 
  onChange, 
  placeholder = "Digite sua resposta...", 
  maxLength = 500 
}: TextAreaAutoProps) {
  const [charCount, setCharCount] = useState(value.length);

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
      setCharCount(newValue.length);
    }
  };

  const isNearLimit = charCount > maxLength * 0.8;
  const isAtLimit = charCount >= maxLength;

  return (
    <div className="mt-2 space-y-2">
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="min-h-[100px] resize-none"
        rows={4}
      />
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">
          Máximo {maxLength} caracteres
        </span>
        <span className={`font-medium ${
          isAtLimit ? "text-destructive" : 
          isNearLimit ? "text-amber-600" : 
          "text-muted-foreground"
        }`}>
          {charCount}/{maxLength}
        </span>
      </div>
    </div>
  );
}