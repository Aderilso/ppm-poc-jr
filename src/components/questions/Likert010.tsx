import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Likert010Props {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export function Likert010({ value, onChange, hasError = false }: Likert010Props) {
  return (
    <div className={`mt-2 ${hasError ? 'border border-red-300 rounded-lg p-3 bg-red-50/30' : ''}`}>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex flex-wrap gap-4"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <div key={num} className="flex items-center space-x-2">
            <RadioGroupItem
              value={num.toString()}
              id={`likert010-${num}`}
              className={`text-primary ${hasError ? 'border-red-500' : ''}`}
            />
            <Label
              htmlFor={`likert010-${num}`}
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