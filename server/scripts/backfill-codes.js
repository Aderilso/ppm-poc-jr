// Backfill de códigos legíveis (EN001, EN002, ...) para entrevistas existentes
// Uso:
//   cd server
//   node scripts/backfill-codes.js
// Opcional: definir DATABASE_URL, senão tentamos um caminho gravável (~/.ppm-data/dev.db ou %TEMP%)

import { PrismaClient } from '@prisma/client'
import os from 'os'
import fs from 'fs'
import path from 'path'
import url from 'url'

function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  // 1) Preferir DB local do repo: server/prisma/dev.db
  const scriptDir = path.dirname(url.fileURLToPath(import.meta.url))
  const serverDir = path.resolve(scriptDir, '..')
  const repoDevDb = path.join(serverDir, 'prisma', 'dev.db')
  try {
    if (fs.existsSync(repoDevDb)) {
      process.env.DATABASE_URL = 'file:./prisma/dev.db'
      // Ajustar cwd para pasta do server para que o caminho relativo funcione
      process.chdir(serverDir)
      return process.env.DATABASE_URL
    }
  } catch (_) {}

  // 2) Fallback: pasta do usuário
  const homeDir = os.homedir()
  const userDataDir = path.join(homeDir || process.cwd(), '.ppm-data')
  const dbFile = path.join(userDataDir, 'dev.db')
  try {
    fs.mkdirSync(userDataDir, { recursive: true })
    fs.writeFileSync(path.join(userDataDir, '.perm'), 'ok')
  } catch (_) {
    const tmpDir = path.join(os.tmpdir(), 'ppm-data')
    fs.mkdirSync(tmpDir, { recursive: true })
    const tmpDb = path.join(tmpDir, 'dev.db')
    process.env.DATABASE_URL = `file:${tmpDb}`
    return process.env.DATABASE_URL
  }
  process.env.DATABASE_URL = `file:${dbFile}`
  return process.env.DATABASE_URL
}

ensureDatabaseUrl()

const prisma = new PrismaClient()

function parseCodeToNumber(code) {
  if (!code) return NaN
  const m = String(code).match(/^EN(\d{3,})$/i)
  if (!m) return NaN
  return parseInt(m[1], 10)
}

function formatNumber(n) {
  return `EN${String(n).padStart(3, '0')}`
}

async function main() {
  console.log('Backfill de códigos EN iniciando...')
  console.log('DATABASE_URL =', process.env.DATABASE_URL)

  // Garantir que a coluna exista: tentativa suave de detectar
  try {
    await prisma.$queryRawUnsafe('SELECT code FROM interviews LIMIT 1')
  } catch (e) {
    console.error('\n❌ Coluna "code" não encontrada. Execute antes: npx prisma db push')
    process.exit(1)
  }

  const all = await prisma.interview.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, code: true, createdAt: true }
  })
  console.log(`Total de entrevistas: ${all.length}`)

  const used = new Set()
  for (const it of all) {
    const n = parseCodeToNumber(it.code)
    if (!isNaN(n)) used.add(n)
  }

  let updates = 0
  for (const it of all) {
    if (it.code) continue // manter códigos existentes
    // encontrar o menor número livre a partir de 1
    let candidate = 1
    while (used.has(candidate)) candidate++
    const code = formatNumber(candidate)
    try {
      await prisma.interview.update({ where: { id: it.id }, data: { code } })
      used.add(candidate)
      updates++
      console.log(`✔️  ${it.id.substring(0,8)}... -> ${code}`)
    } catch (e) {
      console.warn(`⚠️ Falha ao atualizar ${it.id}: ${e?.message || e}`)
    }
  }

  console.log(`\nConcluído. ${updates} entrevista(s) atualizada(s).`)
}

main()
  .catch((e) => {
    console.error('Erro no backfill:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
