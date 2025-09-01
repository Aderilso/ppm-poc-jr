# 📋 Instruções para Analistas - Sistema PPM

## 🎯 Visão Geral

Este documento contém instruções específicas para analistas que vão usar o sistema de pesquisa PPM. O sistema permite trabalho colaborativo entre múltiplos analistas com sincronização de dados.

## 🚀 Primeira Configuração

### 📁 Arquivos Incluídos no Projeto
- ✅ **`ppm_forms_consolidado_v2_normalizado.json`** - Configuração padrão com todas as perguntas
- ✅ **`setup-database.sh`** - Script de configuração automática do banco
- ✅ **`README.md`** - Documentação completa do sistema
- ✅ **`CHANGELOG.md`** - Histórico de mudanças

### 1. Instalação do Sistema

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd ppm-poc-jr

# Instale as dependências
npm install

# Configure o banco de dados (IMPORTANTE!)
./setup-database.sh

# Inicie o servidor backend
cd server && npm run dev

# Em outro terminal, inicie o frontend
npm run dev
```

### 2. URLs Importantes
- **Sistema**: http://localhost:8080 (ou 8081)
- **API Backend**: http://localhost:3001/api
- **Prisma Studio**: http://localhost:5555 (gerenciamento do banco)

## 📋 Fluxo de Trabalho

### Para Analistas Secundários:

#### 1. Configuração Inicial
- **O arquivo JSON já está incluído** no projeto: `ppm_forms_consolidado_v2_normalizado.json`
- **Após o clone**, você terá acesso imediato ao arquivo de configuração
- **Se houver atualizações**, o analista principal compartilhará um novo arquivo

#### 2. Carregar Configuração
1. Acesse: http://localhost:8080/config
2. Clique em "Carregar Configuração"
3. Escolha "Usar JSON Padrão" (carrega automaticamente o arquivo incluído no projeto)
4. Aguarde a confirmação: "Configuração aplicada automaticamente"
5. **OU** se receber atualizações: Escolha "Anexar JSON" e selecione o arquivo atualizado

#### 3. Realizar Entrevistas
1. Vá para a página inicial: http://localhost:8080
2. Clique em "Iniciar Pesquisa"
3. Preencha os formulários F1, F2 e F3
4. Os dados são salvos automaticamente

#### 4. Exportar Dados Consolidados
1. Acesse: http://localhost:8080/resumo
2. Na seção "Consolidados por Formulário"
3. Clique em "Consolidado F1", "Consolidado F2", "Consolidado F3"
4. Salve os arquivos CSV gerados

#### 5. Enviar para Coordenação
- **Envie os 3 arquivos CSV** para o coordenador:
  - `consolidado-f1-YYYY-MM-DD-HHMM.csv`
  - `consolidado-f2-YYYY-MM-DD-HHMM.csv`
  - `consolidado-f3-YYYY-MM-DD-HHMM.csv`

### Para Coordenação Final:

#### 1. Configuração Inicial
- **Clone o repositório** - o arquivo JSON já estará disponível
- **Carregue a configuração** usando "Usar JSON Padrão"
- **Se houver atualizações**, receba o arquivo atualizado do analista principal

#### 2. Receber Consolidados
- **Receba os arquivos CSV** de todos os analistas
- **Organize por analista** para controle

#### 3. Importar Dados
1. Acesse: http://localhost:8080/resumo
2. Na seção "Importar CSV"
3. Selecione "Importação Consolidada"
4. Escolha o formulário correspondente (F1, F2 ou F3)
5. Faça upload do arquivo consolidado
6. Repita para cada formulário e analista

#### 4. Gerar Relatório Final
1. Na seção "Downloads Individuais"
2. Clique em "Relatório Consolidado"
3. Baixe o relatório final com todos os dados

## 🔧 Funcionalidades Importantes

### 📊 Gerenciamento de Entrevistas
- **Acesse**: http://localhost:8080/entrevistas
- **Visualize**: Todas as entrevistas realizadas
- **Filtre**: Por status (completa/incompleta)
- **Detalhes**: Clique em uma entrevista para ver respostas

### ⚙️ Configurações
- **Acesse**: http://localhost:8080/config
- **Visualize**: Configuração atual
- **Limpe**: Use "Limpar Configuração" se necessário
- **Baixe**: Use "Baixar JSON Atualizado" para compartilhar
- **🗑️ Apagar Banco**: Use "Apagar Banco de Dados" (requer senha: !@#ad!@#)

### 📈 Dashboard
- **Acesse**: http://localhost:8080/dashboard
- **Visualize**: Métricas em tempo real
- **Monitore**: Progresso das entrevistas

### 🗑️ Operações Críticas
- **Apagar Banco de Dados**: Remove TODAS as entrevistas e análises
- **Senha**: !@#ad!@# (apenas para testes)
- **Confirmação**: Modal de autenticação obrigatório
- **Log**: Todas as operações são registradas no console
- **⚠️ ATENÇÃO**: Operação irreversível!

## 🚨 Problemas Comuns

### Erro: "Formulário não encontrado"
**Solução**: Carregue a configuração primeiro em `/config`

### Erro: "Nenhuma configuração carregada"
**Solução**: Use "Carregar Configuração" e selecione o JSON recebido

### Sistema não carrega
**Solução**: Verifique se o backend está rodando em `http://localhost:3001`

### Banco de dados não funciona
**Solução**: Execute `./setup-database.sh` novamente

### Flash de erro ao carregar
**Solução**: Normal, aguarde o carregamento completo

## 📞 Suporte

### Logs de Erro
- **Frontend**: Console do navegador (F12)
- **Backend**: Terminal onde está rodando o servidor

### Contatos
- **Desenvolvedor**: Aderilso Junior
- **Repositório**: [URL_DO_REPOSITORIO]

## 📝 Checklist do Analista

### ✅ Configuração Inicial
- [ ] Sistema instalado e funcionando
- [ ] Banco de dados configurado
- [ ] Configuração JSON carregada (usando "Usar JSON Padrão")
- [ ] Teste de navegação realizado

### ✅ Durante o Trabalho
- [ ] Entrevistas sendo salvas automaticamente
- [ ] Progresso visível no dashboard
- [ ] Dados aparecendo em `/entrevistas`

### ✅ Finalização
- [ ] Todos os formulários preenchidos
- [ ] Consolidados exportados (F1, F2, F3)
- [ ] Arquivos enviados para coordenação
- [ ] Backup local realizado (opcional)

## 🔄 Sincronização

### Importante:
- **O arquivo JSON está incluído** no projeto: `ppm_forms_consolidado_v2_normalizado.json`
- **NÃO modifique** a configuração padrão
- **NÃO adicione** perguntas personalizadas
- **Use apenas** as perguntas fornecidas
- **Mantenha** a estrutura original

### Se precisar de mudanças:
1. **Contate** o analista principal
2. **Aguarde** nova configuração
3. **Recarregue** o sistema com nova configuração

---

**Última atualização**: Janeiro 2025
**Versão do Sistema**: 2.0
**Desenvolvido por**: Aderilso Junior
