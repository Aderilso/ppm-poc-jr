import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { NewQuestionForm } from "@/components/NewQuestionForm";
import { Upload, Download, CheckCircle, AlertCircle, FileText, Plus, Settings, Database, FileUp, Trash2, RefreshCw } from "lucide-react";
import { validatePpmConfig } from "@/lib/schema";
import { saveConfig, loadConfig } from "@/lib/storage";
import { addNewQuestionWeight, WeightManager } from "@/lib/weightManager";
import { SAMPLE_JSON, loadDefaultConfig } from "@/lib/sampleData";
import { toast } from "@/hooks/use-toast";
import { criticalApi, configsApi } from "@/lib/api";
import { isAuthenticatedForCriticalOperations } from "@/lib/auth";
import { AuthModal } from "@/components/AuthModal";
import type { PpmConfig, Question } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";

export default function Config() {
  const [jsonText, setJsonText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<PpmConfig | null>(null);
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [showLoadOptions, setShowLoadOptions] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isClearingDatabase, setIsClearingDatabase] = useState(false);

  // Hidden file input for custom JSON upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const weightsFileInputRef = useRef<HTMLInputElement>(null);

  // Query client para limpar cache
  const queryClient = useQueryClient();

  useEffect(() => {
    const config = loadConfig();
    setCurrentConfig(config);
    if (config) {
      setJsonText(JSON.stringify(config, null, 2));
      setIsValid(true);
      // Verificar se há timestamp de última atualização
      const timestamp = localStorage.getItem('ppm-config-timestamp');
      setLastUpdated(timestamp);
    }
  }, []);

  const publishToServer = async (cfg: PpmConfig) => {
    try {
      const ts = new Date().toISOString();
      await configsApi.create({ forms: cfg.forms, lookups: cfg.lookups, name: 'Ativa via UI', description: `Publicada em ${ts}` });
      queryClient.invalidateQueries({ queryKey: ['configs'] });
      toast({ title: 'Configuração publicada', description: 'Configuração ativa no servidor.' });
    } catch (e) {
      toast({ title: 'Falha ao publicar no servidor', description: e instanceof Error ? e.message : 'Erro desconhecido', variant: 'destructive' });
    }
  };

  const handleValidateAndSave = async () => {
    try {
      const parsed = JSON.parse(jsonText);
      const validation = validatePpmConfig(parsed);
      
      if (validation.success) {
        saveConfig(validation.data);
        setCurrentConfig(validation.data);
        setErrors([]);
        setIsValid(true);
        await publishToServer(validation.data);
        
        // Salvar timestamp
        const timestamp = new Date().toLocaleString('pt-BR');
        localStorage.setItem('ppm-config-timestamp', timestamp);
        setLastUpdated(timestamp);
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

  const handleLoadDefault = async () => {
    try {
      // Mostrar loading
      toast({
        title: "Carregando configuração padrão...",
        description: "Aguarde enquanto carregamos o arquivo JSON padrão.",
      });

      // Carregar o JSON padrão do arquivo
      const defaultConfig = await loadDefaultConfig();
      
      // Validar o JSON padrão
      const validation = validatePpmConfig(defaultConfig);
      
      if (validation.success) {
        // Salvar automaticamente
        saveConfig(validation.data);
        setCurrentConfig(validation.data);
        setJsonText(JSON.stringify(defaultConfig, null, 2));
        setErrors([]);
        setIsValid(true);
        setShowLoadOptions(false);
        await publishToServer(validation.data);
        
        // Salvar timestamp
        const timestamp = new Date().toLocaleString('pt-BR');
        localStorage.setItem('ppm-config-timestamp', timestamp);
        setLastUpdated(timestamp);
        
        toast({
          title: "JSON padrão carregado e salvo!",
          description: "Configuração padrão aplicada automaticamente com sucesso!",
        });
      } else {
        setErrors('errors' in validation ? validation.errors : ["Erro de validação no JSON padrão"]);
        setIsValid(false);
        toast({
          title: "Erro no JSON padrão",
          description: "O arquivo padrão contém erros de validação.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setErrors(["Erro ao processar JSON padrão"]);
      setIsValid(false);
      toast({
        title: "Erro ao carregar JSON padrão",
        description: "Erro inesperado ao processar o arquivo padrão.",
        variant: "destructive",
      });
    }
  };

  // ===== Pesos (Exportar/Importar) =====
  const handleExportWeights = () => {
    try {
      const manager = WeightManager.getInstance();
      const data = manager.exportWeights();
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `ppm-weights-${timestamp}.json`;

      const payload = JSON.stringify(data, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      toast({ title: 'Pesos exportados', description: `Arquivo ${fileName} baixado com sucesso.` });
    } catch (e) {
      toast({ title: 'Erro ao exportar pesos', description: e instanceof Error ? e.message : 'Erro desconhecido', variant: 'destructive' });
    }
  };

  const handleImportWeightsClick = () => {
    weightsFileInputRef.current?.click();
  };

  const handleImportWeightsFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const json = JSON.parse(text);
      if (!json || !Array.isArray(json.questionWeights) || !Array.isArray(json.categoryWeights)) {
        throw new Error('JSON inválido. Esperado: { questionWeights: [], categoryWeights: [] }');
      }
      const manager = WeightManager.getInstance();
      manager.importWeights({ questionWeights: json.questionWeights, categoryWeights: json.categoryWeights });
      toast({ title: 'Pesos importados', description: 'Pesos e categorias atualizados com sucesso.' });
      e.target.value = '';
    } catch (err) {
      toast({ title: 'Erro ao importar pesos', description: err instanceof Error ? err.message : 'Erro desconhecido', variant: 'destructive' });
    }
  };

  const handleLoadCustom = () => {
    // Usar a ref para acessar o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    // Feedback visual
    toast({
      title: "Selecionando arquivo...",
      description: "Escolha um arquivo JSON para carregar",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        try {
          const parsed = JSON.parse(content);
          const validation = validatePpmConfig(parsed);
          
          if (validation.success) {
            // Salvar automaticamente
            saveConfig(validation.data);
            setCurrentConfig(validation.data);
            setJsonText(content);
            setErrors([]);
            setIsValid(true);
            setShowLoadOptions(false);
            publishToServer(validation.data);
            
            // Salvar timestamp
            const timestamp = new Date().toLocaleString('pt-BR');
            localStorage.setItem('ppm-config-timestamp', timestamp);
            setLastUpdated(timestamp);
            
            toast({
              title: "Arquivo carregado e salvo!",
              description: "Configuração aplicada automaticamente com sucesso!",
            });
          } else {
            setJsonText(content);
            setErrors('errors' in validation ? validation.errors : ["Erro de validação"]);
            setIsValid(false);
            setShowLoadOptions(false);
            toast({
              title: "Erro de validação",
              description: "O arquivo contém erros. Corrija antes de salvar.",
              variant: "destructive",
            });
          }
        } catch (error) {
          setJsonText(content);
          setErrors(["JSON inválido - verifique a sintaxe"]);
          setIsValid(false);
          setShowLoadOptions(false);
          toast({
            title: "Erro de JSON",
            description: "Formato JSON inválido no arquivo.",
            variant: "destructive",
          });
        }
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

  const handleDownloadUpdatedConfig = () => {
    if (currentConfig) {
      // Gerar nome do arquivo com timestamp
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `ppm-config-${timestamp}.json`;
      
      const dataStr = JSON.stringify(currentConfig, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "JSON atualizado baixado!",
        description: `Arquivo ${fileName} baixado com sucesso. Compartilhe com outros analistas.`,
      });
    }
  };

  const handleClearConfig = () => {
    if (window.confirm("Tem certeza que deseja limpar a configuração atual? Isso removerá todas as perguntas e voltará para a tela inicial.")) {
      try {
        // Limpar localStorage - configuração e dados relacionados (chaves corretas)
        localStorage.removeItem('ppm.config.json');
        localStorage.removeItem('ppm.answers.f1');
        localStorage.removeItem('ppm.answers.f2');
        localStorage.removeItem('ppm.answers.f3');
        localStorage.removeItem('ppm.meta');
        localStorage.removeItem('currentInterviewId');
        localStorage.removeItem('ppm-config-timestamp');
        
        // Resetar estado
        setCurrentConfig(null);
        setJsonText("");
        setErrors([]);
        setIsValid(false);
        setShowLoadOptions(false);
        setLastUpdated(null);
        
        toast({
          title: "Configuração limpa com sucesso!",
          description: "Sistema resetado. Carregue uma nova configuração para continuar.",
        });
      } catch (error) {
        toast({
          title: "Erro ao limpar configuração",
          description: "Ocorreu um erro ao limpar os dados. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleClearDatabase = async () => {
    try {
      setIsClearingDatabase(true);
      
      const result = await criticalApi.clearDatabase();
      
      toast({
        title: "Banco de dados limpo!",
        description: `${result.deleted.interviews} entrevistas, ${result.deleted.analyses} análises e ${result.deleted.configs} configurações removidas.`,
      });
      
      // Limpar dados do localStorage também (chaves corretas) e configuração
      localStorage.removeItem('ppm.answers.f1');
      localStorage.removeItem('ppm.answers.f2');
      localStorage.removeItem('ppm.answers.f3');
      localStorage.removeItem('ppm.meta');
      localStorage.removeItem('currentInterviewId');
      localStorage.removeItem('ppm.config.json');
      localStorage.removeItem('ppm-config-timestamp');

      // Resetar estado local de configuração
      setCurrentConfig(null);
      setJsonText("");
      setErrors([]);
      setIsValid(false);
      setShowLoadOptions(false);
      setLastUpdated(null);
      
      // Limpar cache da query
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      queryClient.invalidateQueries({ queryKey: ['configs'] });

    } catch (error) {
      console.error('Erro ao limpar banco de dados:', error);
      toast({
        title: "Erro ao limpar banco de dados",
        description: "Verifique se o servidor está rodando e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsClearingDatabase(false);
    }
  };

  const handleClearDatabaseClick = () => {
    // Verificar se já está autenticado
    if (isAuthenticatedForCriticalOperations()) {
      handleClearDatabase();
    } else {
      setShowAuthModal(true);
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
          <h1 className="text-3xl font-bold text-black mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Configure as perguntas dos formulários através de JSON ou arquivo
          </p>
        </div>

        {/* Current Status */}
        {currentConfig ? (
          <Alert className="mb-6 border-accent bg-[hsl(var(--ppm-success-bg))]">
            <CheckCircle className="h-4 w-4 text-accent" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">
                  Configuração ativa: {currentConfig.forms.length} formulários com{" "}
                  {currentConfig.forms.reduce((sum, form) => sum + (form.questions?.length || 0), 0)} perguntas
                </div>
                {lastUpdated && (
                  <div className="text-sm opacity-80">
                    Última atualização: {lastUpdated}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadUpdatedConfig}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Atualizado
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Database className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <span>Nenhuma configuração carregada. Clique no botão abaixo para carregar uma configuração.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Load Options Modal */}
        {showLoadOptions && !currentConfig && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Carregar Configuração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleLoadDefault}
                  className="h-24 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 min-h-[96px]"
                >
                  <Database className="w-8 h-8" />
                  <span className="font-medium text-base">Usar JSON Padrão</span>
                  <span className="text-sm text-green-100">ppm_forms_consolidado_v2_normalizado.json</span>
                </Button>
                
                <Button
                  onClick={handleLoadCustom}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 border-2 border-blue-600 text-blue-700 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-700 transition-colors duration-200 min-h-[96px]"
                >
                  <FileUp className="w-8 h-8" />
                  <span className="font-medium text-base">Anexar JSON</span>
                  <span className="text-sm text-blue-600">Selecionar arquivo personalizado</span>
                </Button>
              </div>
              
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => setShowLoadOptions(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
          title="Selecionar arquivo JSON"
          style={{ display: 'none' }}
        />

        {/* Hidden File Input - Pesos */}
        <input
          ref={weightsFileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportWeightsFile}
          className="hidden"
          title="Selecionar arquivo de pesos"
          style={{ display: 'none' }}
        />

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
            {currentConfig ? (
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

                {/* Gerenciar Configuração */}
                <div className="space-y-6">
                  <Card className="ppm-card border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <RefreshCw className="w-5 h-5" />
                        Gerenciar Configuração
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Estatísticas */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-white p-3 rounded-lg border">
                            <div className="font-semibold text-green-700">Total de Perguntas</div>
                            <div className="text-2xl font-bold text-green-600">
                              {currentConfig?.forms.reduce((sum, form) => sum + (form.questions?.length || 0), 0) || 0}
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded-lg border">
                            <div className="font-semibold text-green-700">Formulários</div>
                            <div className="text-2xl font-bold text-green-600">
                              {currentConfig?.forms.length || 0}
                            </div>
                          </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="space-y-3">
                          <Button
                            onClick={handleDownloadUpdatedConfig}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            disabled={!currentConfig}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Baixar JSON Atualizado
                          </Button>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              onClick={handleExportWeights}
                              className="w-full border-blue-300 text-blue-700 hover:bg-transparent hover:text-blue-700 focus-visible:ring-0"
                            >
                              Exportar Pesos
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleImportWeightsClick}
                              className="w-full border-blue-300 text-blue-700 hover:bg-transparent hover:text-blue-700 focus-visible:ring-0"
                            >
                              Importar Pesos
                            </Button>
                          </div>
                          
                          <Button
                            onClick={handleClearConfig}
                            variant="outline"
                            className="w-full border-red-300 text-red-600 hover:bg-transparent hover:text-red-600 focus-visible:ring-0"
                            disabled={!currentConfig}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Limpar Configuração
                          </Button>
                          
                          <Button
                            onClick={handleClearDatabaseClick}
                            variant="outline"
                            className="w-full border-red-500 text-red-700 hover:bg-transparent hover:text-red-700 focus-visible:ring-0"
                            disabled={isClearingDatabase}
                          >
                            {isClearingDatabase ? (
                              <>
                                <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin mr-2" />
                                Apagando...
                              </>
                            ) : (
                              <>
                                <Database className="w-4 h-4 mr-2" />
                                Apagar Banco de Dados
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Informações */}
                        <div className="text-xs text-green-700 space-y-1">
                          {lastUpdated && (
                            <p><strong>📅 Última atualização:</strong> {lastUpdated}</p>
                          )}
                          <p><strong>💡 Dica:</strong> Use "Baixar JSON Atualizado" para compartilhar com outros analistas.</p>
                          <p><strong>💾 Pesos:</strong> Você também pode <em>Exportar/Importar Pesos</em> para manter a análise consistente entre ambientes.</p>
                          <p><strong>⚠️ Atenção:</strong> "Limpar Configuração" remove todas as perguntas e volta para a tela inicial.</p>
                          <p><strong>🚨 CRÍTICO:</strong> "Apagar Banco de Dados" remove TODAS as entrevistas e análises permanentemente!</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="ppm-card border-blue-200 bg-blue-50">
                <CardContent className="py-10">
                  <div className="text-center">
                    <Database className="w-20 h-20 text-blue-600 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-blue-800 mb-2">Bem-vindo ao Sistema PPM</h3>
                    <p className="text-blue-700 mb-8 text-lg">
                      Para começar, escolha uma das opções abaixo.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={handleLoadDefault}
                      className="h-24 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
                    >
                      <Database className="w-8 h-8" />
                      <span className="font-medium text-base">Usar JSON Padrão</span>
                      <span className="text-sm text-green-100">ppm_forms_consolidado_v2_normalizado.json</span>
                    </Button>
                    <Button
                      onClick={handleLoadCustom}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 border-2 border-blue-600 text-blue-700 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-700 transition-colors duration-200"
                    >
                      <FileUp className="w-8 h-8" />
                      <span className="font-medium text-base">Fazer upload de JSON</span>
                      <span className="text-sm text-blue-600">Selecionar arquivo personalizado</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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

      {/* Modal de Autenticação */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleClearDatabase}
        title="Autenticação Necessária"
        description="Esta operação é crítica e requer senha de administrador. Todas as entrevistas e análises serão removidas permanentemente."
        actionLabel="Apagar Banco de Dados"
      />
    </Layout>
  );
}
