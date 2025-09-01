import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileText, CheckCircle, AlertCircle, Info } from "lucide-react";
import { downloadFormCsvTemplate, importCsvData } from "@/lib/csvImport";
import { toast } from "@/hooks/use-toast";
import type { PpmConfig } from "@/lib/types";

interface CsvImportProps {
  config: PpmConfig;
  onImportSuccess: () => void;
}

export function CsvImport({ config, onImportSuccess }: CsvImportProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; count: number } | null>(null);

  const handleDownloadTemplate = (formId: "f1" | "f2" | "f3") => {
    try {
      const filename = downloadFormCsvTemplate(config, formId);
      toast({
        title: "Template baixado",
        description: `Arquivo ${filename} baixado com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro ao baixar template",
        description: "Não foi possível gerar o template CSV",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo CSV",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await importCsvData(file, config);
      setUploadResult(result);

      if (result.success) {
        toast({
          title: "Importação realizada",
          description: result.message,
        });
        onImportSuccess();
      } else {
        toast({
          title: "Erro na importação",
          description: "Verifique os erros abaixo",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setUploadResult({
        success: false,
        message: errorMessage,
        count: 0
      });
      toast({
        title: "Erro na importação",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Limpar o input para permitir upload do mesmo arquivo novamente
      event.target.value = '';
    }
  };

  return (
    <Card className="ppm-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Importar Respostas via CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações sobre o processo */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium text-blue-800">Como funciona:</p>
              <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                <li>Baixe o template CSV com as colunas corretas</li>
                <li>Preencha o template com as respostas coletadas</li>
                <li>Faça upload do arquivo preenchido</li>
                <li>Os dados serão importados e salvos automaticamente</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>

        {/* Botões para baixar templates por formulário */}
        <div className="space-y-3">
          <h3 className="font-medium">1. Baixar Template por Formulário</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {config.forms.map((form) => {
              const activeQuestions = form.questions.filter(q => q.active !== false);
              return (
                <div key={form.id} className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadTemplate(form.id)}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {form.id.toUpperCase()}
                  </Button>
                  <div className="text-xs text-muted-foreground text-center">
                    <div className="font-medium">{form.title}</div>
                    <div>{activeQuestions.length} perguntas ativas</div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            Cada template contém as perguntas específicas do formulário com exemplos de preenchimento e opções de resposta.
          </p>
        </div>

        {/* Upload de arquivo */}
        <div className="space-y-3">
          <h3 className="font-medium">2. Upload do Arquivo Preenchido</h3>
          <div className="space-y-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="block w-full text-sm text-muted-foreground
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-medium
                        file:bg-primary file:text-primary-foreground
                        hover:file:bg-primary/90
                        disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Processando arquivo...
              </div>
            )}
          </div>
        </div>

        {/* Resultado do upload */}
        {uploadResult && (
          <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {uploadResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <div className={uploadResult.success ? "text-green-800" : "text-red-800"}>
                <p className="font-medium">
                  {uploadResult.success ? "Importação realizada com sucesso!" : "Erro na importação"}
                </p>
                <div className="mt-2 text-sm whitespace-pre-line">
                  {uploadResult.message}
                </div>
                {uploadResult.success && uploadResult.count > 0 && (
                  <p className="mt-2 text-sm">
                    {uploadResult.count} registro(s) processado(s). Os dados foram salvos e podem ser visualizados nas abas acima.
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Instruções de preenchimento */}
        <div className="space-y-3">
          <h3 className="font-medium">Instruções de Preenchimento</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <div>
              <strong>Campos obrigatórios:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><code>respondent_name</code>: Nome do respondente</li>
              </ul>
            </div>
            <div>
              <strong>Campos opcionais:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><code>respondent_department</code>: Departamento/área</li>
                <li><code>interviewer_name</code>: Nome do entrevistador</li>
                <li><code>timestamp</code>: Data/hora da resposta</li>
              </ul>
            </div>
            <div>
              <strong>Estrutura do Template:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><strong>Linha 1:</strong> Cabeçalhos (IDs das colunas)</li>
                <li><strong>Linha 2:</strong> Texto das perguntas</li>
                <li><strong>Linha 3:</strong> Opções de resposta disponíveis</li>
                <li><strong>Linha 5:</strong> Exemplo de preenchimento</li>
                <li><strong>Linha 8+:</strong> Seus dados aqui</li>
              </ul>
            </div>
            <div>
              <strong>Tipos de resposta:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><strong>Escalas:</strong> Números (ex: 1, 2, 3, 4, 5)</li>
                <li><strong>Sim/Não:</strong> "Sim", "Não" ou "Parcialmente"</li>
                <li><strong>Múltipla escolha:</strong> Separar por ";" (ex: "Opção1;Opção2")</li>
                <li><strong>Texto livre:</strong> Qualquer texto</li>
                <li><strong>Listas:</strong> Escolher uma das opções mostradas na linha 3</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}