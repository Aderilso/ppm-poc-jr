@echo off
chcp 65001 >nul
echo 🔧 DIAGNÓSTICO DO SISTEMA PPM
echo ================================

REM Verificar Node.js
echo 1. 📦 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Node.js encontrado: 
    node --version
) else (
    echo    ❌ Node.js não encontrado!
    pause
    exit /b 1
)

REM Verificar portas
echo.
echo 2. 🔌 Verificando portas...
echo    Porta 3001 (Backend):
netstat -an | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo    ✅ Porta 3001 em uso
    netstat -an | findstr :3001
) else (
    echo    ❌ Porta 3001 livre (backend não está rodando)
)

echo    Porta 8080 (Frontend):
netstat -an | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo    ✅ Porta 8080 em uso
    netstat -an | findstr :8080
) else (
    echo    ❌ Porta 8080 livre (frontend não está rodando)
)

REM Verificar dependências
echo.
echo 3. 📚 Verificando dependências...
if exist "node_modules" (
    echo    ✅ Frontend: node_modules encontrado
) else (
    echo    ❌ Frontend: node_modules não encontrado
)

if exist "server\node_modules" (
    echo    ✅ Backend: node_modules encontrado
) else (
    echo    ❌ Backend: node_modules não encontrado
)

REM Testar API
echo.
echo 4. 🌐 Testando API...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -UseBasicParsing | Select-Object -ExpandProperty Content } catch { 'API não responde' }" > temp_response.txt
set /p api_response=<temp_response.txt
del temp_response.txt

echo %api_response% | findstr "status" >nul
if %errorlevel% equ 0 (
    echo    ✅ API responde em http://localhost:3001/api/health
    echo    📄 Resposta: %api_response%
) else (
    echo    ❌ API não responde em http://localhost:3001/api/health
)

REM Verificar banco de dados
echo.
echo 5. 🗄️ Verificando banco de dados...
if exist "server\prisma\dev.db" (
    echo    ✅ Banco de dados encontrado
    for %%A in ("server\prisma\dev.db") do echo    📊 Tamanho: %%~zA bytes
) else (
    echo    ❌ Banco de dados não encontrado
)

REM Verificar arquivos importantes
echo.
echo 6. 📁 Verificando arquivos importantes...
if exist "setup-database.sh" (
    echo    ✅ setup-database.sh encontrado
) else (
    echo    ❌ setup-database.sh não encontrado
)

if exist "server\index.js" (
    echo    ✅ server\index.js encontrado
) else (
    echo    ❌ server\index.js não encontrado
)

if exist "package.json" (
    echo    ✅ package.json encontrado
) else (
    echo    ❌ package.json não encontrado
)

REM Resumo
echo.
echo ================================
echo 📋 RESUMO DO DIAGNÓSTICO
echo ================================

netstat -an | findstr :3001 >nul
set backend_running=%errorlevel%

netstat -an | findstr :8080 >nul
set frontend_running=%errorlevel%

if %backend_running% equ 0 if %frontend_running% equ 0 (
    echo ✅ SISTEMA FUNCIONANDO
    echo    - Backend: http://localhost:3001
    echo    - Frontend: http://localhost:8080
    echo    - Prisma Studio: http://localhost:5555
) else if %backend_running% equ 0 (
    echo ⚠️ BACKEND RODANDO, FRONTEND PARADO
    echo    Execute: npm run dev
) else if %frontend_running% equ 0 (
    echo ⚠️ FRONTEND RODANDO, BACKEND PARADO
    echo    Execute: cd server ^&^& npm run dev
) else (
    echo ❌ SISTEMA PARADO
    echo    Execute: setup-database.bat
    echo    Depois: cd server ^&^& npm run dev
    echo    E em outro terminal: npm run dev
)

echo.
echo 🔧 Para mais detalhes, consulte: TROUBLESHOOTING.md
pause
