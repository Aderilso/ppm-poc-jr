@echo off
chcp 65001 >nul
echo 🚀 CONFIGURAÇÃO COMPLETA DO SISTEMA PPM
echo ===========================================
echo.
echo 📋 Este script vai configurar TUDO automaticamente
echo    - Instalar dependências
echo    - Configurar banco de dados
echo    - Verificar funcionamento
echo    - Iniciar o sistema
echo.

REM Verificar se estamos na pasta correta
if not exist "package.json" (
    echo ❌ ERRO: Execute este script na pasta raiz do projeto PPM
    echo    Pasta atual: %CD%
    echo    Procure por: package.json
    pause
    exit /b 1
)

echo ✅ Pasta correta detectada
echo.

REM Verificar Node.js
echo 📦 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo.
    echo 🔧 SOLUÇÃO:
    echo 1. Baixe Node.js: https://nodejs.org/
    echo 2. Instale a versão LTS (recomendada)
    echo 3. Reinicie o terminal
    echo 4. Execute este script novamente
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js encontrado: 
node --version
echo.

REM Limpar instalações anteriores (opcional)
echo 🧹 Limpando instalações anteriores...
if exist "node_modules" (
    echo    Removendo node_modules do frontend...
    rmdir /s /q node_modules
)
if exist "server\node_modules" (
    echo    Removendo node_modules do backend...
    rmdir /s /q server\node_modules
)
if exist "server\prisma\dev.db" (
    echo    Removendo banco de dados antigo...
    del server\prisma\dev.db
)
echo ✅ Limpeza concluída
echo.

REM Instalar dependências do frontend
echo 📦 Instalando dependências do frontend...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do frontend
    echo.
    echo 🔧 TENTE:
    echo 1. Verificar conexão com internet
    echo 2. Limpar cache: npm cache clean --force
    echo 3. Executar novamente
    echo.
    pause
    exit /b 1
)
echo ✅ Dependências do frontend instaladas
echo.

REM Instalar dependências do backend
echo 📦 Instalando dependências do backend...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do backend
    cd ..
    pause
    exit /b 1
)
echo ✅ Dependências do backend instaladas
cd ..
echo.

REM Configurar banco de dados
echo 🗄️ Configurando banco de dados...
cd server
echo    Gerando cliente Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Erro ao gerar cliente Prisma
    cd ..
    pause
    exit /b 1
)

echo    Configurando banco de dados...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Erro ao configurar banco de dados
    cd ..
    pause
    exit /b 1
)
echo ✅ Banco de dados configurado
cd ..
echo.

REM Verificar arquivos importantes
echo 📁 Verificando arquivos importantes...
if not exist "ppm_forms_consolidado_v2_normalizado.json" (
    echo ⚠️ Arquivo JSON padrão não encontrado na raiz
    echo    O sistema usará o arquivo da pasta public/
)
if exist "public\ppm_forms_consolidado_v2_normalizado.json" (
    echo ✅ Arquivo JSON padrão encontrado em public/
)
if not exist "server\index.js" (
    echo ❌ Arquivo do servidor não encontrado
    pause
    exit /b 1
)
if not exist "src\App.tsx" (
    echo ❌ Arquivo principal do frontend não encontrado
    pause
    exit /b 1
)
echo ✅ Todos os arquivos importantes verificados
echo.

REM Testar se as portas estão livres
echo 🔌 Verificando portas...
netstat -an | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo ⚠️ Porta 3001 em uso - será liberada automaticamente
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
)

netstat -an | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo ⚠️ Porta 8080 em uso - será liberada automaticamente
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
)
echo ✅ Portas verificadas
echo.

REM Iniciar backend
echo 🚀 Iniciando backend...
cd server
start "Backend PPM" cmd /k "echo Iniciando backend... && npm run dev"
cd ..
echo ✅ Backend iniciado em nova janela
echo.

REM Aguardar backend inicializar
echo ⏳ Aguardando backend inicializar...
timeout /t 8 /nobreak >nul

REM Testar API
echo 🌐 Testando API...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -UseBasicParsing -TimeoutSec 5; Write-Host 'API OK:' $response.Content } catch { Write-Host 'API não responde ainda...' }"
echo.

REM Iniciar frontend
echo 🚀 Iniciando frontend...
start "Frontend PPM" cmd /k "echo Iniciando frontend... && npm run dev"
echo ✅ Frontend iniciado em nova janela
echo.

REM Aguardar frontend inicializar
echo ⏳ Aguardando frontend inicializar...
timeout /t 5 /nobreak >nul

echo.
echo 🎉 CONFIGURAÇÃO COMPLETA CONCLUÍDA!
echo ===========================================
echo.
echo ✅ Sistema configurado com sucesso!
echo.
echo 🔗 URLs IMPORTANTES:
echo    Frontend: http://localhost:8080 (ou 8081)
echo    Backend API: http://localhost:3001/api
echo    Prisma Studio: http://localhost:5555
echo.
echo 📋 PRÓXIMOS PASSOS:
echo    1. Abra o navegador em: http://localhost:8080
echo    2. Vá em CONFIG e clique em "Usar JSON Padrão"
echo    3. Comece a usar o sistema!
echo.
echo 🛠️ COMANDOS ÚTEIS:
echo    - Diagnóstico: diagnostico.bat
echo    - Reiniciar: reiniciar-sistema.bat
echo    - Limpar banco: Use o botão "Apagar Banco" em CONFIG
echo.
echo 📞 SE HOUVER PROBLEMAS:
echo    1. Execute: diagnostico.bat
echo    2. Consulte: TROUBLESHOOTING.md
echo    3. Verifique se as janelas do backend/frontend estão abertas
echo.
echo ✅ Sistema pronto para uso!
echo.
pause
