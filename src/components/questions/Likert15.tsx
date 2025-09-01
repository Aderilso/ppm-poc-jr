import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Likert15Props {
  value: string;
  onChange: (value: string) => void;
}

export function Likert15({ value, onChange }: Likert15Props) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="flex flex-wrap gap-4 mt-2"
    >
      {[1, 2, 3, 4, 5].map((num) => (
        <div key={num} className="flex items-center space-x-2">
          <RadioGroupItem
            value={num.toString()}
            id={`likert15-${num}`}
            className="text-primary"
          />
          <Label
            htmlFor={`likert15-${num}`}
            className="text-sm font-medium cursor-pointer"
          >
            {num}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}