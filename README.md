# Sistema de Pesquisa PPM (Project Portfolio Management)

Uma aplicação web moderna para avaliação de necessidades organizacionais em ferramentas de gestão de portfólio de projetos.

## 📋 Sobre o Projeto

Este sistema permite que organizações avaliem suas necessidades de ferramentas PPM através de três questionários estruturados:

- **Formulário 1**: Avaliação Geral (maturidade PPM, satisfação com ferramentas atuais)
- **Formulário 2**: Análise de Funcionalidades (benchmarking, necessidades específicas)
- **Formulário 3**: Necessidades de Integração (sistemas, dados, conectividade)

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui (baseado em Radix UI)
- **Styling**: Tailwind CSS com tema customizado
- **Formulários**: React Hook Form + Zod para validação
- **Roteamento**: React Router DOM
- **Estado**: localStorage para persistência local
- **Ícones**: Lucide React

## ✨ Funcionalidades Principais

### 🔧 Sistema de Configuração Dinâmica
- Formulários totalmente configuráveis via JSON
- Validação robusta com Zod schema
- Upload/download de configurações
- Dados de exemplo incluídos
- Interface de configuração intuitiva

### 📝 Tipos de Perguntas Suportados
- **Escalas Likert**: 1-5 e 0-10
- **Múltipla escolha**: Com chips visuais
- **Seleção única**: Dropdowns e listas
- **Texto livre**: Áreas de texto expansíveis
- **Sim/Não/Parcialmente**: Com campos condicionais
- **Listas suspensas dinâmicas**: Baseadas em respostas anteriores
- **Priorização por ranking**: Arrastar e soltar

### 💾 Sistema de Persistência Inteligente
- Salvamento automático no localStorage
- Modo rascunho com banner de aviso
- Recuperação de dados entre sessões
- Limpeza seletiva de dados

### 👥 Funcionalidades de Entrevista
- Modo entrevistador com campos específicos
- Metadados do respondente
- Campos condicionais baseados no contexto

### 📊 Exportação e Relatórios
- Download individual por formulário (CSV)
- Relatório consolidado
- Nomes de arquivo com timestamp
- Visualização completa das respostas

### 🎨 Interface e UX
- Design responsivo e moderno
- Indicadores de progresso
- Tooltips informativos para cada pergunta
- Navegação intuitiva entre formulários
- Tema visual consistente

## 🛠 Melhorias Implementadas

### ✅ Normalização de Dados
- **Capitalização consistente**: Todas as opções com primeira letra maiúscula
- **Padronização de siglas**: "TI" e "RH" em maiúsculas
- **Nomenclatura clara**: "GP" substituído por "Gerente de Projeto"

### ✅ Correções de Interface
- **Tooltips funcionais**: Ícones "?" exibem legendas das perguntas
- **Parsing correto**: Opções de listas suspensas com capitalização adequada
- **Dados de exemplo atualizados**: Consistência entre schema e dados de exemplo

### ✅ Validação Robusta
- **Schema sincronizado**: Tipos de pergunta alinhados entre JSON e validação
- **Tratamento de erros**: Mensagens claras de validação
- **Fallbacks inteligentes**: Sistema funciona mesmo sem configuração

## 🏗 Arquitetura

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── questions/      # Componentes específicos de perguntas
│   ├── Layout.tsx      # Template principal
│   ├── Question.tsx    # Renderizador universal de perguntas
│   └── HelpTooltip.tsx # Tooltips de ajuda
├── pages/              # Páginas da aplicação
│   ├── Home.tsx        # Página inicial
│   ├── Config.tsx      # Configuração de formulários
│   ├── FormPage.tsx    # Template para F1/F2/F3
│   └── Resumo.tsx      # Visualização e download
├── lib/                # Utilitários e tipos
│   ├── types.ts        # Definições TypeScript
│   ├── schema.ts       # Validação Zod
│   ├── storage.ts      # Persistência localStorage
│   ├── sampleData.ts   # Dados de exemplo
│   └── csv.ts          # Geração de relatórios
└── hooks/              # Hooks customizados
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>

# Entre no diretório
cd ppm-pesquisa

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
- Use "Carregar Exemplo" para dados pré-configurados
- Ou faça upload de um arquivo JSON personalizado

### 2. Preenchimento dos Formulários
- Navegue pelos formulários F1, F2 e F3
- O progresso é salvo automaticamente
- Use os tooltips (?) para entender cada pergunta

### 3. Visualização e Export
- Acesse `/resumo` para revisar todas as respostas
- Baixe relatórios individuais ou consolidados
- Dados exportados em formato CSV

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
          "categoria": "Categoria (opcional)"
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

### Tipos de Pergunta Disponíveis
- `escala_1_5` / `escala_0_10`
- `multipla` / `selecionar_1`
- `texto`
- `sim/não` / `sim/não_(pergunta_filtro)`
- `sim/não/parcialmente_+_campo_para_especificar_quais`
- `lista_suspensa_(Opção1,_Opção2,_Opção3)`
- `lista_de_priorização_(arrastar_e_soltar_ou_ranking_1_3)`
- `lista_suspensa_baseada_na_resposta_anterior`

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

---

**Desenvolvido com ❤️ para facilitar a avaliação de necessidades PPM em organizações**
