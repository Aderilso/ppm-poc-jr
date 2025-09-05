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
REM Escolher DB: primeiro tenta ler .ppm-db.env, senao define home/TEMP
if exist "%~dp0.ppm-db.env" (
  for /f "usebackq delims=" %%L in ("%~dp0.ppm-db.env") do (
    for /f "tokens=1,* delims==" %%A in ("%%L") do (
      if /I "%%A"=="DATABASE_URL" set "DATABASE_URL=%%B"
    )
  )
  echo 🔧 DATABASE_URL carregado de .ppm-db.env
)
if "%DATABASE_URL%"=="" (
  set "DBDIR=%USERPROFILE%\.ppm-data"
  if not exist "%DBDIR%" mkdir "%DBDIR%" >nul 2>&1
  echo ok>"%DBDIR%\.perm" 2>nul
  if errorlevel 1 (
    set "DBDIR=%TEMP%\ppm-data"
    if not exist "%DBDIR%" mkdir "%DBDIR%" >nul 2>&1
    echo ⚠️ Sem permissao em pasta do usuario, usando TEMP: %DBDIR%
  )
  set "DATABASE_URL=file:%DBDIR%\dev.db"
)

pushd server >nul
call npx prisma generate >nul 2>&1
call npx prisma db push >nul 2>&1
popd >nul

echo 🚀 Abrindo janelas...
start "PPM API" cmd /k ""cd /d "%ROOT%server" && set DATABASE_URL=%DATABASE_URL% && npm run dev""
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
