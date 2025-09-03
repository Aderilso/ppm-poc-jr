# 🧪 TESTE: Verificação Individual de Campos dos Formulários

## 📋 **OBJETIVO**
Verificar se cada campo dos formulários F1, F2 e F3 está sendo salvo corretamente no banco de dados.

## 🔍 **FORMULÁRIO 1 (F1) - Avaliação Geral**

### **Campos de Metadados (CRÍTICOS):**
- [ ] `isInterviewer` (boolean)
- [ ] `interviewerName` (string)
- [ ] `respondentName` (string) 
- [ ] `respondentDepartment` (string)

### **Campos de Respostas (F1):**
- [ ] `f1_q01` - Departamento/área de atuação (lista_suspensa)
- [ ] `f1_q02` - Função/cargo principal (lista_suspensa)
- [ ] `f1_q03` - Tempo de uso (lista_suspensa)
- [ ] `f1_q04` - Ferramentas utilizadas (multipla)
- [ ] `f1_q05` - Frequência de uso (lista_suspensa)
- [ ] `f1_q06` - Uso diário (sim/não)
- [ ] `f1_q07` - Ferramenta mais crítica (lista_suspensa)
- [ ] `f1_q08` - Facilidade de uso (escala_1_5)
- [ ] `f1_q09` - Tempo para encontrar info (escala_1_5)
- [ ] `f1_q10` - Interface clara (escala_1_5)
- [ ] `f1_q11` - Impacto na produtividade (escala_1_5)
- [ ] `f1_q12` - Acompanhar progresso (escala_1_5)
- [ ] `f1_q13` - Tomada de decisões (escala_1_5)
- [ ] `f1_q14` - Nota geral (escala_0_10)
- [ ] `f1_q15` - Recomendaria (sim/não)

## 🔍 **FORMULÁRIO 2 (F2) - Análise de Funcionalidades**

### **Campos de Respostas (F2):**
- [ ] `f2_q01` - Funcionalidades de planejamento (escala_1_5)
- [ ] `f2_q02` - Gestão de recursos (escala_1_5)
- [ ] `f2_q03` - Controle orçamentário (escala_1_5)
- [ ] `f2_q04` - Gestão de riscos (escala_1_5)
- [ ] `f2_q05` - Visão de múltiplos projetos (escala_1_5)
- [ ] `f2_q06` - Priorização estratégica (escala_1_5)
- [ ] `f2_q07` - Análise de dependências (escala_1_5)
- [ ] `f2_q08` - Fluxos de aprovação (escala_1_5)
- [ ] `f2_q09` - Comunicação entre equipes (escala_1_5)
- [ ] `f2_q10` - Notificações automáticas (escala_1_5)
- [ ] `f2_q11` - Painéis/dashboards (escala_1_5)
- [ ] `f2_q12` - Relatórios gerenciais (escala_1_5)
- [ ] `f2_q13` - KPIs e métricas (escala_1_5)
- [ ] `f2_q14` - Funcionalidades ausentes (texto)

## 🔍 **FORMULÁRIO 3 (F3) - Necessidades de Integração**

### **Campos de Respostas (F3):**
- [ ] `f3_q01` - Sistemas essenciais (multipla)
- [ ] `f3_q02` - Frequência de acesso a diferentes sistemas (escala_1_5)
- [ ] `f3_q03` - Sistemas para integração (multipla)
- [ ] `f3_q04` - Sistemas já integrados (sim/não/parcialmente)
- [ ] `f3_q05` - Como dados transitam (lista_suspensa)
- [ ] `f3_q06` - Horas transferindo dados (escala_1_5)
- [ ] `f3_q07` - Integrações críticas (lista_de_priorização)
- [ ] `f3_q08` - Tipos de dados para sincronizar (multipla)
- [ ] `f3_q09` - Processo para automatizar (texto)
- [ ] `f3_q10` - Retrabalho por falta de integração (escala_1_5)
- [ ] `f3_q11` - Dados inconsistentes (escala_1_5)
- [ ] `f3_q12` - Melhor integração melhora decisões (escala_1_5)
- [ ] `f3_q13` - Integração com maior benefício (lista_suspensa)

## 🧪 **PLANO DE TESTE**

### **PASSO 1: Testar Metadados**
1. **Criar nova entrevista** preenchendo:
   - [ ] Caixa "Entrevistador" marcada
   - [ ] Nome do entrevistador: "João Silva"
   - [ ] Nome do respondente: "Maria Santos"
   - [ ] Departamento: "TI"
2. **Verificar logs no terminal** para confirmar salvamento
3. **Verificar banco de dados** para confirmar persistência

### **PASSO 2: Testar F1 (Campo por Campo)**
1. **Preencher cada campo individualmente** do F1
2. **Salvar após cada campo** para verificar persistência
3. **Verificar logs** de `PUT /api/interviews/:id/answers`
4. **Verificar banco** se `f1Answers` está sendo salvo

### **PASSO 3: Testar F2 (Campo por Campo)**
1. **Preencher cada campo individualmente** do F2
2. **Salvar após cada campo** para verificar persistência
3. **Verificar logs** de `PUT /api/interviews/:id/answers`
4. **Verificar banco** se `f2Answers` está sendo salvo

### **PASSO 4: Testar F3 (Campo por Campo)**
1. **Preencher cada campo individualmente** do F3
2. **Salvar após cada campo** para verificar persistência
3. **Verificar logs** de `PUT /api/interviews/:id/answers`
4. **Verificar banco** se `f3Answers` está sendo salvo

## 📊 **LOGS ESPERADOS**

### **Criação de Entrevista:**
```
📝 POST /api/interviews - Dados recebidos: { 
  isInterviewer: true, 
  interviewerName: "João Silva", 
  respondentName: "Maria Santos", 
  respondentDepartment: "TI" 
}
💾 Dados que serão salvos no banco: { ... }
✅ Entrevista criada com sucesso: cmf2s3pd...
🔍 Verificação pós-criação - Dados no banco: { ... }
```

### **Salvamento de Respostas:**
```
📝 PUT /api/interviews/:id/answers - Salvando f1 na entrevista cmf2s3pd...
📊 Dados recebidos: { formId: "f1", answersCount: 15 }
✅ f1 salvo com sucesso na entrevista cmf2s3pd...
📊 Total de respostas em f1: 15
```

## 🎯 **PROBLEMAS ESPERADOS**

1. **Metadados não salvos** → `interviewerName`, `respondentName`, `respondentDepartment` = NULL
2. **Respostas não salvas** → `f1Answers`, `f2Answers`, `f3Answers` = NULL
3. **Campos específicos não salvos** → Alguns campos dentro das respostas = undefined
4. **Problema de serialização** → JSON.stringify falhando

## 🚀 **PRÓXIMOS PASSOS**

1. **🧪 EXECUTAR TESTE** campo por campo
2. **🔍 IDENTIFICAR** campos que não estão sendo salvos
3. **🔧 IMPLEMENTAR** correção específica
4. **✅ VALIDAR** solução

## 📋 **RESULTADO ESPERADO**

Após correção:
- ✅ **Metadados salvos** corretamente no banco
- ✅ **Todos os campos** dos formulários sendo salvos
- ✅ **Dados persistindo** entre sessões
- ✅ **Sistema funcionando** completamente
