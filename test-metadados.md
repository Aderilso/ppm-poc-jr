# 🧪 TESTE DE METADADOS - VALIDAÇÃO PONTA A PONTA

## 📋 **OBJETIVO DO TESTE**
Validar se os metadados estão sendo salvos e carregados corretamente entre formulários.

## 🎯 **CENÁRIOS DE TESTE**

### **CENÁRIO 1: Preenchimento F1 → Navegação F2**
1. **Preencher F1:**
   - ✅ Marcar "Preencher como ENTREVISTADOR"
   - ✅ Preencher "Nome do Entrevistador": "João Silva"
   - ✅ Preencher "Nome do Respondente": "Maria Santos"
   - ✅ Preencher "Departamento": "TI"

2. **Verificar logs no console:**
   - `📝 FormPage - Metadados alterados em f1: {...}`
   - `💾 useInterview - Salvando metadados da entrevista {id} no banco...`
   - `✅ useInterview - Metadados atualizados com sucesso`
   - `🎯 useInterview - Entrevista {id} - Metadados salvos no banco de dados!`

3. **Verificar logs no backend:**
   - `📝 PUT /api/interviews/:id - Atualizando entrevista: {id}`
   - `📝 Dados recebidos: { isInterviewer: true, interviewerName: "João Silva", ... }`
   - `✅ Entrevista atualizada com sucesso: {...}`

4. **Navegar para F2:**
   - ✅ Campos do entrevistador devem estar preenchidos
   - ✅ Log: `🔄 FormPage - Carregando metadados do banco para f2: {...}`

### **CENÁRIO 2: Verificação na Lista de Entrevistas**
1. **Ir para "Gerenciar Entrevistas"**
2. **Verificar se a entrevista aparece com:**
   - ✅ Respondente: "Maria Santos" (não "Não informado")
   - ✅ Departamento: "TI" (não "Não informado")

### **CENÁRIO 3: Navegação F2 → F3**
1. **Preencher algumas perguntas do F2**
2. **Navegar para F3**
3. **Verificar se campos do entrevistador continuam preenchidos**

## 🔍 **LOGS ESPERADOS**

### **Frontend (Console):**
```
🔍 FormPage - Debug metadados: {
  formId: "f1",
  bankMeta: { is_interviewer: true, interviewer_name: "João Silva", ... },
  f1Answers: {...},
  isCompleted: false
}
🔄 FormPage - Carregando metadados do banco para f1: {...}
📝 FormPage - Metadados alterados em f1: {...}
💾 useInterview - Salvando metadados da entrevista cmf1uanq... no banco...
✅ useInterview - Metadados atualizados com sucesso
🎯 useInterview - Entrevista cmf1uanq... - Metadados salvos no banco de dados!
```

### **Backend (Terminal):**
```
📝 PUT /api/interviews/:id - Atualizando entrevista: cmf1uanq...
📝 Dados recebidos: {
  isInterviewer: true,
  interviewerName: "João Silva",
  respondentName: "Maria Santos",
  respondentDepartment: "TI"
}
✅ Entrevista atualizada com sucesso: {...}
```

## ❌ **PROBLEMAS ESPERADOS (ANTES DA CORREÇÃO)**

1. **Metadados não aparecem no F2** → Lógica incorreta de carregamento
2. **Lista mostra "Não informado"** → Cache não atualizado ou dados não salvos
3. **Campos limpos ao navegar** → Estado local não preservado

## ✅ **RESULTADOS ESPERADOS (APÓS CORREÇÃO)**

1. **Metadados carregados automaticamente** do banco ao navegar
2. **Lista atualizada** com dados reais
3. **Campos preservados** durante navegação
4. **Logs mostrando** carregamento correto dos metadados

## 🚀 **PRÓXIMOS PASSOS**

1. **Executar teste** com logs atuais
2. **Identificar problema específico** nos logs
3. **Corrigir lógica** se necessário
4. **Validar correção** com novo teste
5. **Prosseguir para Módulo 2** (Botão Finalizar)
