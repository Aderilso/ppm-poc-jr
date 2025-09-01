import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Upload, Download, Database, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useConfig } from "@/hooks/useInterview";
import { useToast } from "@/hooks/use-toast";
import { criticalApi } from "@/lib/api";
import { isAuthenticatedForCriticalOperations, createAuthSession, verifyPassword } from "@/lib/auth";
import type { PpmConfig } from "@/lib/types";

export default function Config() {
  const [configText, setConfigText] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { toast } = useToast();
  
  // Usar hook para carregar configuração do banco
  const { config, isLoading: configLoading, createConfig, isCreating } = useConfig();

  useEffect(() => {
    // Verificar autenticação ao carregar
    setIsAuthenticated(isAuthenticatedForCriticalOperations());
  }, []);

  useEffect(() => {
    if (config) {
      setConfigText(JSON.stringify(config, null, 2));
    }
  }, [config]);

  const validateConfig = (text: string): PpmConfig | null => {
    try {
      const parsed = JSON.parse(text);
      
      // Validações básicas
      if (!parsed.forms || !Array.isArray(parsed.forms)) {
        throw new Error("Configuração deve ter um array 'forms'");
      }
      
      if (parsed.forms.length === 0) {
        throw new Error("Deve haver pelo menos um formulário");
      }
      
      // Validar cada formulário
      parsed.forms.forEach((form: any, index: number) => {
        if (!form.id || !form.title || !form.questions) {
          throw new Error(`Formulário ${index + 1} deve ter id, title e questions`);
        }
        
        if (!Array.isArray(form.questions) || form.questions.length === 0) {
          throw new Error(`Formulário ${index + 1} deve ter pelo menos uma pergunta`);
        }
      });
      
      return parsed;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`JSON inválido: ${error.message}`);
      }
      throw new Error("JSON inválido");
    }
  };

  const handleValidate = () => {
    setIsValidating(true);
    try {
      const validatedConfig = validateConfig(configText);
      toast({
        title: "✅ Configuração válida",
        description: `Formulários: ${validatedConfig.forms.length}, Perguntas: ${validatedConfig.forms.reduce((acc, f) => acc + f.questions.length, 0)}`,
      });
    } catch (error) {
      toast({
        title: "❌ Erro de validação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const validatedConfig = validateConfig(configText);
      
      // Salvar no banco de dados
      await createConfig({
        forms: validatedConfig.forms,
        lookups: validatedConfig.lookups || {},
        name: "Configuração PPM",
        description: "Configuração padrão do sistema PPM"
      });
      
      toast({
        title: "✅ Configuração salva",
        description: "Configuração foi salva no banco de dados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "❌ Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDefault = async () => {
    try {
      setIsSaving(true);
      
      // Carregar configuração padrão do arquivo
      const response = await fetch('/ppm_forms_consolidado_v2_normalizado.json');
      if (!response.ok) {
        throw new Error('Erro ao carregar arquivo padrão');
      }
      
      const defaultConfig = await response.json();
      setConfigText(JSON.stringify(defaultConfig, null, 2));
      
      // Validar e salvar automaticamente
      const validatedConfig = validateConfig(JSON.stringify(defaultConfig));
      await createConfig({
        forms: validatedConfig.forms,
        lookups: validatedConfig.lookups || {},
        name: "Configuração PPM Padrão",
        description: "Configuração padrão carregada automaticamente"
      });
      
      toast({
        title: "✅ Configuração padrão carregada",
        description: "Configuração padrão foi carregada e salva automaticamente!",
      });
    } catch (error) {
      toast({
        title: "❌ Erro ao carregar padrão",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setConfigText(content);
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    try {
      const validatedConfig = validateConfig(configText);
      const blob = new Blob([JSON.stringify(validatedConfig, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ppm-config.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "❌ Erro ao baixar",
        description: "Valide a configuração antes de baixar",
        variant: "destructive",
      });
    }
  };

  const handleClearDatabase = async () => {
    if (!isAuthenticated) {
      setShowPasswordInput(true);
      return;
    }

    try {
      setIsClearing(true);
      await criticalApi.clearDatabase();
      
      toast({
        title: "🗑️ Banco limpo",
        description: "Todos os dados foram removidos com sucesso!",
      });
      
      setShowClearConfirm(false);
      setIsAuthenticated(false);
    } catch (error) {
      toast({
        title: "❌ Erro ao limpar banco",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleLogin = (inputPassword: string) => {
    if (verifyPassword(inputPassword)) {
      createAuthSession();
      setIsAuthenticated(true);
      toast({
        title: "✅ Autenticado",
        description: "Senha correta! Você pode realizar operações críticas.",
      });
    } else {
      toast({
        title: "❌ Senha incorreta",
        description: "A senha fornecida está incorreta.",
        variant: "destructive",
      });
    }
  };

  if (configLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando configuração...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Configure os formulários e parâmetros do sistema PPM
          </p>
        </div>

        {/* Configuração Atual */}
        {config && (
          <Card className="ppm-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Configuração Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Formulários:</strong> {config.forms.length}
                </div>
                <div>
                  <strong>Total de Perguntas:</strong>{" "}
                  {config.forms.reduce((acc, f) => acc + f.questions.length, 0)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Editor de Configuração */}
        <Card className="ppm-card mb-6">
          <CardHeader>
            <CardTitle>Editor de Configuração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="config-text">Configuração JSON</Label>
                <Textarea
                  id="config-text"
                  value={configText}
                  onChange={(e) => setConfigText(e.target.value)}
                  placeholder="Cole aqui a configuração JSON..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleValidate}
                  disabled={isValidating || !configText.trim()}
                  variant="outline"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Validando...
                    </>
                  ) : (
                    "Validar JSON"
                  )}
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={isSaving || !configText.trim()}
                  className="ppm-button-primary"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Configuração"
                  )}
                </Button>

                <Button
                  onClick={handleLoadDefault}
                  disabled={isSaving}
                  variant="outline"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Carregando...
                    </>
                  ) : (
                    "Usar JSON Padrão"
                  )}
                </Button>

                <Button
                  onClick={handleDownload}
                  variant="outline"
                  disabled={!configText.trim()}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload de Arquivo */}
        <Card className="ppm-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Anexar JSON
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Selecionar arquivo JSON</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="min-h-[96px]"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Selecione um arquivo JSON válido para substituir a configuração atual
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Operações Críticas */}
        <Card className="ppm-card border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Operações Críticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  ⚠️ Estas operações são irreversíveis e afetam todos os dados do sistema
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowClearConfirm(true)}
                  variant="destructive"
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Limpando...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Apagar Banco de Dados
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Confirmação */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-destructive">
                  ⚠️ Confirmação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Tem certeza que deseja apagar TODOS os dados do banco? Esta ação é irreversível!
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowClearConfirm(false)}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleClearDatabase}
                    variant="destructive"
                    disabled={isClearing}
                  >
                    Sim, Apagar Tudo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Senha */}
        {showPasswordInput && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>🔐 Autenticação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="password">Senha de Administrador</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite a senha"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowPasswordInput(false)}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        handleLogin(password);
                        setShowPasswordInput(false);
                        setPassword("");
                      }}
                      className="ppm-button-primary"
                    >
                      Confirmar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}