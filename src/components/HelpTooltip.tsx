import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  content: string;
}

export function HelpTooltip({ content }: HelpTooltipProps) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-5 h-5 ml-2 text-muted-foreground hover:text-primary transition-colors cursor-help"
          aria-label="Ajuda"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs z-50" sideOffset={5}>
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}