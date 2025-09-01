import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Play, FileText, Settings, Download } from "lucide-react";
import { Layout } from "@/components/Layout";
import { DraftBanner } from "@/components/DraftBanner";
import { hasData, clearAllData } from "@/lib/storage";
import { useState, useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [hasDraftData, setHasDraftData] = useState(false);

  useEffect(() => {
    setHasDraftData(hasData());
  }, []);

  const handleClearDraft = () => {
    clearAllData();
    setHasDraftData(false);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {hasDraftData && <DraftBanner onClearDraft={handleClearDraft} />}
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
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
              className="ppm-button-primary px-8 py-3 text-lg"
              onClick={() => navigate("/f1")}
            >
              Iniciar Pesquisa
            </Button>
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
                onClick={() => navigate("/f1")}
              >
                Acessar F1
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
                onClick={() => navigate("/f2")}
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
                onClick={() => navigate("/f3")}
              >
                Acessar F3
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="ppm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações
              </CardTitle>
              <CardDescription>
                Configure as perguntas dos formulários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/config")}
              >
                Acessar Configurações
              </Button>
            </CardContent>
          </Card>

          <Card className="ppm-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Resumo e Download
              </CardTitle>
              <CardDescription>
                Revisar respostas e baixar relatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/resumo")}
              >
                Ver Resumo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}