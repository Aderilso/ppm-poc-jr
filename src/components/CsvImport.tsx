import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileText, CheckCircle, AlertCircle, Info } from "lucide-react";
import { downloadFormCsvTemplate, importCsvData } from "@/lib/csvImport";
import { importConsolidatedCsv, validateConsolidatedCsv } from "@/lib/consolidatedImport";
import { toast } from "@/hooks/use-toast";
import type { PpmConfig } from "@/lib/types";

interface CsvImportProps {
  config: PpmConfig;
  onImportSuccess: () => void;
}

export function CsvImport({ config, onImportSuccess }: CsvImportProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; count: number } | null>(null);
  const [importMode, setImportMode] = useState<'individual' | 'consolidated'>('individual');
  const [selectedFormId, setSelectedFormId] = useState<'f1' | 'f2' | 'f3'>('f1');

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
      let result;
      
      if (importMode === 'consolidated') {
        // Importar consolidado
        const csvContent = await file.text();
        const validation = validateConsolidatedCsv(csvContent);
        
        if (!validation.valid) {
          throw new Error(`Erros de validação:\n${validation.errors.join('\n')}`);
        }
        
        const importResult = await importConsolidatedCsv(csvContent, config, selectedFormId);
        result = {
          success: importResult.success,
          message: importResult.message,
          count: importResult.importedInterviews
        };
      } else {
        // Importar individual
        result = await importCsvData(file, config);
      }

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

        {/* Seleção do modo de importação */}
        <div className="space-y-3">
          <h3 className="font-medium">2. Selecionar Tipo de Importação</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="importMode"
                  value="individual"
                  checked={importMode === 'individual'}
                  onChange={(e) => setImportMode(e.target.value as 'individual' | 'consolidated')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Importação Individual (uma entrevista)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="importMode"
                  value="consolidated"
                  checked={importMode === 'consolidated'}
                  onChange={(e) => setImportMode(e.target.value as 'individual' | 'consolidated')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Importação Consolidada (múltiplas entrevistas)</span>
              </label>
            </div>
            
            {importMode === 'consolidated' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecionar Formulário:</label>
                <select
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value as 'f1' | 'f2' | 'f3')}
                  className="w-full p-2 border rounded-md"
                  title="Selecionar formulário para importação consolidada"
                >
                  {config.forms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.title} ({form.id.toUpperCase()})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Selecione o formulário correspondente ao arquivo consolidado que será importado
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload de arquivo */}
        <div className="space-y-3">
          <h3 className="font-medium">3. Upload do Arquivo</h3>
          <div className="space-y-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              title="Selecionar arquivo CSV para importação"
              className="block w-full text-sm text-muted-foreground
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-medium
                        file:bg-black file:text-white
                        hover:file:bg-zinc-900
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
              <strong>Importação Individual:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><strong>Campos obrigatórios:</strong> <code>respondent_name</code></li>
                <li><strong>Campos opcionais:</strong> <code>respondent_department</code>, <code>interviewer_name</code>, <code>timestamp</code></li>
                <li><strong>Estrutura:</strong> Uma linha por pergunta, uma coluna por respondente</li>
              </ul>
            </div>
            <div>
              <strong>Importação Consolidada:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><strong>Formato:</strong> Arquivo gerado pelo "Consolidado por Formulário"</li>
                <li><strong>Colunas obrigatórias:</strong> <code>respondent_name</code>, <code>question_id</code>, <code>resposta</code></li>
                <li><strong>Funcionamento:</strong> Cada linha = uma resposta de uma entrevista</li>
                <li><strong>Resultado:</strong> Cria entrevistas individuais no banco de dados</li>
              </ul>
            </div>
            <div>
              <strong>Tipos de resposta:</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><strong>Escalas:</strong> Números (ex: 1, 2, 3, 4, 5)</li>
                <li><strong>Sim/Não:</strong> "Sim", "Não" ou "Parcialmente"</li>
                <li><strong>Múltipla escolha:</strong> Separar por ";" (ex: "Opção1;Opção2")</li>
                <li><strong>Texto livre:</strong> Qualquer texto</li>
                <li><strong>Listas:</strong> Escolher uma das opções disponíveis</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
