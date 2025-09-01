import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ListaSuspensaProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  hasError?: boolean;
}

export function ListaSuspensa({ value, onChange, options, hasError = false }: ListaSuspensaProps) {
  return (
    <div className={`mt-2 ${hasError ? 'border border-red-300 rounded-lg p-3 bg-red-50/30' : ''}`}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`w-full ${hasError ? 'border-red-500 text-red-700' : ''}`}>
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}