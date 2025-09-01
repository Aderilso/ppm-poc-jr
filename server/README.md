# Servidor Backend - Sistema PPM

Backend para o sistema de pesquisa PPM com banco de dados SQLite e API REST.

## 🚀 Tecnologias

- **Node.js** + **Express**
- **SQLite** (banco de dados)
- **Prisma ORM** (mapeamento objeto-relacional)
- **CORS** (Cross-Origin Resource Sharing)

## 📊 Estrutura do Banco de Dados

### Tabelas

1. **interviews** - Entrevistas realizadas
   - Metadados (entrevistador, respondente, departamento)
   - Respostas dos formulários (F1, F2, F3)
   - Status de conclusão
   - Timestamps

2. **configs** - Configurações dos formulários
   - Estrutura das perguntas
   - Lookups para opções
   - Versões ativas/inativas

3. **analyses** - Análises geradas
   - Scores calculados
   - Insights e recomendações
   - Relacionamento com entrevistas

## 🛠 Instalação

```bash
# Entrar no diretório do servidor
cd server

# Instalar dependências
npm install

# Gerar cliente Prisma
npm run db:generate

# Executar migrações do banco
npm run db:migrate
```

## 🚀 Execução

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3001`

## 📡 Endpoints da API

### Entrevistas

- `POST /api/interviews` - Criar nova entrevista
- `GET /api/interviews` - Listar todas as entrevistas
- `GET /api/interviews/:id` - Buscar entrevista por ID
- `PUT /api/interviews/:id` - Atualizar entrevista
- `PUT /api/interviews/:id/answers` - Salvar respostas
- `PUT /api/interviews/:id/complete` - Completar entrevista
- `DELETE /api/interviews/:id` - Deletar entrevista

### Configurações

- `POST /api/configs` - Criar configuração
- `GET /api/configs` - Listar configurações ativas
- `GET /api/configs/active` - Buscar configuração ativa

### Análises

- `POST /api/analyses` - Criar análise
- `GET /api/analyses` - Listar todas as análises

### Estatísticas

- `GET /api/stats` - Estatísticas gerais do sistema

### Health Check

- `GET /api/health` - Status da API

## 🗄️ Gerenciamento do Banco

### Prisma Studio

```bash
# Abrir interface visual do banco
npm run db:studio
```

Acesse `http://localhost:5555` para visualizar e editar dados.

### Migrações

```bash
# Criar nova migração
npm run db:migrate

# Reverter migração
npx prisma migrate reset
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do servidor:

```env
# Porta do servidor
PORT=3001

# URL do banco SQLite
DATABASE_URL="file:./dev.db"

# Configurações CORS (opcional)
CORS_ORIGIN="http://localhost:5173"
```

### Banco de Dados

O banco SQLite será criado automaticamente em `./dev.db` na primeira execução.

## 📊 Monitoramento

### Logs

O servidor registra:
- Requisições recebidas
- Erros de validação
- Operações de banco de dados
- Status de saúde da API

### Métricas

A API fornece estatísticas em tempo real:
- Total de entrevistas
- Taxa de conclusão
- Médias de scores
- Análises geradas

## 🔒 Segurança

- **CORS** configurado para permitir requisições do frontend
- **Validação** de dados em todos os endpoints
- **Tratamento de erros** robusto
- **Sanitização** de inputs

## 🚀 Deploy

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm start
```

### Docker (opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔗 Integração com Frontend

O frontend se conecta automaticamente ao backend através da API REST. Em caso de indisponibilidade do backend, o sistema funciona em modo offline usando localStorage.

## 📝 Notas

- O banco SQLite é adequado para desenvolvimento e pequenas aplicações
- Para produção com muitos usuários, considere migrar para PostgreSQL ou MySQL
- O sistema suporta modo offline/online híbrido
- Todas as operações são transacionais e seguras

---

**Desenvolvido para o Sistema de Pesquisa PPM**
