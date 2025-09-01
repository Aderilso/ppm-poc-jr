#!/bin/bash

echo "🔧 DIAGNÓSTICO DO SISTEMA PPM"
echo "================================"

# Verificar Node.js
echo "1. 📦 Verificando Node.js..."
if command -v node &> /dev/null; then
    echo "   ✅ Node.js encontrado: $(node --version)"
else
    echo "   ❌ Node.js não encontrado!"
    exit 1
fi

# Verificar portas
echo ""
echo "2. 🔌 Verificando portas..."
echo "   Porta 3001 (Backend):"
if lsof -i :3001 &> /dev/null; then
    echo "   ✅ Porta 3001 em uso"
    lsof -i :3001 | head -2
else
    echo "   ❌ Porta 3001 livre (backend não está rodando)"
fi

echo "   Porta 8080 (Frontend):"
if lsof -i :8080 &> /dev/null; then
    echo "   ✅ Porta 8080 em uso"
    lsof -i :8080 | head -2
else
    echo "   ❌ Porta 8080 livre (frontend não está rodando)"
fi

# Verificar dependências
echo ""
echo "3. 📚 Verificando dependências..."
if [ -d "node_modules" ]; then
    echo "   ✅ Frontend: node_modules encontrado"
else
    echo "   ❌ Frontend: node_modules não encontrado"
fi

if [ -d "server/node_modules" ]; then
    echo "   ✅ Backend: node_modules encontrado"
else
    echo "   ❌ Backend: node_modules não encontrado"
fi

# Testar API
echo ""
echo "4. 🌐 Testando API..."
if curl -s http://localhost:3001/api/health &> /dev/null; then
    echo "   ✅ API responde em http://localhost:3001/api/health"
    echo "   📄 Resposta: $(curl -s http://localhost:3001/api/health)"
else
    echo "   ❌ API não responde em http://localhost:3001/api/health"
fi

# Verificar banco de dados
echo ""
echo "5. 🗄️ Verificando banco de dados..."
if [ -f "server/prisma/dev.db" ]; then
    echo "   ✅ Banco de dados encontrado"
    echo "   📊 Tamanho: $(du -h server/prisma/dev.db | cut -f1)"
else
    echo "   ❌ Banco de dados não encontrado"
fi

# Verificar arquivos importantes
echo ""
echo "6. 📁 Verificando arquivos importantes..."
if [ -f "setup-database.sh" ]; then
    echo "   ✅ setup-database.sh encontrado"
else
    echo "   ❌ setup-database.sh não encontrado"
fi

if [ -f "server/index.js" ]; then
    echo "   ✅ server/index.js encontrado"
else
    echo "   ❌ server/index.js não encontrado"
fi

if [ -f "package.json" ]; then
    echo "   ✅ package.json encontrado"
else
    echo "   ❌ package.json não encontrado"
fi

# Resumo
echo ""
echo "================================"
echo "📋 RESUMO DO DIAGNÓSTICO"
echo "================================"

if lsof -i :3001 &> /dev/null && lsof -i :8080 &> /dev/null; then
    echo "✅ SISTEMA FUNCIONANDO"
    echo "   - Backend: http://localhost:3001"
    echo "   - Frontend: http://localhost:8080"
    echo "   - Prisma Studio: http://localhost:5555"
elif lsof -i :3001 &> /dev/null; then
    echo "⚠️ BACKEND RODANDO, FRONTEND PARADO"
    echo "   Execute: npm run dev"
elif lsof -i :8080 &> /dev/null; then
    echo "⚠️ FRONTEND RODANDO, BACKEND PARADO"
    echo "   Execute: cd server && npm run dev"
else
    echo "❌ SISTEMA PARADO"
    echo "   Execute: ./setup-database.sh"
    echo "   Depois: cd server && npm run dev"
    echo "   E em outro terminal: npm run dev"
fi

echo ""
echo "🔧 Para mais detalhes, consulte: TROUBLESHOOTING.md"
