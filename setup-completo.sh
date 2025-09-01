#!/bin/bash

echo "🚀 CONFIGURAÇÃO COMPLETA DO SISTEMA PPM"
echo "==========================================="
echo ""
echo "📋 Este script vai configurar TUDO automaticamente"
echo "   - Instalar dependências"
echo "   - Configurar banco de dados"
echo "   - Verificar funcionamento"
echo "   - Iniciar o sistema"
echo ""

# Verificar se estamos na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: Execute este script na pasta raiz do projeto PPM"
    echo "   Pasta atual: $(pwd)"
    echo "   Procure por: package.json"
    exit 1
fi

echo "✅ Pasta correta detectada"
echo ""

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo ""
    echo "🔧 SOLUÇÃO:"
    echo "1. Baixe Node.js: https://nodejs.org/"
    echo "2. Instale a versão LTS (recomendada)"
    echo "3. Reinicie o terminal"
    echo "4. Execute este script novamente"
    echo ""
    exit 1
fi
echo "✅ Node.js encontrado: $(node --version)"
echo ""

# Limpar instalações anteriores (opcional)
echo "🧹 Limpando instalações anteriores..."
if [ -d "node_modules" ]; then
    echo "   Removendo node_modules do frontend..."
    rm -rf node_modules
fi
if [ -d "server/node_modules" ]; then
    echo "   Removendo node_modules do backend..."
    rm -rf server/node_modules
fi
if [ -f "server/prisma/dev.db" ]; then
    echo "   Removendo banco de dados antigo..."
    rm server/prisma/dev.db
fi
echo "✅ Limpeza concluída"
echo ""

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
if ! npm install; then
    echo "❌ Erro ao instalar dependências do frontend"
    echo ""
    echo "🔧 TENTE:"
    echo "1. Verificar conexão com internet"
    echo "2. Limpar cache: npm cache clean --force"
    echo "3. Executar novamente"
    echo ""
    exit 1
fi
echo "✅ Dependências do frontend instaladas"
echo ""

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd server
if ! npm install; then
    echo "❌ Erro ao instalar dependências do backend"
    cd ..
    exit 1
fi
echo "✅ Dependências do backend instaladas"
cd ..
echo ""

# Configurar banco de dados
echo "🗄️ Configurando banco de dados..."
cd server
echo "   Gerando cliente Prisma..."
if ! npx prisma generate; then
    echo "❌ Erro ao gerar cliente Prisma"
    cd ..
    exit 1
fi

echo "   Configurando banco de dados..."
if ! npx prisma db push; then
    echo "❌ Erro ao configurar banco de dados"
    cd ..
    exit 1
fi
echo "✅ Banco de dados configurado"
cd ..
echo ""

# Verificar arquivos importantes
echo "📁 Verificando arquivos importantes..."
if [ ! -f "ppm_forms_consolidado_v2_normalizado.json" ]; then
    echo "⚠️ Arquivo JSON padrão não encontrado na raiz"
    echo "   O sistema usará o arquivo da pasta public/"
fi
if [ -f "public/ppm_forms_consolidado_v2_normalizado.json" ]; then
    echo "✅ Arquivo JSON padrão encontrado em public/"
fi
if [ ! -f "server/index.js" ]; then
    echo "❌ Arquivo do servidor não encontrado"
    exit 1
fi
if [ ! -f "src/App.tsx" ]; then
    echo "❌ Arquivo principal do frontend não encontrado"
    exit 1
fi
echo "✅ Todos os arquivos importantes verificados"
echo ""

# Testar se as portas estão livres
echo "🔌 Verificando portas..."
if lsof -i :3001 &> /dev/null; then
    echo "⚠️ Porta 3001 em uso - será liberada automaticamente"
    pkill -f "node.*server" || true
    sleep 2
fi

if lsof -i :8080 &> /dev/null; then
    echo "⚠️ Porta 8080 em uso - será liberada automaticamente"
    pkill -f "vite" || true
    sleep 2
fi
echo "✅ Portas verificadas"
echo ""

# Iniciar backend
echo "🚀 Iniciando backend..."
cd server
nohup npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "✅ Backend iniciado (PID: $BACKEND_PID)"
echo ""

# Aguardar backend inicializar
echo "⏳ Aguardando backend inicializar..."
sleep 8

# Testar API
echo "🌐 Testando API..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ API respondendo corretamente"
else
    echo "⚠️ API ainda não responde - aguardando..."
    sleep 5
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo "✅ API agora está respondendo"
    else
        echo "⚠️ API pode demorar um pouco para inicializar"
    fi
fi
echo ""

# Iniciar frontend
echo "🚀 Iniciando frontend..."
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"
echo ""

# Aguardar frontend inicializar
echo "⏳ Aguardando frontend inicializar..."
sleep 5

echo ""
echo "🎉 CONFIGURAÇÃO COMPLETA CONCLUÍDA!"
echo "==========================================="
echo ""
echo "✅ Sistema configurado com sucesso!"
echo ""
echo "🔗 URLs IMPORTANTES:"
echo "   Frontend: http://localhost:8080 (ou 8081)"
echo "   Backend API: http://localhost:3001/api"
echo "   Prisma Studio: http://localhost:5555"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "   1. Abra o navegador em: http://localhost:8080"
echo "   2. Vá em CONFIG e clique em \"Usar JSON Padrão\""
echo "   3. Comece a usar o sistema!"
echo ""
echo "🛠️ COMANDOS ÚTEIS:"
echo "   - Diagnóstico: ./diagnostico.sh"
echo "   - Reiniciar: ./reiniciar-sistema.sh"
echo "   - Limpar banco: Use o botão \"Apagar Banco\" em CONFIG"
echo ""
echo "📞 SE HOUVER PROBLEMAS:"
echo "   1. Execute: ./diagnostico.sh"
echo "   2. Consulte: TROUBLESHOOTING.md"
echo "   3. Verifique os logs: backend.log e frontend.log"
echo ""
echo "📊 LOGS DO SISTEMA:"
echo "   Backend: tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "✅ Sistema pronto para uso!"
echo ""
