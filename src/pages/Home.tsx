import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Play, FileText, Settings, Download, BarChart3, Loader2, Users } from "lucide-react";
import { Layout } from "@/components/Layout";
import { DraftBanner } from "@/components/DraftBanner";
import { useInterview } from "@/hooks/useInterview";
import { useState, useEffect } from "react";

export default function Home() {
  console.log("🏠 Home.tsx está sendo renderizada!");
  
  const navigate = useNavigate();
  const [hasDraftData, setHasDraftData] = useState(false);
  const [isStartingInterview, setIsStartingInterview] = useState(false);

  // Usar o hook de entrevista
  const { currentInterview, startInterview, clearDraft, isLoading, error, isOnline } = useInterview();

  console.log("🔍 Home - Estado atual:", {
    currentInterview,
    hasDraftData,
    isStartingInterview,
    isLoading,
    error,
    isOnline
  });

  useEffect(() => {
    // Verificar se há uma entrevista em andamento COM DADOS REAIS
    if (currentInterview && currentInterview.id) {
      // Verificar se a entrevista tem dados salvos e não está concluída
      const hasF1Data = currentInterview.f1Answers && Object.keys(currentInterview.f1Answers).length > 0;
      const hasF2Data = currentInterview.f2Answers && Object.keys(currentInterview.f2Answers).length > 0;
      const hasF3Data = currentInterview.f3Answers && Object.keys(currentInterview.f3Answers).length > 0;
      const hasMetaData = currentInterview.interviewerName || currentInterview.respondentName || currentInterview.respondentDepartment;
      const isCompleted = currentInterview.isCompleted;
      
      // Considerar metadados como dados válidos também
      const hasRealData = (hasF1Data || hasF2Data || hasF3Data || hasMetaData) && !isCompleted;
      console.log("🔍 Home - useEffect: hasRealData =", hasRealData, {
        hasF1Data,
        hasF2Data,
        hasF3Data,
        hasMetaData,
        isCompleted,
        interviewerName: currentInterview.interviewerName,
        respondentName: currentInterview.respondentName,
        respondentDepartment: currentInterview.respondentDepartment
      });
      setHasDraftData(hasRealData);
    } else {
      console.log("🔍 Home - useEffect: Sem entrevista ativa");
      setHasDraftData(false);
    }
  }, [currentInterview]);

  const handleClearDraft = () => {
    console.log("🧹 Home - Limpando rascunho");
    
    // Limpar estado local
    setHasDraftData(false);
    
    // Usar o hook para limpar a entrevista atual
    if (currentInterview) {
      console.log("🧹 Home - Chamando clearDraft() do hook");
      clearDraft();
    }
  };

  const handleStartInterview = async () => {
    console.log("🚀 Home - Iniciando entrevista...");
    try {
      setIsStartingInterview(true);
      console.log("🔍 Home - Chamando startInterview()...");
      const result = await startInterview();
      console.log("✅ Home - Entrevista iniciada com sucesso:", result);
      navigate("/f1");
    } catch (error) {
      console.error('❌ Home - Erro ao iniciar entrevista:', error);
      // Mostrar erro para o usuário
    } finally {
      setIsStartingInterview(false);
    }
  };

  const handleAccessForm = async (formId: string) => {
    console.log(`🔍 Home - Acessando formulário ${formId}`);
    console.log(`🔍 Home - Estado atual:`, { hasDraftData, currentInterview, formId });
    
    if (hasDraftData || currentInterview) {
      console.log(`✅ Home - Com dados de rascunho ou entrevista ativa, navegando para /${formId}`);
      navigate(`/${formId}`);
    } else {
      console.log("⚠️ Home - Sem dados de rascunho nem entrevista ativa, iniciando nova entrevista...");
      try {
        setIsStartingInterview(true);
        console.log("🔍 Home - Chamando startInterview()...");
        const result = await startInterview();
        console.log("✅ Home - Entrevista iniciada com sucesso:", result);
        // Navegar para o formulário específico, não sempre para F1
        console.log(`🎯 Home - Navegando para formulário ${formId}`);
        navigate(`/${formId}`);
      } catch (error) {
        console.error('❌ Home - Erro ao iniciar entrevista:', error);
        // Mostrar erro para o usuário
      } finally {
        setIsStartingInterview(false);
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {hasDraftData && <DraftBanner onClearDraft={handleClearDraft} />}
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">
            Pesquisa sobre Ferramentas PPM
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Avalie as necessidades e funcionalidades de Project Portfolio Management 
            da sua organização através de três questionários estruturados.
          </p>
        </div>

        {/* Quick Start */}
        <Card className="ppm-card mb-8 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              Começar Avaliação
            </CardTitle>
            <CardDescription>
              Complete os três formulários para uma análise completa das suas necessidades PPM
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg bg-black text-white hover:bg-zinc-900"
              onClick={handleStartInterview}
              disabled={isStartingInterview || isLoading}
            >
              {isStartingInterview ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Iniciando...
                </>
              ) : (
                "Iniciar Pesquisa"
              )}
            </Button>
            {error && (
              <p className="text-red-500 text-sm mt-2">
                Erro: {error.message || 'Erro desconhecido'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Forms Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="ppm-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Formulário 1
              </CardTitle>
              <CardDescription>Avaliação Geral</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Maturidade dos processos PPM, satisfação com ferramentas atuais e contexto organizacional.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleAccessForm("f1")}
                disabled={isStartingInterview || isLoading}
              >
                {isStartingInterview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Iniciando...
                  </>
                ) : (
                  "Acessar F1"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="ppm-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Formulário 2
              </CardTitle>
              <CardDescription>Análise de Funcionalidades</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Funcionalidades críticas, benchmarking de ferramentas e necessidades específicas.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleAccessForm("f2")}
                disabled={isStartingInterview || isLoading}
              >
                Acessar F2
              </Button>
            </CardContent>
          </Card>

          <Card className="ppm-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Formulário 3
              </CardTitle>
              <CardDescription>Necessidades de Integração</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Sistemas para integrar, tipos de dados e desafios de conectividade.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleAccessForm("f3")}
                disabled={isStartingInterview || isLoading}
              >
                Acessar F3
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="ppm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Dashboard
              </CardTitle>
              <CardDescription>
                Visualize indicadores e métricas em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/dashboard")}
              >
                Ver Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="ppm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Entrevistas
              </CardTitle>
              <CardDescription>
                Gerencie todas as entrevistas realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/entrevistas")}
              >
                Ver Entrevistas
              </Button>
            </CardContent>
          </Card>

          <Card className="ppm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Exportar
              </CardTitle>
              <CardDescription>
                Baixe relatórios e dados consolidados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/resumo")}
              >
                Exportar Dados
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Card */}
        <Card className="ppm-card mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações
            </CardTitle>
            <CardDescription>
              Configure formulários e parâmetros do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/config")}
            >
              Configurar Sistema
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
