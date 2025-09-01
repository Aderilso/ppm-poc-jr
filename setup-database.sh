#!/bin/bash

echo "🚀 Configurando banco de dados para o Sistema PPM"
echo "=================================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "✅ Node.js e npm encontrados"

# Entrar no diretório do servidor
cd server

echo "📦 Instalando dependências do servidor..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas"

echo "🗄️ Gerando cliente Prisma..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Erro ao gerar cliente Prisma"
    exit 1
fi

echo "✅ Cliente Prisma gerado"

echo "🔄 Executando migrações do banco..."
npm run db:migrate

if [ $? -ne 0 ]; then
    echo "❌ Erro ao executar migrações"
    exit 1
fi

echo "✅ Migrações executadas"

echo "📊 Inicializando banco com dados de exemplo..."
npm run db:init

if [ $? -ne 0 ]; then
    echo "❌ Erro ao inicializar banco"
    exit 1
fi

echo "✅ Banco inicializado"

echo ""
echo "🎉 Configuração concluída com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Inicie o servidor: cd server && npm run dev"
echo "2. Inicie o frontend: npm run dev"
echo "3. Acesse: http://localhost:8080 (ou 8081)"
echo "4. Visualize o banco: cd server && npm run db:studio"
echo ""
echo "🔗 URLs importantes:"
echo "- Frontend: http://localhost:8080 (ou 8081)"
echo "- Backend API: http://localhost:3001/api"
echo "- Prisma Studio: http://localhost:5555"
echo ""
