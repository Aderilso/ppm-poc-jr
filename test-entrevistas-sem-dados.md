# 🧪 TESTE: Entrevistas Aparecendo Sem Dados

## 📋 **PROBLEMA IDENTIFICADO**
- Todas as entrevistas na lista mostram "Não informado" para Respondente e Departamento
- Metadados não estão sendo salvos ou carregados corretamente

## 🔍 **INVESTIGAÇÃO PASSO A PASSO**

### **PASSO 1: Verificar Logs do Backend**
1. **Abrir terminal do servidor** (onde está rodando `npm run dev`)
2. **Fazer uma nova entrevista** preenchendo metadados
3. **Verificar logs esperados:**

```
📝 POST /api/interviews - Dados recebidos: {
  isInterviewer: true,
  interviewerName: "João Silva",
  respondentName: "Maria Santos",
  respondentDepartment: "TI"
}
🔍 Dados extraídos: { isInterviewer: true, interviewerName: "João Silva", ... }
✅ Entrevista criada com sucesso: cmf2s3pd...
🎯 Entrevista X salva no banco de dados - Metadados salvos no banco de dados!
📊 Detalhes da entrevista criada: {
  id: "cmf2s3pd...",
  isInterviewer: true,
  interviewerName: "João Silva",
  respondentName: "Maria Santos",
  respondentDepartment: "TI",
  createdAt: "2025-09-02T..."
}
```

### **PASSO 2: Verificar Logs do Frontend**
1. **Abrir console do navegador** (F12 → Console)
2. **Ir para "Gerenciar Entrevistas"**
3. **Verificar logs esperados:**

```
🔍 Entrevistas - Dados recebidos: {
  totalInterviews: 5,
  interviews: [
    {
      id: "cmf2s3pd...",
      isInterviewer: true,
      interviewerName: "João Silva",
      respondentName: "Maria Santos",
      respondentDepartment: "TI",
      isCompleted: false,
      createdAt: "2025-09-02T..."
    },
    // ... outras entrevistas
  ]
}
```

### **PASSO 3: Verificar Logs de Busca no Backend**
1. **Recarregar página de entrevistas**
2. **Verificar logs no terminal do servidor:**

```
🔍 GET /api/interviews - Buscando todas as entrevistas...
📊 Total de entrevistas encontradas: 5
📋 Entrevista 1: {
  id: "cmf2s3pd...",
  isInterviewer: true,
  interviewerName: "João Silva",
  respondentName: "Maria Santos",
  respondentDepartment: "TI",
  createdAt: "2025-09-02T...",
  isCompleted: false
}
// ... outras entrevistas
✅ Entrevistas retornadas com sucesso
```

## ❌ **PROBLEMAS POSSÍVEIS**

### **1. Dados não sendo salvos no banco:**
- Logs de criação não aparecem
- Entrevista criada mas metadados vazios

### **2. Dados sendo salvos mas não retornados:**
- Logs de criação aparecem com dados corretos
- Mas logs de busca mostram dados vazios

### **3. Problema de cache no frontend:**
- Backend retorna dados corretos
- Frontend não atualiza ou usa cache antigo

### **4. Problema de mapeamento de campos:**
- Dados no banco mas nomes de campos incorretos
- Mismatch entre backend e frontend

## ✅ **SOLUÇÕES ESPERADAS**

### **Se problema for salvamento:**
- Verificar se `updateMeta` está sendo chamado
- Verificar se dados chegam corretos no backend
- Verificar se Prisma está salvando corretamente

### **Se problema for carregamento:**
- Verificar se dados estão no banco
- Verificar se API está retornando dados
- Verificar se cache está sendo invalidado

### **Se problema for frontend:**
- Verificar se dados chegam corretos
- Verificar se componente está renderizando
- Verificar se React Query está funcionando

## 🚀 **PRÓXIMOS PASSOS**

1. **Executar teste** com logs detalhados
2. **Identificar em qual etapa** os dados se perdem
3. **Implementar correção** específica
4. **Validar solução** com novo teste

## 📊 **RESULTADO ESPERADO**

Após correção:
- ✅ Entrevistas criadas com metadados completos
- ✅ Lista mostrando dados reais (não "Não informado")
- ✅ Metadados preservados ao navegar entre formulários
- ✅ Sistema funcionando corretamente
