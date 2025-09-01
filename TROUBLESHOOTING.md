# 🔧 Guia de Solução de Problemas - Sistema PPM

## 🚨 Erro: "Failed to fetch" / "Erro ao carregar entrevista"

### 📋 Diagnóstico Rápido

#### 1. Verificar se o Backend está rodando
```bash
# No terminal, navegue para a pasta do servidor
cd server

# Verificar se o servidor está rodando
npm run dev
```

**Resultado esperado:**
```
🚀 Servidor rodando na porta 3001
📊 API disponível em http://localhost:3001/api
🔍 Prisma Studio em http://localhost:5555
```

#### 2. Verificar se o Frontend está rodando
```bash
# Em outro terminal, na pasta raiz do projeto
npm run dev
```

**Resultado esperado:**
```
VITE v5.4.19  ready in XXX ms
➜  Local:   http://localhost:8080/
➜  Network: http://192.168.x.x:8080/
```

#### 3. Testar a API diretamente
```bash
# Testar se a API responde
curl http://localhost:3001/api/health
```

**Resultado esperado:**
```json
{"status":"ok","timestamp":"2025-01-09T..."}
```

### 🔧 Soluções por Problema

#### ❌ Problema 1: Backend não inicia

**Sintomas:**
- Erro ao executar `npm run dev` no servidor
- Porta 3001 não está em uso

**Soluções:**

1. **Instalar dependências:**
```bash
cd server
npm install
```

2. **Configurar banco de dados:**
```bash
# Na pasta raiz do projeto
./setup-database.sh
```

3. **Verificar Node.js:**
```bash
node --version
# Deve ser 16+ ou 18+
```

4. **Verificar porta:**
```bash
# Verificar se a porta 3001 está livre
lsof -i :3001
# Se estiver em uso, matar o processo
kill -9 <PID>
```

#### ❌ Problema 2: Frontend não conecta com Backend

**Sintomas:**
- Frontend roda normalmente
- Backend roda normalmente
- Erro "Failed to fetch" no console

**Soluções:**

1. **Verificar URLs:**
```bash
# Abrir no navegador
http://localhost:3001/api/health
```

2. **Verificar CORS:**
- O backend deve ter CORS configurado
- Verificar se não há bloqueio de firewall

3. **Verificar variáveis de ambiente:**
```bash
# Criar arquivo .env na raiz do projeto
echo "VITE_API_URL=http://localhost:3001/api" > .env
```

#### ❌ Problema 3: Banco de dados não funciona

**Sintomas:**
- Backend inicia mas não salva dados
- Erro de conexão com banco

**Soluções:**

1. **Reconfigurar banco:**
```bash
cd server
npx prisma migrate reset
npx prisma generate
```

2. **Verificar schema:**
```bash
cd server
npx prisma db push
```

3. **Abrir Prisma Studio:**
```bash
cd server
npx prisma studio
# Abrir http://localhost:5555
```

#### ❌ Problema 4: Problemas de Rede

**Sintomas:**
- Conexão intermitente
- Timeout nas requisições

**Soluções:**

1. **Verificar firewall:**
```bash
# macOS
sudo pfctl -s all

# Windows
netsh advfirewall show allprofiles
```

2. **Usar localhost explícito:**
```bash
# Editar src/lib/api.ts
const API_BASE_URL = 'http://127.0.0.1:3001/api';
```

3. **Verificar DNS:**
```bash
# Adicionar ao /etc/hosts (macOS/Linux)
127.0.0.1 localhost
```

### 🛠 Comandos de Diagnóstico

#### Verificar Status Completo
```bash
#!/bin/bash
echo "=== DIAGNÓSTICO DO SISTEMA PPM ==="

echo "1. Verificando Node.js..."
node --version

echo "2. Verificando portas..."
echo "Porta 3001 (Backend):"
lsof -i :3001 || echo "Porta 3001 livre"

echo "Porta 8080 (Frontend):"
lsof -i :8080 || echo "Porta 8080 livre"

echo "3. Verificando dependências..."
echo "Backend:"
cd server && npm list --depth=0 && cd ..

echo "Frontend:"
npm list --depth=0

echo "4. Testando API..."
curl -s http://localhost:3001/api/health || echo "API não responde"

echo "=== FIM DO DIAGNÓSTICO ==="
```

#### Script de Reinicialização
```bash
#!/bin/bash
echo "Reiniciando sistema PPM..."

# Parar processos existentes
pkill -f "node.*server"
pkill -f "vite"

# Aguardar
sleep 2

# Iniciar backend
cd server && npm run dev &
cd ..

# Aguardar backend
sleep 5

# Iniciar frontend
npm run dev &

echo "Sistema reiniciado!"
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:8080"
```

### 📞 Logs Importantes

#### Backend Logs
```bash
# Ver logs do backend
cd server
npm run dev
```

**Logs esperados:**
```
🚀 Servidor rodando na porta 3001
📊 API disponível em http://localhost:3001/api
🔍 Prisma Studio em http://localhost:5555
```

#### Frontend Logs
```bash
# Abrir console do navegador (F12)
# Verificar erros de rede
```

**Erros comuns:**
- `Failed to fetch`: Backend não responde
- `CORS error`: Problema de configuração
- `Network error`: Problema de rede

### 🎯 Checklist de Solução

- [ ] Backend está rodando na porta 3001
- [ ] Frontend está rodando na porta 8080
- [ ] API responde em `/api/health`
- [ ] Banco de dados está configurado
- [ ] Não há erros no console do navegador
- [ ] CORS está configurado corretamente
- [ ] Firewall não está bloqueando conexões

### 🆘 Suporte

Se o problema persistir:

1. **Coletar informações:**
   - Versão do Node.js
   - Sistema operacional
   - Logs de erro completos
   - Status das portas

2. **Contatar desenvolvedor:**
   - Aderilso Junior
   - Repositório: [URL_DO_REPOSITORIO]

3. **Alternativa temporária:**
   - Usar modo offline (localStorage)
   - Exportar dados manualmente
   - Continuar trabalho sem banco

---

**Última atualização**: Janeiro 2025
**Versão**: 2.1.0
