import { AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DraftBannerProps {
  onClearDraft: () => void;
}

export function DraftBanner({ onClearDraft }: DraftBannerProps) {
  return (
    <Alert className="mb-6 border-accent bg-[hsl(var(--ppm-success-bg))]">
      <AlertCircle className="h-4 w-4 text-accent" />
      <AlertDescription className="flex items-center justify-between">
        <span>Rascunho carregado. Você pode continuar de onde parou.</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearDraft}
          className="flex items-center gap-2 ml-4"
        >
          <Trash2 className="w-3 h-3" />
          Limpar rascunho
        </Button>
      </AlertDescription>
    </Alert>
  );
}