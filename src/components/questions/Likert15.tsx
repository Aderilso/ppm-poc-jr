import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Likert15Props {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export function Likert15({ value, onChange, hasError = false }: Likert15Props) {
  return (
    <div className={`mt-2 ${hasError ? 'border border-red-300 rounded-lg p-3 bg-red-50/30' : ''}`}>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex flex-wrap gap-4"
      >
        {[1, 2, 3, 4, 5].map((num) => (
          <div key={num} className="flex items-center space-x-2">
            <RadioGroupItem
              value={num.toString()}
              id={`likert15-${num}`}
              className={`text-primary ${hasError ? 'border-red-500' : ''}`}
            />
            <Label
              htmlFor={`likert15-${num}`}
              className={`text-sm font-medium cursor-pointer ${hasError ? 'text-red-700' : ''}`}
            >
              {num}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}