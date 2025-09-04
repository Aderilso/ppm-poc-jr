@echo off
setlocal enableextensions enabledelayedexpansion
chcp 65001 >nul

title PPM - Start All (backend + frontend)

REM Ir para a raiz do projeto
set "ROOT=%~dp0"
cd /d "%ROOT%"

echo ==============================================
echo   PPM - Iniciando Backend e Frontend
echo ==============================================
echo.

REM Verificar Node.js e npm
node -v >nul 2>&1 || (
  echo ❌ Node.js nao encontrado. Instale LTS em https://nodejs.org/ e rode de novo.
  pause
  exit /b 1
)
npm -v >nul 2>&1 || (
  echo ❌ npm nao encontrado. Reinstale o Node.js LTS.
  pause
  exit /b 1
)

REM Instalar dependencias uma unica vez (se necessario)
if not exist "node_modules" (
  echo 📦 Instalando dependencias do frontend (uma vez)...
  call npm install || goto :error
)
if not exist "server\node_modules" (
  echo 📦 Instalando dependencias do backend (uma vez)...
  pushd server >nul
  call npm install || (popd >nul & goto :error)
  popd >nul
)

REM Garantir schema do banco (no-op se ja aplicado)
pushd server >nul
call npx prisma generate >nul 2>&1
call npx prisma db push >nul 2>&1
popd >nul

echo 🚀 Abrindo janelas...
start "PPM API" cmd /k ""cd /d "%ROOT%server" && npm run dev""
start "PPM Frontend" cmd /k ""cd /d "%ROOT%" && npm run dev""

timeout /t 2 >nul
start "" http://localhost:8080

echo.
echo ✅ Sistema iniciando. As janelas do Backend e Frontend foram abertas.
echo    Feche esta janela se desejar.
echo.
pause
exit /b 0

:error
echo ❌ Ocorreu um erro ao iniciar. Verifique as mensagens acima.
pause
exit /b 1

