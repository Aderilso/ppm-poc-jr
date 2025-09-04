import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, RotateCcw } from "lucide-react";
import type { Question, QuestionType } from "@/lib/types";

interface NewQuestionFormProps {
  onSave: (formId: "f1" | "f2" | "f3", question: Question, weight: number, category: string) => void;
  onCancel: () => void;
}

interface NewQuestionData {
  formId: "f1" | "f2" | "f3" | "";
  pergunta: string;
  tipo: QuestionType | "";
  legenda: string;
  categoria: string;
  peso: number;
  opcoes: string[];
}

const QUESTION_TYPES: { value: QuestionType; label: string; description: string }[] = [
  { value: "escala_1_5", label: "Escala 1-5", description: "Escala de 1 a 5 pontos" },
  { value: "escala_0_10", label: "Escala 0-10", description: "Escala de 0 a 10 pontos" },
  { value: "sim/não", label: "Sim/Não", description: "Resposta binária" },
  { value: "sim/não_(pergunta_filtro)", label: "Sim/Não (Filtro)", description: "Pergunta filtro para outras questões" },
  { value: "sim/não/parcialmente_+_campo_para_especificar_quais", label: "Sim/Não/Parcialmente", description: "Com campo adicional para especificar" },
  { value: "multipla", label: "Múltipla Escolha", description: "Seleção múltipla de opções" },
  { value: "selecionar_1", label: "Seleção Única", description: "Selecionar apenas uma opção" },
  { value: "texto", label: "Texto Livre", description: "Campo de texto aberto" },
  { value: "lista_de_priorização_(arrastar_e_soltar_ou_ranking_1_3)", label: "Lista de Priorização", description: "Ranking de 1 a 3 opções" }
];

const FORM_OPTIONS = [
  { value: "f1", label: "Formulário 1 - Avaliação Geral" },
  { value: "f2", label: "Formulário 2 - Análise de Funcionalidades" },
  { value: "f3", label: "Formulário 3 - Necessidades de Integração" }
];

const PESO_OPTIONS = [
  { value: 1, label: "1 - Baixa importância", description: "Informação complementar" },
  { value: 2, label: "2 - Importância moderada", description: "Contexto relevante" },
  { value: 3, label: "3 - Importância média", description: "Impacto moderado nas decisões" },
  { value: 4, label: "4 - Alta importância", description: "Crítico para análise" },
  { value: 5, label: "5 - Importância máxima", description: "Essencial para tomada de decisão" }
];

export function NewQuestionForm({ onSave, onCancel }: NewQuestionFormProps) {
  const [formData, setFormData] = useState<NewQuestionData>({
    formId: "",
    pergunta: "",
    tipo: "",
    legenda: "",
    categoria: "",
    peso: 3,
    opcoes: []
  });

  const [currentOption, setCurrentOption] = useState("");

  const needsOptions = () => {
    return formData.tipo === "multipla" || 
           formData.tipo === "selecionar_1" || 
           formData.tipo === "lista_de_priorização_(arrastar_e_soltar_ou_ranking_1_3)";
  };

  const handleAddOption = () => {
    if (currentOption.trim()) {
      setFormData(prev => ({
        ...prev,
        opcoes: [...prev.opcoes, currentOption.trim()]
      }));
      setCurrentOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      opcoes: prev.opcoes.filter((_, i) => i !== index)
    }));
  };

  const handleAddMultipleOptions = () => {
    if (currentOption.trim()) {
      const newOptions = currentOption.split(";").map(opt => opt.trim()).filter(opt => opt);
      setFormData(prev => ({
        ...prev,
        opcoes: [...prev.opcoes, ...newOptions]
      }));
      setCurrentOption("");
    }
  };

  const generateQuestionId = (formId: string): string => {
    // Gerar ID baseado no timestamp para evitar conflitos
    const timestamp = Date.now().toString().slice(-4);
    return `${formId}_q${timestamp}`;
  };

  const handleSave = () => {
    if (!formData.formId || !formData.pergunta || !formData.tipo) {
      return;
    }

    // Construir tipo com opções embutidas quando aplicável
    let finalTipo = formData.tipo;
    if (needsOptions() && formData.opcoes.length > 0) {
      const opcoesFormatadas = formData.opcoes.join(",_").replace(/\s/g, "_");
      if (formData.tipo === "multipla") {
        // Embute opções mantendo semântica de múltipla escolha
        finalTipo = (`multipla_(${opcoesFormatadas})` as unknown) as QuestionType;
      } else if (formData.tipo === "selecionar_1") {
        // Embute opções mantendo semântica de seleção única
        finalTipo = (`selecionar_1_(${opcoesFormatadas})` as unknown) as QuestionType;
      } else {
        // Para listas suspensas genéricas
        finalTipo = (`lista_suspensa_(${opcoesFormatadas})` as unknown) as QuestionType;
      }
    }

    const newQuestion: Question = {
      id: generateQuestionId(formData.formId),
      pergunta: formData.pergunta,
      tipo: finalTipo,
      legenda: formData.legenda || "Preencha conforme indicado.",
      categoria: formData.categoria || "Nova Categoria",
      active: true // Novas perguntas são ativas por padrão
    };

    onSave(formData.formId, newQuestion, formData.peso, formData.categoria || "Sem Categoria");
  };

  const handleReset = () => {
    setFormData({
      formId: "",
      pergunta: "",
      tipo: "",
      legenda: "",
      categoria: "",
      peso: 3,
      opcoes: []
    });
    setCurrentOption("");
  };

  const isValid = formData.formId && formData.pergunta && formData.tipo && 
                  (!needsOptions() || formData.opcoes.length > 0);

  return (
    <Card className="ppm-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-green-600" />
          Nova Pergunta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário de Destino */}
        <div className="space-y-2">
          <Label htmlFor="formId">Formulário de Destino *</Label>
          <Select value={formData.formId} onValueChange={(value: "f1" | "f2" | "f3") => 
            setFormData(prev => ({ ...prev, formId: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o formulário" />
            </SelectTrigger>
            <SelectContent>
              {FORM_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pergunta */}
        <div className="space-y-2">
          <Label htmlFor="pergunta">Texto da Pergunta *</Label>
          <Textarea
            id="pergunta"
            value={formData.pergunta}
            onChange={(e) => setFormData(prev => ({ ...prev, pergunta: e.target.value }))}
            placeholder="Digite o texto da pergunta..."
            className="min-h-[80px]"
          />
        </div>

        {/* Tipo de Pergunta */}
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Pergunta *</Label>
          <Select value={formData.tipo} onValueChange={(value: QuestionType) => 
            setFormData(prev => ({ ...prev, tipo: value, opcoes: [] }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Input
            id="categoria"
            value={formData.categoria}
            onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
            placeholder="Ex: Usabilidade, Funcionalidades, Integração..."
          />
        </div>

        {/* Peso */}
        <div className="space-y-2">
          <Label htmlFor="peso">Peso da Pergunta</Label>
          <Select value={formData.peso.toString()} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, peso: parseInt(value) }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PESO_OPTIONS.map(peso => (
                <SelectItem key={peso.value} value={peso.value.toString()}>
                  <div>
                    <div className="font-medium">{peso.label}</div>
                    <div className="text-xs text-muted-foreground">{peso.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Opções (se necessário) */}
        {needsOptions() && (
          <div className="space-y-4">
            <Label>Opções de Resposta *</Label>
            
            {/* Opções existentes */}
            {formData.opcoes.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Opções adicionadas:</div>
                <div className="flex flex-wrap gap-2">
                  {formData.opcoes.map((opcao, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {opcao}
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Adicionar opções */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={currentOption}
                  onChange={(e) => setCurrentOption(e.target.value)}
                  placeholder="Digite uma opção ou várias separadas por ;"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (currentOption.includes(";")) {
                        handleAddMultipleOptions();
                      } else {
                        handleAddOption();
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={currentOption.includes(";") ? handleAddMultipleOptions : handleAddOption}
                  disabled={!currentOption.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Dica: Use ";" para separar múltiplas opções de uma vez. Ex: "Opção 1;Opção 2;Opção 3"
              </div>
            </div>
          </div>
        )}

        {/* Legenda */}
        <div className="space-y-2">
          <Label htmlFor="legenda">Legenda/Instrução</Label>
          <Input
            id="legenda"
            value={formData.legenda}
            onChange={(e) => setFormData(prev => ({ ...prev, legenda: e.target.value }))}
            placeholder="Instrução para o usuário (opcional)"
          />
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="ppm-button-primary flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Pergunta
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpar
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </div>

        {/* Validação */}
        {!isValid && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            <strong>Campos obrigatórios:</strong>
            <ul className="list-disc list-inside mt-1">
              {!formData.formId && <li>Formulário de destino</li>}
              {!formData.pergunta && <li>Texto da pergunta</li>}
              {!formData.tipo && <li>Tipo de pergunta</li>}
              {needsOptions() && formData.opcoes.length === 0 && <li>Pelo menos uma opção de resposta</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
