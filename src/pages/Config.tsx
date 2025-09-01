import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Layout } from "@/components/Layout";
import { Upload, Download, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { validatePpmConfig } from "@/lib/schema";
import { saveConfig, loadConfig } from "@/lib/storage";
import { SAMPLE_JSON } from "@/lib/sampleData";
import { toast } from "@/hooks/use-toast";
import type { PpmConfig } from "@/lib/types";

export default function Config() {
  const [jsonText, setJsonText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<PpmConfig | null>(null);

  useEffect(() => {
    const config = loadConfig();
    setCurrentConfig(config);
    if (config) {
      setJsonText(JSON.stringify(config, null, 2));
      setIsValid(true);
    }
  }, []);

  const handleValidateAndSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const validation = validatePpmConfig(parsed);
      
      if (validation.success) {
        saveConfig(validation.data);
        setCurrentConfig(validation.data);
        setErrors([]);
        setIsValid(true);
        toast({
          title: "Configuração salva",
          description: "JSON validado e salvo com sucesso!",
        });
      } else {
        setErrors('errors' in validation ? validation.errors : ["Erro de validação"]);
        setIsValid(false);
        toast({
          title: "Erro de validação",
          description: "Corrija os erros antes de salvar.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setErrors(["JSON inválido - verifique a sintaxe"]);
      setIsValid(false);
      toast({
        title: "Erro de JSON",
        description: "Formato JSON inválido",
        variant: "destructive",
      });
    }
  };

  const handleLoadSample = () => {
    setJsonText(JSON.stringify(SAMPLE_JSON, null, 2));
    setErrors([]);
    setIsValid(false);
    toast({
      title: "Exemplo carregado",
      description: "JSON de exemplo carregado. Clique em 'Validar & Salvar' para aplicar.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonText(content);
        setErrors([]);
        setIsValid(false);
        toast({
          title: "Arquivo carregado",
          description: "Clique em 'Validar & Salvar' para aplicar as configurações.",
        });
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadCurrent = () => {
    if (currentConfig) {
      const dataStr = JSON.stringify(currentConfig, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ppm-config.json";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Configure as perguntas dos formulários através de JSON ou arquivo
          </p>
        </div>

        {/* Current Status */}
        {currentConfig && (
        <Alert className="mb-6 border-accent bg-[hsl(var(--ppm-success-bg))]">
          <CheckCircle className="h-4 w-4 text-accent" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Configuração ativa: {currentConfig.forms.length} formulários com{" "}
              {currentConfig.forms.reduce((sum, form) => sum + (form.questions?.length || 0), 0)} perguntas
            </span>
              <Button variant="outline" size="sm" onClick={handleDownloadCurrent}>
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <Alert className="mb-6 border-destructive bg-[hsl(var(--ppm-error-bg))]">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription>
              <div className="font-medium mb-2">Erros de validação:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* JSON Editor */}
          <div className="lg:col-span-2">
            <Card className="ppm-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Editor JSON
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder="Cole o JSON aqui..."
                  className="font-mono text-sm min-h-[400px] resize-none"
                />
                
                <div className="flex gap-3 mt-4">
                  <Button 
                    onClick={handleValidateAndSave}
                    className="ppm-button-primary flex-1"
                    disabled={!jsonText.trim()}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Validar & Salvar
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleLoadSample}
                  >
                    Carregar Exemplo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            {/* File Upload */}
            <Card className="ppm-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload de Arquivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-muted-foreground
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-medium
                              file:bg-primary file:text-primary-foreground
                              hover:file:bg-primary/90"
                  />
                  <p className="text-xs text-muted-foreground">
                    Selecione um arquivo .json com a configuração dos formulários
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="ppm-card">
              <CardHeader>
                <CardTitle className="text-lg">Estrutura do JSON</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p><strong>forms:</strong> Array com 3 formulários (f1, f2, f3)</p>
                  <p><strong>questions:</strong> Perguntas com tipos:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                    <li>escala_1_5</li>
                    <li>escala_0_10</li>
                    <li>multipla</li>
                    <li>selecionar_1</li>
                    <li>texto</li>
                  </ul>
                  <p><strong>lookups:</strong> Listas de opções predefinidas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}