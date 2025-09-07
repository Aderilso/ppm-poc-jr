@echo off
setlocal enableextensions enabledelayedexpansion
chcp 65001 >nul
title PPM - Bootstrap para Analistas (Windows)

echo ==============================================
echo   PPM - Bootstrap para Analistas (Windows)
echo   Clonar/atualizar repo, preparar DB e iniciar
echo ==============================================
echo.

REM Configurações
set "REPO_URL=https://github.com/Aderilso/ppm-poc-jr.git"
set "INSTALL_DIR=%USERPROFILE%\ppm-poc-jr"
if not "%~1"=="" set "INSTALL_DIR=%~1"

REM Caso o script esteja sendo executado de dentro do repo, apenas inicie
if exist "%~dp0start-all.bat" if exist "%~dp0package.json" (
  echo Detectado repo local em "%~dp0". Iniciando com start-all.bat...
  call "%~dp0start-all.bat"
  goto :eof
)

REM Verificar Git
git --version >nul 2>&1 || (
  echo ❌ Git nao encontrado. Instale em: https://git-scm.com/download/win
  start "" "https://git-scm.com/download/win"
  pause
  exit /b 1
)

REM Verificar Node.js
node -v >nul 2>&1 || (
  echo ❌ Node.js nao encontrado. Instale LTS em: https://nodejs.org/en/download/
  start "" "https://nodejs.org/en/download/"
  pause
  exit /b 1
)

REM Clonar ou atualizar repositório
if exist "%INSTALL_DIR%\._placeholder_do_not_use_" del /f /q "%INSTALL_DIR%\._placeholder_do_not_use_" >nul 2>&1
if exist "%INSTALL_DIR%\.git" (
  echo 🔄 Atualizando repositório existente em: "%INSTALL_DIR%"
  pushd "%INSTALL_DIR%" >nul
  git pull || (popd >nul & echo ❌ Falha no git pull & pause & exit /b 1)
  popd >nul
) else (
  if exist "%INSTALL_DIR%" (
    echo ⚠️ Pasta "%INSTALL_DIR%" existe mas nao e um repo Git.
    set "SUFFIX=%DATE:~6,4%%DATE:~3,2%%DATE:~0,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
    set "SUFFIX=!SUFFIX: =0!"
    set "INSTALL_DIR=%INSTALL_DIR%_!SUFFIX!"
    echo ➜ Usando pasta alternativa: "%INSTALL_DIR%"
  )
  echo ⬇️ Clonando repositório em "%INSTALL_DIR%" ...
  git clone "%REPO_URL%" "%INSTALL_DIR%" || (echo ❌ Falha ao clonar & pause & exit /b 1)
)

REM Preparar arquivo .ppm-db.env com base de dados em pasta gravavel
set "USER_DBDIR=%USERPROFILE%\.ppm-data"
set "TEMP_DBDIR=%TEMP%\ppm-data"
set "DBDIR=%USER_DBDIR%"
if not exist "%DBDIR%" mkdir "%DBDIR%" >nul 2>&1
echo ok>"%DBDIR%\.perm" 2>nul
if errorlevel 1 (
  echo ⚠️ Sem permissao de escrita em "%USER_DBDIR%". Usando TEMP.
  set "DBDIR=%TEMP_DBDIR%"
  if not exist "%DBDIR%" mkdir "%DBDIR%" >nul 2>&1
)
set "ENV_FILE=%INSTALL_DIR%\.ppm-db.env"
>"%ENV_FILE%" echo DATABASE_URL=file:%DBDIR%\dev.db
echo 🔧 Criado "%ENV_FILE%" apontando para: file:%DBDIR%\dev.db

REM Iniciar sistema (abre janelas do backend e frontend)
echo 🚀 Iniciando o sistema...
pushd "%INSTALL_DIR%" >nul
call start-all.bat
popd >nul

exit /b 0

