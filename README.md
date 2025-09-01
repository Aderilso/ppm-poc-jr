# 🚀 Sistema PPM - Pesquisa de Produtividade e Metodologias

Sistema completo para coleta e análise de dados de pesquisa PPM, com suporte a múltiplos analistas, banco de dados integrado e sincronização de dados.

## 📋 Índice

- [🎯 Visão Geral](#-visão-geral)
- [🏗️ Arquitetura](#️-arquitetura)
- [🚀 Primeiros Passos](#-primeiros-passos)
- [🛠️ Melhorias Implementadas](#️-melhorias-implementadas)
- [📊 Funcionalidades](#-funcionalidades)
- [🔧 Configuração](#-configuração)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🔄 Fluxo de Trabalho](#-fluxo-de-trabalho)
- [📈 Dashboard](#-dashboard)
- [🗄️ Sistema de Banco de Dados](#️-sistema-de-banco-de-dados)
- [📤 Exportação/Importação](#-exportaçãoimportação)
- [🔐 Operações Críticas](#-operações-críticas)
- [🛠️ Scripts Disponíveis](#️-scripts-disponíveis)
- [🚨 Solução de Problemas](#-solução-de-problemas)
- [📚 Documentação](#-documentação)

## 🎯 Visão Geral

Sistema completo para pesquisa PPM com:
- ✅ **Formulários dinâmicos** (F1, F2, F3)
- ✅ **Banco de dados SQLite** com Prisma ORM
- ✅ **Sincronização entre analistas** via JSON
- ✅ **Exportação consolidada** por formulário
- ✅ **Importação consolidada** de múltiplas entrevistas
- ✅ **Dashboard completo** com métricas operacionais e analíticas
- ✅ **Sistema de autenticação** para operações críticas
- ✅ **Scripts automáticos** para configuração multiplataforma

## 🏗️ Arquitetura

```
📁 ppm-poc-jr/
├── 📁 src/                    # Frontend React + TypeScript
│   ├── 📁 components/         # Componentes reutilizáveis
│   ├── 📁 pages/             # Páginas da aplicação
│   ├── 📁 lib/               # Utilitários e APIs
│   └── 📁 hooks/             # Hooks customizados
├── 📁 server/                 # Backend Node.js + Express
│   ├── 📁 prisma/            # Schema e migrações do banco
│   ├── index.js              # Servidor Express
│   └── package.json          # Dependências do backend
├── 📁 public/                 # Arquivos estáticos
│   └── ppm_forms_consolidado_v2_normalizado.json # Configuração padrão
├── setup-completo.sh          # Script de configuração completa (macOS/Linux)
├── setup-completo.bat         # Script de configuração completa (Windows)
├── setup-database.sh          # Script de configuração do banco (macOS/Linux)
├── setup-database.bat         # Script de configuração do banco (Windows)
├── diagnostico.sh             # Diagnóstico automático (macOS/Linux)
├── diagnostico.bat            # Diagnóstico automático (Windows)
├── reiniciar-sistema.sh       # Reinicialização automática (macOS/Linux)
├── reiniciar-sistema.bat      # Reinicialização automática (Windows)
├── ppm_forms_consolidado_v2_normalizado.json # Configuração padrão (raiz)
└── public/ppm_forms_consolidado_v2_normalizado.json # Configuração padrão (web)
```

## 🚀 Primeiros Passos

### 🎯 Configuração Automática Completa

**Para Windows:**
```cmd
git clone [URL_DO_REPOSITORIO]
cd ppm-poc-jr
setup-completo.bat
```

**Para macOS/Linux:**
```bash
git clone [URL_DO_REPOSITORIO]
cd ppm-poc-jr
chmod +x setup-completo.sh
./setup-completo.sh
```

**O que o script faz automaticamente:**
- ✅ Instala todas as dependências (frontend e backend)
- ✅ Configura o banco de dados SQLite
- ✅ Gera o cliente Prisma
- ✅ Inicia backend e frontend
- ✅ Testa a API
- ✅ Verifica funcionamento completo

### 🔧 Configuração Manual (Alternativa)

```bash
# 1. Instalar dependências
npm install
cd server && npm install && cd ..

# 2. Configurar banco de dados
cd server
npx prisma generate
npx prisma db push
cd ..

# 3. Iniciar sistema
cd server && npm run dev &  # Backend
npm run dev                 # Frontend
```

### 🌐 URLs Importantes

- **Frontend**: http://localhost:8080 (ou 8081)
- **Backend API**: http://localhost:3001/api
- **Prisma Studio**: http://localhost:5555
- **Health Check**: http://localhost:3001/api/health

### 🗑️ Operações Críticas
- **Apagar Banco de Dados**: Remove TODAS as entrevistas e análises
- **Autenticação obrigatória**: Senha de administrador necessária (`!@#ad!@#`)
- **Confirmação dupla**: Modal de confirmação + senha
- **Log detalhado**: Registra todas as operações no console
- **Sessão temporária**: Autenticação válida por 24 horas
- **⚠️ ATENÇÃO**: Operação irreversível para testes

## 🛠️ Melhorias Implementadas

### ✅ Sistema Completo
- [x] **Arquivo JSON incluído**: `ppm_forms_consolidado_v2_normalizado.json` disponível no projeto
- [x] **Carregamento automático**: Sistema carrega JSON padrão automaticamente
- [x] **Fallback robusto**: JSON hardcoded como backup se arquivo não estiver disponível
- [x] **Banco de dados SQLite** com Prisma ORM
- [x] **Sincronização entre analistas** via JSON
- [x] **Exportação consolidada** por formulário
- [x] **Importação consolidada** de múltiplas entrevistas
- [x] **Tratamento robusto de erros** com ErrorBoundary
- [x] **Loading states** para transições suaves
- [x] **Interface responsiva** para todos os dispositivos
- [x] **Sistema de configuração** inteligente
- [x] **Gerenciamento de entrevistas** completo
- [x] **Sistema de autenticação** para operações críticas
- [x] **Operações críticas** com senha de administrador
- [x] **Documentação completa** para usuários

### ✅ Correções de Bugs
- [x] **Flash de erro** eliminado
- [x] **Configuração não aplicada** corrigida
- [x] **Botões duplicados** removidos
- [x] **Problemas mobile** resolvidos
- [x] **Tratamento de erros** robusto
- [x] **Botão "Nova Pesquisa"** no Dashboard funcionando

## 📊 Funcionalidades

### 🎯 Formulários Dinâmicos
- **F1**: Dados demográficos e perfil
- **F2**: Avaliação de funcionalidades PPM
- **F3**: Integrações e melhorias sugeridas

### 📈 Dashboard Completo
- **Visão Operacional**: Métricas de andamento, taxas de conclusão, distribuições
- **Visão Analítica**: NPS, satisfação, heatmap de funcionalidades, rankings

### 🗄️ Gerenciamento de Dados
- **Entrevistas individuais**: Criação, visualização, edição
- **Exportação consolidada**: Por formulário (F1, F2, F3)
- **Importação consolidada**: Múltiplas entrevistas de uma vez
- **Backup automático**: Antes de limpar dados

### 🔄 Sincronização Multi-Analista
- **Configuração compartilhada**: JSON padrão incluído no projeto
- **Exportação por formulário**: Cada analista exporta seus dados
- **Importação consolidada**: Coordenação importa todos os dados
- **Relatório final**: Consolidação de todos os analistas

## 🔧 Configuração

### 📋 Configuração Inicial
1. **Clone o repositório**
2. **Execute o script de configuração completa**:
   - Windows: `setup-completo.bat`
   - macOS/Linux: `./setup-completo.sh`
3. **Acesse**: http://localhost:8080
4. **Configure**: Vá em CONFIG → "Usar JSON Padrão"

### 🔄 Atualizações de Configuração
- **Download JSON atualizado**: Inclui novas perguntas adicionadas
- **Limpeza de configuração**: Reset para estado inicial
- **Sincronização**: Compartilhamento entre analistas

## 📁 Estrutura do Projeto

```
📁 src/
│   ├── 📁 components/         # Componentes React
│   │   ├── 📁 questions/      # Tipos de perguntas
│   │   ├── 📁 ui/            # Componentes UI (shadcn/ui)
│   │   ├── ErrorBoundary.tsx  # Tratamento global de erros
│   │   ├── AuthModal.tsx      # Modal de autenticação
│   │   └── ...
│   ├── 📁 pages/             # Páginas da aplicação
│   │   ├── Home.tsx          # Página inicial
│   │   ├── Config.tsx        # Configurações
│   │   ├── Dashboard.tsx     # Dashboard com métricas
│   │   ├── FormPage.tsx      # Formulários
│   │   ├── Entrevistas.tsx   # Gerenciamento de entrevistas
│   │   └── Resumo.tsx        # Exportação/Importação
│   ├── 📁 lib/               # Utilitários e APIs
│   │   ├── api.ts            # Cliente API para backend
│   │   ├── auth.ts           # Sistema de autenticação
│   │   ├── storage.ts        # Persistência localStorage
│   │   ├── consolidatedFormExport.ts # Exportação consolidada
│   │   ├── consolidatedImport.ts     # Importação consolidada
│   │   ├── sampleData.ts     # Dados de exemplo
│   │   └── types.ts          # Tipos TypeScript
│   └── 📁 hooks/             # Hooks customizados
│       └── useInterview.ts   # Hook para entrevistas

📁 server/
│   ├── 📁 prisma/            # Banco de dados
│   │   ├── schema.prisma     # Schema do banco
│   │   ├── migrations/       # Migrações
│   │   └── dev.db           # Banco SQLite
│   ├── index.js              # Servidor Express
│   └── package.json          # Dependências do backend
```

## 🔄 Fluxo de Trabalho

### 👥 Para Múltiplos Analistas

1. **Analista Principal**:
   - Configura o sistema
   - Adiciona novas perguntas se necessário
   - Baixa JSON atualizado
   - Compartilha com outros analistas

2. **Analistas Secundários**:
   - Clonam o repositório
   - Executam script de configuração completa
   - Carregam configuração (JSON padrão ou atualizado)
   - Realizam entrevistas
   - Exportam dados consolidados por formulário

3. **Coordenação Final**:
   - Recebe CSVs de todos os analistas
   - Importa dados consolidados
   - Gera relatório final

### 📊 Processo de Dados

```
Entrevistas → Banco de Dados → Exportação Consolidada → Importação → Relatório Final
```

## 📈 Dashboard

### 🎯 Visão Operacional
- **Total de Respondentes**: Convidados/Iniciados/Concluídos
- **Taxa de Conclusão**: Por formulário (F1, F2, F3)
- **Tempo Médio de Resposta**: Em minutos
- **Taxa de Desistência**: Iniciou mas não concluiu
- **Distribuição**: Por área e cargo
- **Status por Formulário**: Com barras de progresso

### 📊 Visão Analítica
- **NPS**: Net Promoter Score da satisfação global
- **Satisfação Geral Média**: Escala 0-10
- **Impacto na Produtividade**: Escala 1-5
- **Uso Diário**: % de uso diário/semanal vs. eventual
- **Heatmap de Funcionalidades**: Médias por categoria
- **Top 5 Sistemas**: Para integração
- **Top 5 Melhorias**: Sugeridas

## 🗄️ Sistema de Banco de Dados

### 📊 Estrutura
- **SQLite**: Banco de dados local e portável
- **Prisma ORM**: Interface type-safe para o banco
- **Migrations**: Controle de versão do schema
- **Studio**: Interface visual para gerenciamento

### 🔄 Modelos de Dados
- **Interview**: Entrevistas individuais
- **Analysis**: Análises geradas
- **Config**: Configurações do sistema

### 💾 Persistência Híbrida
- **localStorage**: Para funcionalidade offline
- **Backend**: Para persistência centralizada
- **Sincronização**: Entre local e remoto

## 📤 Exportação/Importação

### 📤 Exportação Consolidada
- **Por formulário**: F1, F2, F3 separadamente
- **Dados completos**: Todas as respostas e metadados
- **Formato CSV**: Compatível com Excel/Google Sheets
- **Timestamp**: Data/hora da exportação

### 📥 Importação Consolidada
- **Validação**: Verificação de estrutura dos dados
- **Prevenção de duplicatas**: Baseado em IDs únicos
- **Log detalhado**: Registro de todas as operações
- **Rollback**: Em caso de erro

## 🔐 Operações Críticas

### 🗑️ Apagar Banco de Dados
- **Autenticação obrigatória**: Senha de administrador
- **Confirmação dupla**: Modal + senha
- **Log detalhado**: Todas as operações registradas
- **Sessão temporária**: Válida por 24 horas
- **⚠️ ATENÇÃO**: Operação irreversível

### 🔐 Sistema de Autenticação
- **Senha criptografada**: Armazenada de forma segura
- **Sessão temporária**: Expira automaticamente
- **Logs de segurança**: Registro de tentativas
- **Fallback**: Mecanismo de recuperação

## 🛠️ Scripts Disponíveis

### 🚀 Configuração Completa
- **`setup-completo.sh`** (macOS/Linux): Configuração automática completa
- **`setup-completo.bat`** (Windows): Configuração automática completa

### 🔧 Configuração do Banco
- **`setup-database.sh`** (macOS/Linux): Configuração do banco de dados
- **`setup-database.bat`** (Windows): Configuração do banco de dados

### 🔍 Diagnóstico
- **`diagnostico.sh`** (macOS/Linux): Diagnóstico automático do sistema
- **`diagnostico.bat`** (Windows): Diagnóstico automático do sistema

### 🔄 Reinicialização
- **`reiniciar-sistema.sh`** (macOS/Linux): Reinicialização automática
- **`reiniciar-sistema.bat`** (Windows): Reinicialização automática

## 🚨 Solução de Problemas

### 🔧 Diagnóstico Rápido
```bash
# macOS/Linux
./diagnostico.sh

# Windows
diagnostico.bat
```

### 📋 Problemas Comuns

#### ❌ "Failed to fetch"
**Solução**:
1. Execute o script de diagnóstico
2. Verifique se backend está rodando na porta 3001
3. Consulte `TROUBLESHOOTING.md`

#### ❌ Sistema não inicia
**Solução**:
1. Execute o script de configuração completa
2. Verifique se Node.js está instalado
3. Verifique se as portas estão livres

#### ❌ Banco de dados não funciona
**Solução**:
1. Execute `setup-database.sh` ou `setup-database.bat`
2. Verifique se Prisma está configurado
3. Abra Prisma Studio para verificar dados

### 📞 Suporte
- **Documentação**: `TROUBLESHOOTING.md`
- **Logs**: Console do navegador (F12) e terminal
- **Diagnóstico**: Scripts automáticos disponíveis

## 📚 Documentação

### 📖 Arquivos de Documentação
- **`README.md`**: Documentação principal
- **`INSTRUCOES_ANALISTAS.md`**: Guia específico para analistas
- **`CHANGELOG.md`**: Histórico de mudanças
- **`TROUBLESHOOTING.md`**: Solução de problemas
- **`PREPARACAO_GIT.md`**: Preparação para versionamento

### 🎯 Guias Específicos
- **Configuração inicial**: Scripts automáticos
- **Fluxo de trabalho**: Para múltiplos analistas
- **Operações críticas**: Com autenticação
- **Solução de problemas**: Diagnóstico e correção

---

**Desenvolvido por Aderilso Junior**

**Versão**: 2.1.0 - Sistema Completo com Operações Críticas e Autenticação
