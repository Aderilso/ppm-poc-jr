import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { NewQuestionForm } from "@/components/NewQuestionForm";
import { Upload, Download, CheckCircle, AlertCircle, FileText, Plus, Settings } from "lucide-react";
import { validatePpmConfig } from "@/lib/schema";
import { saveConfig, loadConfig } from "@/lib/storage";
import { addNewQuestionWeight } from "@/lib/weightManager";
import { SAMPLE_JSON } from "@/lib/sampleData";
import { toast } from "@/hooks/use-toast";
import type { PpmConfig, Question } from "@/lib/types";

export default function Config() {
  const [jsonText, setJsonText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<PpmConfig | null>(null);
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);

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

  const handleAddNewQuestion = (formId: "f1" | "f2" | "f3", question: Question, weight: number, category: string) => {
    if (!currentConfig) return;

    const updatedConfig = { ...currentConfig };
    const formIndex = updatedConfig.forms.findIndex(f => f.id === formId);
    
    if (formIndex !== -1) {
      updatedConfig.forms[formIndex].questions.push(question);
      
      // Adicionar peso para a nova pergunta
      const analysisType = getAnalysisTypeByForm(formId);
      addNewQuestionWeight(question, weight, category, analysisType);
      
      // Atualizar JSON text
      setJsonText(JSON.stringify(updatedConfig, null, 2));
      
      // Salvar automaticamente
      saveConfig(updatedConfig);
      setCurrentConfig(updatedConfig);
      setShowNewQuestionForm(false);
      
      toast({
        title: "Pergunta adicionada",
        description: `Nova pergunta adicionada ao ${formId.toUpperCase()} com peso ${weight} na categoria "${category}"!`,
      });
    }
  };

  const getAnalysisTypeByForm = (formId: string): 'satisfaction' | 'usage' | 'functionality' | 'integration' | 'demographic' => {
    switch (formId) {
      case 'f1': return 'satisfaction';
      case 'f2': return 'functionality';
      case 'f3': return 'integration';
      default: return 'functionality';
    }
  };

  const handleCancelNewQuestion = () => {
    setShowNewQuestionForm(false);
  };

  const handleToggleQuestion = (formId: "f1" | "f2" | "f3", questionId: string) => {
    if (!currentConfig) return;

    const updatedConfig = { ...currentConfig };
    const formIndex = updatedConfig.forms.findIndex(f => f.id === formId);
    
    if (formIndex !== -1) {
      const questionIndex = updatedConfig.forms[formIndex].questions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
        const question = updatedConfig.forms[formIndex].questions[questionIndex];
        const newActiveStatus = question.active !== false ? false : true;
        
        updatedConfig.forms[formIndex].questions[questionIndex] = {
          ...question,
          active: newActiveStatus
        };
        
        // Atualizar JSON text
        setJsonText(JSON.stringify(updatedConfig, null, 2));
        
        // Salvar automaticamente
        saveConfig(updatedConfig);
        setCurrentConfig(updatedConfig);
        
        toast({
          title: newActiveStatus ? "Pergunta ativada" : "Pergunta inativada",
          description: `A pergunta foi ${newActiveStatus ? 'ativada' : 'inativada'} com sucesso!`,
        });
      }
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadCurrent}>
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>
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

        <Tabs defaultValue="json" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="json" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Editor JSON
            </TabsTrigger>
            <TabsTrigger value="new-question" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Pergunta
            </TabsTrigger>
            <TabsTrigger value="manage-questions" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Gerenciar Perguntas
            </TabsTrigger>
          </TabsList>

          {/* JSON Editor Tab */}
          <TabsContent value="json" className="mt-6">
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
          </TabsContent>

          {/* Nova Pergunta Tab */}
          <TabsContent value="new-question" className="mt-6">
            {currentConfig ? (
              <NewQuestionForm
                onSave={handleAddNewQuestion}
                onCancel={handleCancelNewQuestion}
              />
            ) : (
              <Card className="ppm-card">
                <CardContent className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Carregue uma configuração primeiro para adicionar novas perguntas
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Gerenciar Perguntas Tab */}
          <TabsContent value="manage-questions" className="mt-6">
            {currentConfig ? (
              <Card className="ppm-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Gerenciar Perguntas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {currentConfig.forms.map((form) => (
                      <div key={form.id} className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary border-b pb-2">
                          {form.title}
                        </h3>
                        <div className="space-y-3">
                          {form.questions.map((question) => (
                            <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{question.pergunta}</div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {question.id} | Tipo: {question.tipo}
                                  {question.categoria && ` | Categoria: ${question.categoria}`}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  question.active !== false 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {question.active !== false ? 'Ativa' : 'Inativa'}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleQuestion(form.id, question.id)}
                                  className={question.active !== false 
                                    ? 'text-red-600 border-red-600 hover:bg-red-50' 
                                    : 'text-green-600 border-green-600 hover:bg-green-50'
                                  }
                                >
                                  {question.active !== false ? 'Inativar' : 'Ativar'}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="ppm-card">
                <CardContent className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Carregue uma configuração primeiro para gerenciar perguntas
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}