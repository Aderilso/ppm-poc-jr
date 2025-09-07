# PPM - Bootstrap para Analistas (PowerShell)
Param(
  [string]$InstallDir = "$env:USERPROFILE\ppm-poc-jr"
)

$ErrorActionPreference = 'Stop'
$repoUrl = 'https://github.com/Aderilso/ppm-poc-jr.git'

Write-Host "==============================================="
Write-Host "  PPM - Bootstrap para Analistas (PowerShell)"
Write-Host "  Clonar/atualizar repo, preparar DB e iniciar"
Write-Host "==============================================="
Write-Host ""

# Se estiver dentro do repo, apenas iniciar
try {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  if (Test-Path (Join-Path $scriptDir 'start-all.bat') -PathType Leaf -and (Test-Path (Join-Path $scriptDir 'package.json') -PathType Leaf)) {
    Write-Host "Detectado repo local em '$scriptDir'. Iniciando com start-all.bat..."
    Start-Process -FilePath (Join-Path $scriptDir 'start-all.bat')
    return
  }
} catch { }

# Verificar Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "❌ Git não encontrado. Instale em: https://git-scm.com/download/win" -ForegroundColor Red
  Start-Process 'https://git-scm.com/download/win'
  Read-Host 'Pressione ENTER para sair'
  exit 1
}

# Verificar Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "❌ Node.js não encontrado. Instale LTS em: https://nodejs.org/en/download/" -ForegroundColor Red
  Start-Process 'https://nodejs.org/en/download/'
  Read-Host 'Pressione ENTER para sair'
  exit 1
}

# Clonar ou atualizar repositório
if (Test-Path (Join-Path $InstallDir '.git')) {
  Write-Host "🔄 Atualizando repositório existente em: $InstallDir"
  & git -C $InstallDir pull
} else {
  if (Test-Path $InstallDir -PathType Container) {
    Write-Host "⚠️ Pasta '$InstallDir' existe mas não é um repo Git."
    $suffix = Get-Date -Format 'yyyyMMdd_HHmmss'
    $InstallDir = "$InstallDir`_$suffix"
    Write-Host "➜ Usando pasta alternativa: $InstallDir"
  }
  Write-Host "⬇️ Clonando repositório em '$InstallDir' ..."
  & git clone $repoUrl $InstallDir
}

# Preparar arquivo .ppm-db.env
$userDbDir = Join-Path $env:USERPROFILE '.ppm-data'
$tempDbDir = Join-Path $env:TEMP 'ppm-data'
$dbDir = $userDbDir
try {
  New-Item -ItemType Directory -Path $dbDir -Force | Out-Null
  $testFile = Join-Path $dbDir '.perm'
  Set-Content -Path $testFile -Value 'ok' -Encoding ascii
  Remove-Item $testFile -Force -ErrorAction SilentlyContinue
} catch {
  Write-Host "⚠️ Sem permissão na pasta do usuário. Usando TEMP." -ForegroundColor Yellow
  $dbDir = $tempDbDir
  New-Item -ItemType Directory -Path $dbDir -Force | Out-Null
}

$envFile = Join-Path $InstallDir '.ppm-db.env'
"DATABASE_URL=file:$dbDir\dev.db" | Set-Content -Path $envFile -Encoding ascii
Write-Host "🔧 Criado '$envFile' apontando para: file:$dbDir\dev.db"

# Iniciar sistema
Write-Host "🚀 Iniciando o sistema..."
Start-Process -FilePath (Join-Path $InstallDir 'start-all.bat')

Write-Host ""
Write-Host "Pronto! As janelas do Backend e Frontend serão abertas." -ForegroundColor Green
Write-Host "Se o navegador não abrir, acesse: http://localhost:8080"

