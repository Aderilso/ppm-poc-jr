@echo off
chcp 65001 >nul
echo 🚀 CONFIGURAÇÃO DO BANCO DE DADOS PPM
echo ======================================

echo.
echo 📦 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo Por favor, instale o Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js encontrado: 
node --version

echo.
echo 📦 Instalando dependências do frontend...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do frontend
    pause
    exit /b 1
)
echo ✅ Dependências do frontend instaladas

echo.
echo 📦 Instalando dependências do backend...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do backend
    pause
    exit /b 1
)
echo ✅ Dependências do backend instaladas

echo.
echo 🗄️ Configurando banco de dados...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Erro ao gerar cliente Prisma
    pause
    exit /b 1
)

call npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Erro ao configurar banco de dados
    pause
    exit /b 1
)
echo ✅ Banco de dados configurado

cd ..

echo.
echo 🎉 CONFIGURAÇÃO CONCLUÍDA!
echo ================================
echo.
echo 📋 Próximos passos:
echo 1. Inicie o servidor: cd server ^&^& npm run dev
echo 2. Inicie o frontend: npm run dev
echo 3. Acesse: http://localhost:8080 (ou 8081)
echo 4. Visualize o banco: cd server ^&^& npm run db:studio
echo.
echo 🔗 URLs importantes:
echo - Frontend: http://localhost:8080 (ou 8081)
echo - Backend API: http://localhost:3001/api
echo - Prisma Studio: http://localhost:5555
echo.
echo ✅ Sistema pronto para uso!
pause
