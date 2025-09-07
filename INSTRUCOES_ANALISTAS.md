# 📋 Instruções para Analistas - Sistema PPM

## 🚀 Primeira Configuração

### 📁 Arquivos Incluídos no Projeto
- ✅ **`ppm_forms_consolidado_v2_normalizado.json`** - Configuração padrão com todas as perguntas
- ✅ **`setup-completo.sh`** - Script de configuração automática completa (macOS/Linux)
- ✅ **`setup-completo.bat`** - Script de configuração automática completa (Windows)
- ✅ **`setup-database.sh`** - Script de configuração do banco (macOS/Linux)
- ✅ **`setup-database.bat`** - Script de configuração do banco (Windows)
- ✅ **`diagnostico.sh`** - Diagnóstico automático (macOS/Linux)
- ✅ **`diagnostico.bat`** - Diagnóstico automático (Windows)
- ✅ **`diagnostico-dashboard.sh`** - Diagnóstico específico do Dashboard (macOS/Linux)
- ✅ **`diagnostico-dashboard.bat`** - Diagnóstico específico do Dashboard (Windows)
- ✅ **`reiniciar-sistema.sh`** - Reinicialização automática (macOS/Linux)
- ✅ **`reiniciar-sistema.bat`** - Reinicialização automática (Windows)
- ✅ **`README.md`** - Documentação completa do sistema
- ✅ **`CHANGELOG.md`** - Histórico de mudanças
- ✅ **`TROUBLESHOOTING.md`** - Guia de solução de problemas

## 🎯 Visão Geral

Este sistema permite que múltiplos analistas trabalhem de forma independente e depois consolidem seus dados.

### Para Analistas Secundários:

#### 1. Configuração Inicial
- **Clone o repositório** - o arquivo JSON já estará disponível
- **Execute o script de configuração completa**:
  - **Windows**: `setup-completo.bat`
  - **macOS/Linux**: `./setup-completo.sh`
- **O script fará TUDO automaticamente**:
  - Instalar dependências
  - Configurar banco de dados
  - Iniciar backend e frontend
  - Verificar funcionamento

#### 2. Carregar Configuração
1. Acesse: http://localhost:8080/config
2. Clique em "Carregar Configuração"
3. Escolha "Usar JSON Padrão" (carrega automaticamente o arquivo incluído no projeto)
4. Aguarde a confirmação: "Configuração aplicada automaticamente"
5. **OU** se receber atualizações: Escolha "Anexar JSON" e selecione o arquivo atualizado

#### 3. Realizar Entrevistas
1. Acesse: http://localhost:8080/
2. Clique em "Iniciar Preenchimento"
3. Preencha os dados do entrevistado
4. Responda as perguntas do formulário
5. Salve a entrevista

#### 4. Exportar Dados
1. Acesse: http://localhost:8080/resumo
2. Na seção "Downloads Individuais"
3. Clique em "Relatório Consolidado" para cada formulário
4. Salve os arquivos CSV

### Para Coordenação Final:

#### 1. Configuração Inicial
- **Clone o repositório** - o arquivo JSON já estará disponível
- **Execute o script de configuração completa**:
  - **Windows**: `setup-completo.bat`
  - **macOS/Linux**: `./setup-completo.sh`
- **Carregue a configuração** usando "Usar JSON Padrão"
- **Se houver atualizações**, receba o arquivo atualizado do analista principal

#### 2. Receber Consolidados
- **Receba os arquivos CSV** de todos os analistas
- **Organize por analista** para controle

#### 3. Importar Dados
1. Acesse: http://localhost:8080/resumo
2. Na seção "Importar CSV"
3. Selecione "Importação Consolidada"
4. Escolha o formulário (F1, F2 ou F3)
5. Faça upload do arquivo consolidado
6. Repita para cada formulário e analista

#### 4. Gerar Relatório Final
1. Na seção "Downloads Individuais"
2. Clique em "Relatório Consolidado"
3. Baixe o relatório final com todos os dados

## 🛠️ Comandos Úteis

### 🔧 Diagnóstico e Configuração
- **Windows**: `diagnostico.bat` - Verificar status do sistema
- **macOS/Linux**: `./diagnostico.sh` - Verificar status do sistema
- **Windows**: `diagnostico-dashboard.bat` - Diagnóstico específico do Dashboard
- **macOS/Linux**: `./diagnostico-dashboard.sh` - Diagnóstico específico do Dashboard
- **Windows**: `setup-completo.bat` - Configuração completa automática
- **macOS/Linux**: `./setup-completo.sh` - Configuração completa automática

### 🔄 Reinicialização
- **Windows**: `reiniciar-sistema.bat` - Reiniciar tudo automaticamente
- **macOS/Linux**: `./reiniciar-sistema.sh` - Reiniciar tudo automaticamente

### 📊 Monitoramento
- **Configuração**: http://localhost:8080/config
- **Dashboard**: http://localhost:8080/dashboard
- **Entrevistas**: http://localhost:8080/entrevistas
- **Resumo**: http://localhost:8080/resumo

## 🚨 Problemas Comuns

### Erro "Failed to fetch"
**Solução**: 
- **Windows**: Execute `diagnostico.bat` para diagnóstico rápido
- **macOS/Linux**: Execute `./diagnostico.sh` para diagnóstico rápido
- **Ambos**: Consulte `TROUBLESHOOTING.md` para soluções detalhadas

### Dashboard não mostra dados
**Solução**:
- **Windows**: Execute `diagnostico-dashboard.bat` para diagnóstico específico
- **macOS/Linux**: Execute `./diagnostico-dashboard.sh` para diagnóstico específico
- **Verifique**: Se há entrevistas criadas no sistema
- **Teste**: Acesse http://localhost:8080/entrevistas para ver se há dados

### Sistema não inicia
**Solução**:
- **Windows**: Execute `setup-completo.bat` para configuração completa
- **macOS/Linux**: Execute `./setup-completo.sh` para configuração completa

### Flash de erro ao carregar
**Solução**: Normal, aguarde o carregamento completo

## 📞 Suporte

### Logs de Erro
- **Frontend**: Console do navegador (F12)
- **Backend**: Terminal onde está rodando o servidor
- **Logs**: `backend.log` e `frontend.log` (macOS/Linux)

### Diagnóstico Rápido
- **Windows**: Execute `diagnostico.bat` para verificar status completo
- **macOS/Linux**: Execute `./diagnostico.sh` para verificar status completo
- **Dashboard específico**: Execute `diagnostico-dashboard.bat` (Windows) ou `./diagnostico-dashboard.sh` (macOS/Linux)
- **Consulte**: `TROUBLESHOOTING.md` para soluções detalhadas

### Contatos
- **Desenvolvedor**: Aderilso Junior
- **Documentação**: README.md e INSTRUCOES_ANALISTAS.md

## ✅ Checklist

### ✅ Configuração Inicial
- [ ] Sistema instalado e funcionando
- [ ] Banco de dados configurado
- [ ] Configuração JSON carregada (usando "Usar JSON Padrão")
- [ ] Teste de navegação realizado
- [ ] Dashboard funcionando com dados

### ✅ Durante o Trabalho
- [ ] Entrevistas sendo salvas corretamente
- [ ] Dados sendo exportados em CSV
- [ ] Backup dos dados realizado
- [ ] Comunicação com coordenação mantida

### ✅ Finalização
- [ ] Todas as entrevistas exportadas
- [ ] Arquivos CSV enviados para coordenação
- [ ] Sistema desligado adequadamente
- [ ] Logs de erro verificados

## 🔄 Sincronização

### Importante:
- **O arquivo JSON está incluído** no projeto: `ppm_forms_consolidado_v2_normalizado.json`
- **NÃO modifique** a configuração padrão
- **NÃO adicione** perguntas personalizadas
- **Use apenas** as perguntas fornecidas
- **Mantenha** a estrutura original

### 🗑️ Operações Críticas
- **Apagar Banco de Dados**: Remove TODAS as entrevistas e análises
- **Senha**: !@#ad!@# (apenas para testes)
- **Confirmação**: Modal de autenticação obrigatório
- **Log**: Todas as operações são registradas no console
- **⚠️ ATENÇÃO**: Operação irreversível!

## 🚀 Configuração Rápida

### Para Windows:
```cmd
REM Opção 1: Um clique (recomendado)
REM Baixe e execute: bootstrap-analistas.bat
REM (ou clique com o direito em bootstrap-analistas.ps1 > Run with PowerShell)

REM Opção 2: Manual
git clone https://github.com/Aderilso/ppm-poc-jr.git
cd ppm-poc-jr
setup-completo.bat  
REM ou: start-all.bat (se dependências já instaladas)
```

### Para macOS/Linux:
```bash
git clone [URL_DO_REPOSITORIO]
cd ppm-poc-jr
chmod +x setup-completo.sh
./setup-completo.sh
```

**Resultado**: Sistema completamente configurado e funcionando em http://localhost:8080

## 🔍 Diagnóstico do Dashboard

### Se o Dashboard não mostrar dados:

1. **Execute o diagnóstico específico**:
   - **Windows**: `diagnostico-dashboard.bat`
   - **macOS/Linux**: `./diagnostico-dashboard.sh`

2. **Verifique se há entrevistas**:
   - Acesse: http://localhost:8080/entrevistas
   - Se não houver entrevistas, crie algumas primeiro

3. **Teste a API diretamente**:
   - Abra: http://localhost:3001/api/interviews
   - Deve retornar um JSON com as entrevistas

4. **Limpe o cache do navegador**:
   - Pressione Ctrl+F5 no Dashboard
   - Ou abra em uma aba anônima

5. **Verifique o console do navegador**:
   - Pressione F12
   - Vá na aba "Console"
   - Procure por erros em vermelho
