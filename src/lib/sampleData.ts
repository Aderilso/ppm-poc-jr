import type { PpmConfig } from "./types";

// JSON de exemplo com perguntas reais para demonstração
export const SAMPLE_JSON: PpmConfig = {
  "forms": [
    {
      "id": "f1",
      "title": "Formulário 1 - Avaliação Inicial",
      "questions": [
        {
          "id": "q1_satisfacao_geral",
          "pergunta": "Como você avalia sua satisfação geral com as ferramentas de gestão de projetos atuais?",
          "tipo": "escala_1_5",
          "legenda": "1 = Muito insatisfeito, 5 = Muito satisfeito",
          "categoria": "Satisfação"
        },
        {
          "id": "q1_eficiencia",
          "pergunta": "Em uma escala de 0 a 10, qual sua percepção sobre a eficiência dos processos atuais?",
          "tipo": "escala_0_10",
          "legenda": "0 = Muito ineficiente, 10 = Muito eficiente"
        },
        {
          "id": "q1_sistemas_utilizados",
          "pergunta": "Quais sistemas essenciais você utiliza no seu trabalho?",
          "tipo": "multipla",
          "legenda": "Selecione todos os sistemas que se aplicam"
        },
        {
          "id": "q1_comentarios",
          "pergunta": "Descreva os principais desafios que você enfrenta com as ferramentas atuais:",
          "tipo": "texto",
          "legenda": "Seja específico sobre problemas, limitações ou frustrações"
        }
      ]
    },
    {
      "id": "f2", 
      "title": "Formulário 2 - Necessidades e Requisitos",
      "questions": [
        {
          "id": "q2_ferramenta_principal",
          "pergunta": "Qual ferramenta de PPM você considera mais importante para seu trabalho?",
          "tipo": "selecionar_1",
          "legenda": "Escolha a ferramenta que você mais utiliza"
        },
        {
          "id": "q2_funcionalidades_desejadas",
          "pergunta": "Quais funcionalidades você gostaria de ter nas ferramentas de gestão?",
          "tipo": "multipla",
          "legenda": "Selecione todas as funcionalidades que considera importantes"
        },
        {
          "id": "q2_facilidade_uso",
          "pergunta": "Como você avalia a facilidade de uso das ferramentas atuais?",
          "tipo": "escala_1_5",
          "legenda": "1 = Muito difícil, 5 = Muito fácil"
        }
      ]
    },
    {
      "id": "f3",
      "title": "Formulário 3 - Integração e Futuro",
      "questions": [
        {
          "id": "q3_integracao_importancia",
          "pergunta": "Qual a importância da integração entre sistemas para seu trabalho?",
          "tipo": "escala_0_10",
          "legenda": "0 = Não importante, 10 = Extremamente importante"
        },
        {
          "id": "q3_tipos_dados",
          "pergunta": "Que tipos de dados você gostaria de sincronizar entre sistemas?",
          "tipo": "multipla",
          "legenda": "Selecione todos os tipos de dados relevantes"
        },
        {
          "id": "q3_expectativas_futuro",
          "pergunta": "Quais são suas expectativas para melhorias futuras nas ferramentas?",
          "tipo": "texto",
          "legenda": "Descreva suas expectativas e sugestões para o futuro"
        }
      ]
    }
  ],
  "lookups": {
    "SISTEMAS_ESSENCIAIS": [
      "Microsoft Project",
      "Jira",
      "Confluence",
      "SharePoint",
      "Excel",
      "Power BI",
      "Primavera P6",
      "Smartsheet",
      "Monday.com",
      "Asana",
      "Trello",
      "Outro"
    ],
    "FERRAMENTAS_PPM": [
      "Microsoft Project",
      "Primavera P6",
      "Smartsheet",
      "Monday.com",
      "Asana",
      "Jira",
      "Azure DevOps",
      "Clarity PPM",
      "Planview",
      "Wrike",
      "Basecamp",
      "Outro"
    ],
    "TIPOS_DADOS_SINCRONIZAR": [
      "Cronogramas e Marcos",
      "Custos e Orçamentos",
      "Recursos e Alocações",
      "Status de Tarefas",
      "Documentos e Anexos",
      "Relatórios de Progresso",
      "Riscos e Issues",
      "Comunicações da Equipe",
      "Métricas de Performance",
      "Aprovações e Workflows"
    ]
  }
};