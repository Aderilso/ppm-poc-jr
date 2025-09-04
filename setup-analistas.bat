@echo off
setlocal enableextensions enabledelayedexpansion
chcp 65001 >nul

echo ============================================================
echo   PPM - Preparador de Ambiente (Windows)
echo   Este script instala dependencias, prepara o banco e inicia
echo   o servidor (API) e o frontend em janelas separadas.
echo ============================================================
echo.

REM Ir para o diretório do script (raiz do repo)
cd /d %~dp0

echo [1/7] Verificando Node.js e npm...
node -v >nul 2>&1
if errorlevel 1 (
  echo.
  echo Node.js nao encontrado.
  echo Abra a pagina de download, instale a versao LTS e execute novamente este arquivo.
  start "" "https://nodejs.org/en/download/"
  pause
  exit /b 1
)
npm -v >nul 2>&1
if errorlevel 1 (
  echo.
  echo npm nao encontrado (vem junto com o Node.js). Reinstale o Node.js LTS.
  pause
  exit /b 1
)

echo [2/7] Instalando dependencias do frontend (raiz)...
if exist package-lock.json (
  call npm ci || goto :npm_root_fallback
) else (
  call npm install || goto :npm_root_fallback
)
goto :npm_root_ok

:npm_root_fallback
echo Aviso: Falha no npm ci. Tentando npm install...
call npm install || goto :error

:npm_root_ok
echo.

echo [3/7] Instalando dependencias do backend (server)...
pushd server >nul
if exist package-lock.json (
  call npm ci || goto :npm_srv_fallback
) else (
  call npm install || goto :npm_srv_fallback
)
goto :npm_srv_ok

:npm_srv_fallback
echo Aviso: Falha no npm ci (server). Tentando npm install...
call npm install || goto :error

:npm_srv_ok
echo.

echo [4/7] Preparando Prisma (gerar client)...
call npx prisma generate || goto :error
echo.

echo [5/7] Aplicando migracoes do banco (SQLite)...
call npx prisma migrate deploy || goto :error
echo.

echo [6/7] (Opcional) Carregar dados de exemplo?
set SEED_CHOICE=N
set /p SEED_CHOICE="Digite S para carregar dados de exemplo (S/N): "
if /I "!SEED_CHOICE!"=="S" (
  echo Carregando dados de exemplo...
  node init-db.js || goto :error
)
popd >nul

echo.
echo [7/7] Iniciando API e Frontend em janelas separadas...
start "PPM API" cmd /k "cd /d %~dp0server && npm run dev"
start "PPM Frontend" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 3 >nul
start "" http://localhost:8080

echo.
echo ================================================
echo Ambiente iniciado! Abrimos o navegador em: http://localhost:8080
echo API em http://localhost:3001/api
echo Feche esta janela se desejar.
echo ================================================
pause
exit /b 0

:error
echo.
echo Ocorreu um erro durante a preparacao. Verifique as mensagens acima.
pause
exit /b 1

