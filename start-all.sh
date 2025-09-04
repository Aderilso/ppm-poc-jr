#!/usr/bin/env bash

# Simple runner to boot backend and frontend together
# Usage: bash start-all.sh

set -euo pipefail

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

# 3) Ensure DB schema exists (safe/no-op if already applied)
echo "🗄️ Checando schema do banco (Prisma db push)..."
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
(cd server && npm run dev) >/dev/null 2>&1 &
BACKEND_PID=$!
echo "✅ Backend PID: $BACKEND_PID"

# Kill backend on exit
cleanup() {
  echo "\n🛑 Encerrando processos..."
  kill "$BACKEND_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

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

# 7) Start frontend in foreground (Ctrl+C para sair)
echo "🚀 Iniciando frontend (Vite)"
npm run dev

