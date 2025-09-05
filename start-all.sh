#!/usr/bin/env bash

# Simple runner to boot backend and frontend together
# Usage: bash start-all.sh

set -euo pipefail

# Args
BG_MODE=false
for arg in "$@"; do
  case "$arg" in
    --bg|--background)
      BG_MODE=true
      ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "🔧 PPM – Start All (backend + frontend)"
echo "📁 Root: $ROOT_DIR"

# 1) Basic checks
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js não encontrado. Instale a versão LTS em https://nodejs.org/"
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm não encontrado. Reinstale o Node.js LTS."
  exit 1
fi

# 2) Ensure deps exist (idempotent)
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências do frontend (uma vez)..."
  npm install
fi
if [ ! -d "server/node_modules" ]; then
  echo "📦 Instalando dependências do backend (uma vez)..."
  (cd server && npm install)
fi

# 3) Choose DB target: allow override via .ppm-db.env, else writable default
echo "🗄️ Checando schema do banco (Prisma db push)..."
# Load override if present
if [ -f "$ROOT_DIR/.ppm-db.env" ]; then
  # shellcheck disable=SC1090
  . "$ROOT_DIR/.ppm-db.env"
  echo "🔧 DATABASE_URL carregado de .ppm-db.env"
fi
if [ -z "${DATABASE_URL:-}" ]; then
  DB_DIR="$HOME/.ppm-data"
  mkdir -p "$DB_DIR" 2>/dev/null || true
  if ! (echo ok > "$DB_DIR/.perm" 2>/dev/null); then
    DB_DIR="${TMPDIR:-/tmp}/ppm-data"
    mkdir -p "$DB_DIR" 2>/dev/null || true
    echo "⚠️ Sem permissão em ~/.ppm-data, usando temporário: $DB_DIR"
  fi
  export DATABASE_URL="file:${DB_DIR}/dev.db"
fi
(cd server && npx prisma generate >/dev/null 2>&1 && npx prisma db push >/dev/null 2>&1) || true

# 4) Free ports optionally
free_port() {
  local PORT="$1"
  if lsof -i :"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "⚠️ Porta $PORT em uso. Tentando liberar..."
    if [[ "$PORT" == "3001" ]]; then
      pkill -f "node.*server" || true
    else
      pkill -f "vite" || true
    fi
    sleep 1
  fi
}
free_port 3001
free_port 8080

# 5) Start backend in background
echo "🚀 Iniciando backend em segundo plano..."
(cd server && DATABASE_URL="$DATABASE_URL" npm run dev) >/dev/null 2>&1 &
BACKEND_PID=$!
echo "✅ Backend PID: $BACKEND_PID"

# Kill backend on exit (apenas modo foreground)
if [ "$BG_MODE" = false ]; then
  cleanup() {
    echo "\n🛑 Encerrando processos..."
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  }
  trap cleanup EXIT
fi

# 6) Wait for API
echo "⏳ Aguardando API (http://localhost:3001/api/health)..."
for i in {1..12}; do
  if curl -fsS http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "✅ API respondendo"
    break
  fi
  sleep 1
  if [ "$i" -eq 12 ]; then
    echo "⚠️ API ainda não respondeu; seguindo mesmo assim"
  fi
done

echo "🌐 Abra: http://localhost:8080"
echo "📜 Logs do backend aparecem nesta janela se houver erros."

# 7) Start frontend
echo "🚀 Iniciando frontend (Vite)"
if [ "$BG_MODE" = true ]; then
  (npm run dev) >/dev/null 2>&1 &
  FRONTEND_PID=$!
  echo "✅ Frontend em background (PID: $FRONTEND_PID)"
  echo "🌐 Abra: http://localhost:8080"
  echo "💡 Para encerrar: kill $BACKEND_PID $FRONTEND_PID"
  # Keep this script alive just to show PIDs briefly
  sleep 2
else
  npm run dev
fi
