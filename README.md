# Sistema de Pesquisa PPM (Project Portfolio Management)

Uma aplicação web moderna para avaliação de necessidades organizacionais em ferramentas de gestão de portfólio de projetos, com suporte completo para múltiplos analistas e sincronização de dados.

## 📋 Sobre o Projeto

Este sistema permite que organizações avaliem suas necessidades de ferramentas PPM através de três questionários estruturados, com suporte completo para trabalho colaborativo entre múltiplos analistas:

- **Formulário 1**: Avaliação Geral (maturidade PPM, satisfação com ferramentas atuais)
- **Formulário 2**: Análise de Funcionalidades (benchmarking, necessidades específicas)
- **Formulário 3**: Necessidades de Integração (sistemas, dados, conectividade)

### 🎯 Funcionalidades para Múltiplos Analistas
- **Sincronização via JSON**: Compartilhamento de configurações entre analistas
- **Banco de dados centralizado**: Armazenamento de todas as entrevistas
- **Exportação consolidada**: Relatórios por formulário com todas as entrevistas
- **Importação consolidada**: Carregamento de múltiplas entrevistas de uma vez
- **Modo offline/online**: Funciona com ou sem conexão com servidor

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **UI Components**: shadcn/ui (baseado em Radix UI)
- **Styling**: Tailwind CSS com tema customizado
- **Formulários**: React Hook Form + Zod para validação
- **Roteamento**: React Router DOM
- **Estado**: localStorage + React Query para cache
- **Ícones**: Lucide React
- **Error Boundary**: Tratamento global de erros

### Backend
- **Node.js** + **Express**
- **SQLite** (banco de dados)
- **Prisma ORM** (mapeamento objeto-relacional)
- **CORS** (Cross-Origin Resource Sharing)
- **UUID** (identificadores únicos)

## ✨ Funcionalidades Principais

### 🔧 Sistema de Configuração Dinâmica
- **Formulários configuráveis**: Totalmente personalizáveis via JSON
- **Validação robusta**: Schema Zod com tratamento de erros
- **Upload/download**: Importação e exportação de configurações
- **Dados de exemplo**: Templates pré-configurados incluídos
- **Interface intuitiva**: Editor JSON + formulário visual para novas perguntas
- **Gerenciamento de perguntas**: Ativar/inativar perguntas sem perder dados
- **Carregamento inteligente**: "Usar JSON Padrão" ou "Anexar JSON"
- **Limpeza de configuração**: Reset completo do sistema

### 📥 Sistema de Importação/Exportação Avançado
- **Templates CSV inteligentes**: Geração automática por formulário
- **Estrutura detalhada**: Perguntas e opções visíveis no template
- **Importação robusta**: Validação completa e processamento automático
- **Integração externa**: Compatível com Forms, Google Forms, etc.
- **Relatórios consolidados**: Análise completa com scores e recomendações
- **Importação consolidada**: Carregamento de múltiplas entrevistas
- **Exportação consolidada**: Todas as entrevistas por formulário

### 💾 Sistema de Persistência Híbrido
- **localStorage**: Persistência local para modo offline
- **Banco de dados SQLite**: Armazenamento centralizado
- **Sincronização automática**: Entre localStorage e banco
- **Modo offline/online**: Funciona com ou sem servidor
- **Modo rascunho**: Com banner de aviso
- **Recuperação de dados**: Entre sessões
- **Backup automático**: Proteção contra perda de dados

### 👥 Funcionalidades de Entrevista
- **Modo entrevistador**: Com campos específicos
- **Metadados do respondente**: Nome, departamento, etc.
- **Campos condicionais**: Baseados no contexto
- **Gerenciamento de entrevistas**: Visualizar todas as entrevistas
- **Identificação única**: UUID para cada entrevista
- **Timestamps**: Controle de criação e modificação

### 📊 Exportação e Relatórios
- **Download individual**: Por formulário (CSV)
- **Relatório consolidado**: Análise completa
- **Nomes de arquivo**: Com timestamp automático
- **Visualização completa**: Das respostas
- **Gerenciamento de entrevistas**: Visualizar todas as entrevistas
- **Análises centralizadas**: Scores e insights armazenados
- **Estatísticas em tempo real**: Dashboard com métricas
- **Exportação consolidada**: Todas as entrevistas por formulário

### 🎨 Interface e UX
- **Design responsivo**: Moderno e adaptável
- **Indicadores de progresso**: Visuais e intuitivos
- **Tooltips informativos**: Para cada pergunta
- **Navegação intuitiva**: Entre formulários
- **Tema visual consistente**: Design system unificado
- **Loading states**: Transições suaves
- **Error handling**: Tratamento global de erros
- **Feedback visual**: Toasts e notificações

### 🔄 Sistema de Sincronização entre Analistas
- **Download de configuração atualizada**: JSON com timestamp
- **Compartilhamento via arquivo**: Entre analistas
- **Importação consolidada**: Múltiplas entrevistas
- **Controle de versão**: Timestamps de última atualização
- **Limpeza de configuração**: Reset para nova configuração
- **Backup automático**: Antes de limpar dados

### 🗑️ Operações Críticas
- **Apagar Banco de Dados**: Remove TODAS as entrevistas e análises
- **Autenticação obrigatória**: Senha de administrador necessária (`!@#ad!@#`)
- **Confirmação dupla**: Modal de confirmação + senha
- **Log detalhado**: Registra todas as operações no console
- **Sessão temporária**: Autenticação válida por 24 horas
- **⚠️ ATENÇÃO**: Operação irreversível para testes

## 🛠 Melhorias Implementadas

### ✅ Sistema de Banco de Dados
- **SQLite**: Banco de dados local e portável
- **Prisma ORM**: Mapeamento objeto-relacional
- **Migrações automáticas**: Controle de versão do banco
- **Inicialização automática**: Script de setup completo
- **Backup e restore**: Proteção de dados

### ✅ Sistema de Entrevistas
- **Identificação única**: UUID para cada entrevista
- **Metadados completos**: Respondente, entrevistador, timestamp
- **Status de conclusão**: Controle de entrevistas completas
- **Busca e filtros**: Encontrar entrevistas específicas
- **Visualização detalhada**: Todas as respostas por entrevista

### ✅ Exportação/Importação Consolidada
- **Exportação por formulário**: Todas as entrevistas de um formulário
- **Importação consolidada**: Múltiplas entrevistas de uma vez
- **Validação robusta**: Verificação de dados antes da importação
- **Prevenção de duplicatas**: Controle de entrevistas existentes
- **Estatísticas de importação**: Relatório de sucesso/erros

### ✅ Sistema de Configuração Melhorado
- **Carregamento inteligente**: "Usar JSON Padrão" ou "Anexar JSON"
- **Salvamento automático**: Configuração aplicada instantaneamente
- **Limpeza de configuração**: Reset completo do sistema
- **Controle de timestamp**: Última atualização registrada
- **Backup antes de limpar**: Proteção contra perda acidental

### ✅ Tratamento de Erros Robusto
- **Error Boundary**: Captura global de erros JavaScript
- **Loading states**: Estados de carregamento para evitar flash de erro
- **Fallbacks inteligentes**: Sistema funciona mesmo com erros
- **Logs detalhados**: Para debugging e monitoramento
- **Recovery automático**: Tentativas de recuperação

### ✅ Performance e UX
- **Loading suave**: Transições sem flash de erro
- **React Query**: Cache inteligente e sincronização
- **Lazy loading**: Carregamento sob demanda
- **Otimizações**: Re-renders controlados
- **Responsividade**: Funciona em todos os dispositivos

## 🏗 Arquitetura

```
ppm-poc-jr/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ui/            # Componentes base (shadcn/ui)
│   │   ├── questions/     # Componentes específicos de perguntas
│   │   ├── Layout.tsx     # Template principal
│   │   ├── Question.tsx   # Renderizador universal de perguntas
│   │   ├── ErrorBoundary.tsx # Tratamento global de erros
│   │   ├── AuthModal.tsx  # Modal de autenticação
│   │   └── HelpTooltip.tsx # Tooltips de ajuda
│   ├── pages/             # Páginas da aplicação
│   │   ├── Home.tsx       # Página inicial
│   │   ├── Config.tsx     # Configuração de formulários
│   │   ├── FormPage.tsx   # Template para F1/F2/F3
│   │   ├── Resumo.tsx     # Visualização e download
│   │   └── Entrevistas.tsx # Gerenciamento de entrevistas
│   ├── lib/               # Utilitários e tipos
│   │   ├── types.ts       # Definições TypeScript
│   │   ├── schema.ts      # Validação Zod
│   │   ├── storage.ts     # Persistência localStorage
│   │   ├── api.ts         # Cliente API para backend
│   │   ├── auth.ts        # Sistema de autenticação
│   │   ├── sampleData.ts  # Dados de exemplo
│   │   ├── csv.ts         # Geração de relatórios
│   │   ├── consolidatedFormExport.ts # Exportação consolidada
│   │   ├── consolidatedImport.ts # Importação consolidada
│   │   └── weightManager.ts # Gerenciamento de pesos
│   └── hooks/             # Hooks customizados
│       └── useInterview.ts # Hook para gerenciar entrevistas
├── server/                # Backend Node.js
│   ├── prisma/           # Schema e migrações do banco
│   │   └── schema.prisma # Definição das tabelas
│   ├── index.js          # Servidor Express
│   ├── init-db.js        # Script de inicialização
│   └── package.json      # Dependências do backend
├── setup-database.sh     # Script de instalação
├── ppm_forms_consolidado_v2_normalizado.json # Configuração padrão (raiz)
└── public/ppm_forms_consolidado_v2_normalizado.json # Configuração padrão (web)
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação Completa (Recomendado)

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd ppm-poc-jr

# Instale as dependências do frontend
npm install

# Configure o banco de dados
./setup-database.sh

# OU configure manualmente:
cd server
npm install
npm run db:generate
npm run db:migrate
npm run db:init
cd ..

# Inicie o servidor backend (em um terminal)
cd server && npm run dev

# Inicie o frontend (em outro terminal)
npm run dev
```

### Instalação Simples (apenas localStorage)

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd ppm-poc-jr

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Build para Produção
```bash
# Gerar build otimizado
npm run build

# Preview do build
npm run preview
```

## 📖 Como Usar

### 1. Configuração Inicial
- Acesse `/config` para configurar os formulários
- Clique em "Carregar Configuração"
- Escolha "Usar JSON Padrão" (carrega automaticamente)
- Ou "Anexar JSON" para arquivo personalizado

### 2. Trabalho com Múltiplos Analistas

#### Para o Analista Principal:
1. **Configure o sistema**: Carregue a configuração inicial
2. **Adicione perguntas**: Use a aba "Nova Pergunta" se necessário
3. **Baixe configuração atualizada**: Use "Baixar JSON Atualizado"
4. **Compartilhe**: Envie o arquivo JSON para outros analistas

#### Para Analistas Secundários:
1. **Receba o JSON**: Do analista principal
2. **Carregue configuração**: Use "Anexar JSON" na página de configurações
3. **Realize entrevistas**: Preencha os formulários normalmente
4. **Exporte consolidado**: Use "Consolidado por Formulário" no Resumo
5. **Envie para coordenação**: Arquivo consolidado para análise final

#### Para Coordenação Final:
1. **Receba consolidados**: De todos os analistas
2. **Importe consolidados**: Use "Importação Consolidada" no Resumo
3. **Gere relatório final**: Use "Relatório Consolidado"

### 3. Criação de Novas Perguntas
- Na aba "Nova Pergunta", crie perguntas personalizadas
- Selecione o formulário de destino (F1, F2 ou F3)
- Escolha o tipo de pergunta e configure opções
- Defina categoria e peso para análise
- A pergunta aparece imediatamente no formulário

### 4. Gerenciamento de Perguntas
- Use a aba "Gerenciar Perguntas" para ativar/inativar perguntas
- Perguntas inativas não aparecem nos questionários
- Mantenha perguntas para uso futuro sem removê-las

### 5. Preenchimento dos Formulários
- Navegue pelos formulários F1, F2 e F3
- O progresso é salvo automaticamente
- Use os tooltips (?) para entender cada pergunta
- Apenas perguntas ativas são exibidas

### 6. Importação de Dados Externos
- Use a aba "Importar CSV" para importar respostas coletadas externamente
- Baixe templates específicos por formulário (F1, F2, F3)
- Templates incluem perguntas e opções de resposta para facilitar preenchimento
- Compatível com Microsoft Forms, Google Forms e outras ferramentas

### 7. Visualização e Export
- Acesse `/resumo` para revisar todas as respostas
- Baixe relatórios individuais ou consolidados
- Dados exportados em formato CSV

### 8. Gerenciamento de Entrevistas
- Acesse `/entrevistas` para ver todas as entrevistas
- Visualize detalhes de cada entrevista
- Filtre por status (completa/incompleta)
- Exporte entrevistas específicas

## 🔧 Configuração de Formulários

### Estrutura do JSON
```json
{
  "forms": [
    {
      "id": "f1",
      "title": "Título do Formulário",
      "questions": [
        {
          "id": "pergunta_id",
          "pergunta": "Texto da pergunta?",
          "tipo": "escala_1_5",
          "legenda": "Texto explicativo",
          "categoria": "Categoria (opcional)",
          "active": true
        }
      ]
    }
  ],
  "lookups": {
    "SISTEMAS_ESSENCIAIS": ["Sistema 1", "Sistema 2"],
    "FERRAMENTAS_PPM": ["Ferramenta 1", "Ferramenta 2"],
    "TIPOS_DADOS_SINCRONIZAR": ["Tipo 1", "Tipo 2"]
  }
}
```

### Estrutura dos Templates CSV
```csv
respondent_name,respondent_department,interviewer_name,timestamp,f1_q1,f1_q2...
"PERGUNTA →","Departamento/Área","Entrevistador","Data/Hora","Como você avalia...","Qual sua experiência..."
"OPÇÕES →","Ex: TI, Finanças, RH","Nome do entrevistador","AAAA-MM-DD HH:MM","1, 2, 3, 4, 5","< 1 Ano, 1-3 Anos..."

// EXEMPLO DE PREENCHIMENTO:
"João Silva","TI","Maria Santos","2025-01-09 15:30","4","1-3 Anos"

// SEUS DADOS AQUI (apague as linhas de exemplo acima):
```

### Campos da Pergunta
- **id**: Identificador único da pergunta
- **pergunta**: Texto da pergunta exibido ao usuário
- **tipo**: Tipo de pergunta (ver lista abaixo)
- **legenda**: Texto explicativo/instrução
- **categoria**: Categoria para agrupamento (opcional)
- **active**: Se a pergunta está ativa (opcional, padrão: true)

### Tipos de Pergunta Disponíveis
- `escala_1_5` / `escala_0_10`
- `multipla` / `selecionar_1`
- `texto`
- `sim/não` / `sim/não_(pergunta_filtro)`
- `sim/não/parcialmente_+_campo_para_especificar_quais`
- `lista_suspensa_(Opção1,_Opção2,_Opção3)`
- `lista_de_priorização_(arrastar_e_soltar_ou_ranking_1_3)`
- `lista_suspensa_baseada_na_resposta_anterior`

## 🔄 Fluxo de Trabalho para Múltiplos Analistas

### Cenário Típico:
1. **Analista Principal**: Configura sistema e adiciona perguntas customizadas
2. **Analista Principal**: Baixa JSON atualizado e compartilha com equipe
3. **Analistas Secundários**: Carregam JSON e realizam entrevistas
4. **Analistas Secundários**: Exportam consolidados por formulário
5. **Coordenação**: Importa consolidados e gera relatório final

### Vantagens:
- **Sincronização**: Todos os analistas com mesma configuração
- **Flexibilidade**: Trabalho independente de cada analista
- **Consolidação**: Dados unificados para análise final
- **Controle**: Rastreamento de origem dos dados
- **Backup**: Proteção contra perda de dados

## 🛠 Scripts Disponíveis

### Frontend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
```

### Backend
```bash
cd server
npm run dev          # Desenvolvimento com nodemon
npm run db:studio    # Abrir Prisma Studio
npm run db:generate  # Gerar cliente Prisma
npm run db:migrate   # Executar migrações
npm run db:init      # Inicializar banco
```

### Setup Automático
```bash
./setup-database.sh  # Configuração completa do banco
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação acima
2. Consulte os exemplos de configuração
3. Abra uma issue no repositório

## 🔗 URLs Importantes

- **Frontend**: http://localhost:8080 (ou 8081)
- **Backend API**: http://localhost:3001/api
- **Prisma Studio**: http://localhost:5555 (gerenciamento do banco)

---

**Desenvolvido com ❤️ para facilitar a avaliação de necessidades PPM em organizações**

**Desenvolvido por Aderilso Junior**

**Versão**: 2.1.0 - Sistema Completo com Operações Críticas e Autenticação
