import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { PpmMeta } from "@/lib/types";

interface InterviewerFieldsProps {
  meta: PpmMeta;
  onMetaChange: (meta: PpmMeta) => void;
  showValidation?: boolean;
  onCommit?: () => void;
  canCommit?: boolean;
  actionLabel?: string;
  locked?: boolean;
}

export function InterviewerFields({ meta, onMetaChange, showValidation = false, onCommit, canCommit = false, actionLabel = "Iniciar Entrevista", locked = false }: InterviewerFieldsProps) {
  // Função para verificar se um campo tem erro
  const hasFieldError = (fieldName: keyof PpmMeta, value: string) => {
    if (!showValidation) return false;
    if (fieldName === 'is_interviewer') return false;
    return !value || value.trim() === "";
  };

  return (
    <div className={`ppm-card p-4 mb-6 ${locked ? 'bg-muted opacity-90' : 'bg-[hsl(var(--ppm-gray))]'}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id="is_interviewer"
          checked={meta.is_interviewer}
          onCheckedChange={(checked) =>
            onMetaChange({ ...meta, is_interviewer: !!checked })
          }
          disabled={locked}
        />
        <Label htmlFor="is_interviewer" className="text-sm font-medium">
          Preencher como ENTREVISTADOR
        </Label>
      </div>

      {meta.is_interviewer && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="interviewer_name" className="text-sm">
              Nome do Entrevistador *
            </Label>
            <Input
              id="interviewer_name"
              value={meta.interviewer_name || ""}
              onChange={(e) =>
                onMetaChange({ ...meta, interviewer_name: e.target.value })
              }
              placeholder="Seu nome"
              required
              disabled={locked}
              className={hasFieldError('interviewer_name', meta.interviewer_name || "") ? "border-destructive" : ""}
            />
            {hasFieldError('interviewer_name', meta.interviewer_name || "") && (
              <p className="text-sm text-destructive mt-1">Preencha este campo.</p>
            )}
          </div>
          <div>
            <Label htmlFor="respondent_name" className="text-sm">
              Nome do Respondente *
            </Label>
            <Input
              id="respondent_name"
              value={meta.respondent_name || ""}
              onChange={(e) =>
                onMetaChange({ ...meta, respondent_name: e.target.value })
              }
              placeholder="Nome do entrevistado"
              required
              disabled={locked}
              className={hasFieldError('respondent_name', meta.respondent_name || "") ? "border-destructive" : ""}
            />
            {hasFieldError('respondent_name', meta.respondent_name || "") && (
              <p className="text-sm text-destructive mt-1">Preencha este campo.</p>
            )}
          </div>
          <div>
            <Label htmlFor="respondent_department" className="text-sm">
              Departamento do Respondente *
            </Label>
            <Input
              id="respondent_department"
              value={meta.respondent_department || ""}
              onChange={(e) => onMetaChange({ ...meta, respondent_department: e.target.value })}
              placeholder="Departamento"
              required
              disabled={locked}
              className={hasFieldError('respondent_department', meta.respondent_department || "") ? "border-destructive" : ""}
            />
            {hasFieldError('respondent_department', meta.respondent_department || "") && (
              <p className="text-sm text-destructive mt-1">Preencha este campo.</p>
            )}
          </div>
          </div>
          {!locked && (
            <div className="mt-4 flex justify-end">
              <Button onClick={() => onCommit && onCommit()} disabled={!canCommit} className="bg-black text-white hover:bg-zinc-900">
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
