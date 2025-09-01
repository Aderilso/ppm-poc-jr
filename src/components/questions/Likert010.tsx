import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface Likert010Props {
  value: string;
  onChange: (value: string) => void;
}

export function Likert010({ value, onChange }: Likert010Props) {
  const numValue = value ? parseInt(value, 10) : 0;

  return (
    <div className="mt-2 space-y-4">
      <div className="px-4">
        <Slider
          value={[numValue]}
          onValueChange={(values) => onChange(values[0].toString())}
          max={10}
          min={0}
          step={1}
          className="w-full"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <div className="font-medium text-primary text-lg">
          Valor: {numValue}
        </div>
        <span>10</span>
      </div>
    </div>
  );
}