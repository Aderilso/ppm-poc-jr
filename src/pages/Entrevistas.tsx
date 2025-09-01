import { useState } from "react";
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
  Building,
  AlertTriangle
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useInterviews, useAnalyses } from "@/hooks/useInterview";
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
  const { interviews, isLoading, error, deleteInterview, isDeleting } = useInterviews();
  const { analyses } = useAnalyses();
  const [selectedInterview, setSelectedInterview] = useState<any>(null);

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta entrevista? Esta ação não pode ser desfeita.")) {
      deleteInterview(id);
    }
  };

  const getAnalysisForInterview = (interviewId: string) => {
    return analyses.find(analysis => analysis.interviewId === interviewId);
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
                    <TableHead>Respondente</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead>Análise</TableHead>
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
                          {analysis ? (
                            <Badge variant="outline" className="text-green-600">
                              Score: {analysis.overallScore.toFixed(1)}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Sem análise
                            </Badge>
                          )}
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
                            <Button
                              variant="outline"
                              size="sm"
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
