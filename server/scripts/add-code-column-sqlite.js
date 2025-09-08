// Adiciona a coluna `code` e índice único parcial se não existirem (SQLite)
// Uso:
//   node scripts/add-code-column-sqlite.js /caminho/para/dev.db

import fs from 'fs'
import path from 'path'
import sqlite3 from 'sqlite3'

const dbPath = process.argv[2]
if (!dbPath) {
  console.error('Uso: node scripts/add-code-column-sqlite.js /caminho/para/dev.db')
  process.exit(1)
}

if (!fs.existsSync(dbPath)) {
  console.error(`Arquivo não encontrado: ${dbPath}`)
  process.exit(1)
}

const db = new sqlite3.Database(dbPath)

function run(sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, function (err) {
      if (err) return reject(err)
      resolve()
    })
  })
}

function all(sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, function (err, rows) {
      if (err) return reject(err)
      resolve(rows)
    })
  })
}

;(async () => {
  try {
    const rows = await all('PRAGMA table_info("interviews")')
    const hasCode = rows.some(r => r.name === 'code')
    if (!hasCode) {
      console.log('➕ Adicionando coluna code...')
      await run('ALTER TABLE "interviews" ADD COLUMN "code" TEXT')
    } else {
      console.log('✅ Coluna code já existe')
    }
    console.log('➕ Criando índice único parcial (se não existir)...')
    await run('CREATE UNIQUE INDEX IF NOT EXISTS "Interview_code_key" ON "interviews"("code") WHERE "code" IS NOT NULL')
    console.log('✅ Pronto:', dbPath)
  } catch (e) {
    console.error('❌ Erro ao atualizar schema:', e.message || e)
    process.exit(1)
  } finally {
    db.close()
  }
})()

