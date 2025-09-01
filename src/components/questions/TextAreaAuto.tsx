import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

interface TextAreaAutoProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  hasError?: boolean;
}

export function TextAreaAuto({ 
  value, 
  onChange, 
  placeholder = "Digite sua resposta...", 
  maxLength = 500,
  hasError = false
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
    <div className={`mt-2 ${hasError ? 'border border-red-300 rounded-lg p-3 bg-red-50/30' : ''}`}>
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`resize-none ${hasError ? 'border-red-500' : ''}`}
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