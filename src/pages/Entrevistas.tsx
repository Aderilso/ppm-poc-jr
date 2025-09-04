import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Eye, 
  Download,
  Calendar,
  User,
  UserCheck,
  Building,
  AlertTriangle,
  Play
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useInterviews, useAnalyses, useInterview, useConfig } from "@/hooks/useInterview";
import { generateConsolidatedReport, exportConsolidatedReportToCsv } from "@/lib/consolidatedReport";
import type { PpmMeta, Answers } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InterviewDetailsProps {
  interview: any;
  onClose: () => void;
}

function InterviewDetails({ interview, onClose }: InterviewDetailsProps) {
  const formatAnswers = (answers: any) => {
    if (!answers) return "Nenhuma resposta";
    
    return Object.entries(answers).map(([key, value]) => (
      <div key={key} className="mb-2">
        <strong className="text-sm text-muted-foreground">{key}:</strong>
        <span className="ml-2 text-sm">
          {Array.isArray(value) ? value.join(", ") : String(value)}
        </span>
      </div>
    ));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Entrevista</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-sm text-muted-foreground">ID:</strong>
                  <p className="text-sm font-mono">{interview.id}</p>
                </div>
                <div>
                  <strong className="text-sm text-muted-foreground">Status:</strong>
                  <Badge variant={interview.isCompleted ? "default" : "secondary"}>
                    {interview.isCompleted ? "Concluída" : "Em andamento"}
                  </Badge>
                </div>
                <div>
                  <strong className="text-sm text-muted-foreground">Criada em:</strong>
                  <p className="text-sm">
                    {format(new Date(interview.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                {interview.completedAt && (
                  <div>
                    <strong className="text-sm text-muted-foreground">Concluída em:</strong>
                    <p className="text-sm">
                      {format(new Date(interview.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metadados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-sm text-muted-foreground">Tipo:</strong>
                  <p className="text-sm">
                    {interview.isInterviewer ? "Entrevistador" : "Auto-preenchimento"}
                  </p>
                </div>
                {interview.interviewerName && (
                  <div>
                    <strong className="text-sm text-muted-foreground">Entrevistador:</strong>
                    <p className="text-sm">{interview.interviewerName}</p>
                  </div>
                )}
                {interview.respondentName && (
                  <div>
                    <strong className="text-sm text-muted-foreground">Respondente:</strong>
                    <p className="text-sm">{interview.respondentName}</p>
                  </div>
                )}
                {interview.respondentDepartment && (
                  <div>
                    <strong className="text-sm text-muted-foreground">Departamento:</strong>
                    <p className="text-sm">{interview.respondentDepartment}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Respostas dos formulários */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Respostas dos Formulários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Formulário 1 - Avaliação Geral</h4>
                  <div className="bg-muted p-3 rounded-md">
                    {formatAnswers(interview.f1Answers)}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Formulário 2 - Análise de Funcionalidades</h4>
                  <div className="bg-muted p-3 rounded-md">
                    {formatAnswers(interview.f2Answers)}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Formulário 3 - Necessidades de Integração</h4>
                  <div className="bg-muted p-3 rounded-md">
                    {formatAnswers(interview.f3Answers)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Entrevistas() {
  const { interviews, isLoading, error, deleteInterview, isDeleting, updateInterviewStatuses, refetchList } = useInterviews();
  const { analyses } = useAnalyses(); // Manter para não quebrar funcionalidades
  const { resumeInterview } = useInterview(); // Hook para retomar entrevista
  const { config, isLoading: isConfigLoading } = useConfig();
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isResumingInterview, setIsResumingInterview] = useState<string | null>(null);
  const navigate = useNavigate();

  // Função para atualizar status das entrevistas
  const handleUpdateStatuses = async () => {
    setIsUpdatingStatus(true);
    try {
      await updateInterviewStatuses();
      // Garantir atualização imediata da lista após marcar concluídas
      await refetchList();
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Função para retomar uma entrevista
  const handleResumeInterview = async (interviewId: string) => {
    setIsResumingInterview(interviewId);
    try {
      console.log("🔄 Entrevistas - Retomando entrevista:", interviewId);
      
      // TESTE: Verificar dados antes de retomar
      const testResponse = await fetch(`/api/interviews/${interviewId}`);
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log("🧪 Entrevistas - Dados da API ANTES de retomar:", {
          id: testData.id,
          isInterviewer: testData.isInterviewer,
          interviewerName: testData.interviewerName,
          respondentName: testData.respondentName,
          respondentDepartment: testData.respondentDepartment,
          f1AnswersCount: testData.f1Answers ? Object.keys(testData.f1Answers).length : 0,
          f2AnswersCount: testData.f2Answers ? Object.keys(testData.f2Answers).length : 0,
          f3AnswersCount: testData.f3Answers ? Object.keys(testData.f3Answers).length : 0
        });
      }
      
      await resumeInterview(interviewId);
      
      // Navegar para o próximo formulário não preenchido
      const interview = interviews.find(i => i.id === interviewId);
      if (interview) {
        const decideNextForm = (): string => {
          // Se não há config ainda, usar fallback simples
          if (!config || !config.forms) {
            let fallback = "/f1";
            if (interview.f1Answers && Object.keys(interview.f1Answers).length > 0) {
              fallback = interview.f2Answers && Object.keys(interview.f2Answers).length > 0 ? "/f3" : "/f2";
            }
            return fallback;
          }

          const order: Array<'f1'|'f2'|'f3'> = ['f1', 'f2', 'f3'];
          for (const fid of order) {
            const form = config.forms.find(f => f.id === fid);
            if (!form) continue;
            const activeQs = form.questions.filter(q => q.active !== false);
            const ans: Record<string, any> = (interview as any)[`${fid}Answers`] || {};
            const answeredCount = activeQs.reduce((acc, q) => acc + (ans[q.id] !== undefined && ans[q.id] !== '' ? 1 : 0), 0);
            const totalActive = activeQs.length;
            console.log(`🔎 Resume decide - ${fid}: ${answeredCount}/${totalActive}`);
            if (answeredCount < totalActive) return `/${fid}`;
          }
          // Todos completos? Voltar ao F3 como fallback
          return '/f3';
        };

        const nextForm = decideNextForm();
        
        console.log("🎯 Entrevistas - Navegando para:", nextForm);
        
        // Navegação suave sem reload completo
        navigate(nextForm);
      }
    } catch (error) {
      console.error("❌ Entrevistas - Erro ao retomar entrevista:", error);
      alert(`Erro ao retomar entrevista: ${error.message}`);
    } finally {
      setIsResumingInterview(null);
    }
  };

  // Debug: Log dos dados recebidos
  useEffect(() => {
    console.log('🔍 Entrevistas - Hook useInterviews retornou:', {
      totalInterviews: interviews.length,
      isLoading,
      error,
      interviews: interviews.map(i => ({
        id: i.id,
        isInterviewer: i.isInterviewer,
        interviewerName: i.interviewerName,
        respondentName: i.respondentName,
        respondentDepartment: i.respondentDepartment,
        isCompleted: i.isCompleted,
        createdAt: i.createdAt
      }))
    });
    
    // Log mais visível para debug
    if (interviews.length > 0) {
      console.log('🎯 DEBUG VISÍVEL - Primeira entrevista:', interviews[0]);
      console.log('🎯 DEBUG VISÍVEL - Todos os campos:', {
        id: interviews[0].id,
        isInterviewer: interviews[0].isInterviewer,
        interviewerName: interviews[0].interviewerName,
        respondentName: interviews[0].respondentName,
        respondentDepartment: interviews[0].respondentDepartment,
        isCompleted: interviews[0].isCompleted
      });
    }
  }, [interviews, isLoading, error]);

  // Debug: Log quando a página carrega
  useEffect(() => {
    console.log('🚀 Entrevistas - Página carregada');
    console.log('🔍 Entrevistas - Estado inicial:', { interviews, isLoading, error });
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta entrevista? Esta ação não pode ser desfeita.")) {
      deleteInterview(id);
    }
  };

  const getAnalysisForInterview = (interviewId: string) => {
    return analyses.find(analysis => analysis.interviewId === interviewId);
  };

  // Download consolidado de uma entrevista específica (F1+F2+F3)
  const handleDownloadInterview = (interview: any) => {
    try {
      if (!config) {
        toast({ title: 'Configuração não encontrada', description: 'Carregue uma configuração ativa para exportar.', variant: 'destructive' });
        return;
      }
      const answers: { f1: Answers; f2: Answers; f3: Answers } = {
        f1: interview.f1Answers || {},
        f2: interview.f2Answers || {},
        f3: interview.f3Answers || {},
      };
      const meta: PpmMeta = {
        is_interviewer: interview.isInterviewer || false,
        interviewer_name: interview.interviewerName || '',
        respondent_name: interview.respondentName || '',
        respondent_department: interview.respondentDepartment || '',
      };
      const report = generateConsolidatedReport(config, answers, meta);
      const csvContent = exportConsolidatedReportToCsv(report);
      const filenameBase = interview.respondentName ? interview.respondentName.replace(/[^a-zA-Z0-9-_]/g, '_') : interview.id.substring(0,8);
      const ts = new Date().toISOString().slice(0,16).replace(/[:-]/g, '').replace('T','-');
      const filename = `PPM_Relatorio_Consolidado_${filenameBase}_${ts}.csv`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      toast({ title: 'Download realizado', description: `${filename} baixado com sucesso!` });
    } catch (error:any) {
      console.error('Erro ao gerar relatório consolidado:', error);
      toast({ title: 'Erro ao gerar relatório', description: error?.message || 'Erro desconhecido', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando entrevistas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert className="border-destructive bg-[hsl(var(--ppm-error-bg))]">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription>
            Erro ao carregar entrevistas: {error.message}
          </AlertDescription>
        </Alert>
      </Layout>
    );
  }

  const completedInterviews = interviews.filter(i => i.isCompleted);
  const pendingInterviews = interviews.filter(i => !i.isCompleted);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Gerenciar Entrevistas</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as entrevistas realizadas no sistema
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="ppm-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Entrevistas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interviews.length}</div>
            </CardContent>
          </Card>

          <Card className="ppm-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedInterviews.length}</div>
            </CardContent>
          </Card>

          <Card className="ppm-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingInterviews.length}</div>
            </CardContent>
          </Card>

          <Card className="ppm-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {interviews.length > 0 ? Math.round((completedInterviews.length / interviews.length) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Entrevistas */}
        <Card className="ppm-card">
          <CardHeader>
            <CardTitle>Lista de Entrevistas</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateStatuses}
                disabled={isUpdatingStatus}
                variant="outline"
                size="sm"
              >
                {isUpdatingStatus ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Atualizar Status
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {interviews.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma entrevista encontrada</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Entrevistador</TableHead>
                    <TableHead>Respondente</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((interview) => {
                    const analysis = getAnalysisForInterview(interview.id);
                    return (
                      <TableRow key={interview.id}>
                        <TableCell className="font-mono text-xs">
                          {interview.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant={interview.isCompleted ? "default" : "secondary"}>
                            {interview.isCompleted ? "Concluída" : "Em andamento"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                            {interview.interviewerName || "Não informado"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {interview.respondentName || "Não informado"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            {interview.respondentDepartment || "Não informado"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(interview.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInterview(interview)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {/* Botão Retomar Entrevista - só para entrevistas em andamento */}
                            {!interview.isCompleted && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResumeInterview(interview.id)}
                                disabled={isResumingInterview === interview.id}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                {isResumingInterview === interview.id ? (
                                  <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
                                    Retomando...
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4" />
                                    Retomar
                                  </>
                                )}
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadInterview(interview)}
                              disabled={!interview.isCompleted}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(interview.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal de detalhes */}
        {selectedInterview && (
          <InterviewDetails
            interview={selectedInterview}
            onClose={() => setSelectedInterview(null)}
          />
        )}
      </div>
    </Layout>
  );
}
