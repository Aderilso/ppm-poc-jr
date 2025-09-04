@echo off
setlocal enableextensions enabledelayedexpansion
chcp 65001 >nul

echo ============================================================
echo   PPM - Clonar e Preparar Ambiente (Windows)
echo   Este script clona o repositorio, troca para a branch
echo   validada e executa o setup automatizado.
echo ============================================================
echo.

set REPO_URL=https://github.com/Aderilso/ppm-poc-jr.git
set BRANCH=versao-validada-GPT
set FOLDER=ppm-poc-jr

echo [1/4] Verificando Git...
git --version >nul 2>&1
if errorlevel 1 (
  echo.
  echo Git nao encontrado.
  echo Abra a pagina de download e instale o Git, depois execute novamente este arquivo.
  start "" "https://git-scm.com/download/win"
  pause
  exit /b 1
)

echo.
echo [2/4] Escolhendo diretorio de destino (ENTER para padrao)...
set DEFAULT_DIR=%USERPROFILE%\Documents
set /p TARGET_DIR="Diretorio onde clonar (padrão: %DEFAULT_DIR%): "
if "!TARGET_DIR!"=="" set TARGET_DIR=%DEFAULT_DIR%

if not exist "!TARGET_DIR!" (
  mkdir "!TARGET_DIR!" || (
    echo Nao foi possivel criar o diretorio de destino.
    pause
    exit /b 1
  )
)

cd /d "!TARGET_DIR!" || (
  echo Nao foi possivel acessar o diretorio de destino.
  pause
  exit /b 1
)

echo.
echo [3/4] Obtendo o repositorio...
if exist "!FOLDER!\.git" (
  echo Repositorio ja existe. Atualizando...
  pushd "!FOLDER!" >nul
  git fetch --all || goto :git_error
  git checkout "!BRANCH!" || goto :git_error
  git pull || goto :git_error
  popd >nul
) else (
  git clone --branch "!BRANCH!" --single-branch "!REPO_URL!" || goto :git_error
)

echo.
echo [4/4] Executando setup-analistas.bat ...
cd /d "!FOLDER!" || goto :error
call setup-analistas.bat
goto :end

:git_error
echo.
echo Ocorreu um erro ao obter o repositorio (git).
pause
exit /b 1

:error
echo.
echo Ocorreu um erro ao executar o setup. Verifique as mensagens acima.
pause
exit /b 1

:end
echo.
echo Processo concluido.
exit /b 0

