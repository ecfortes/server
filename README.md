# Pallet & Pack Manager

> README disponível em **Português** e **Español**.

---

## 🇧🇷 Português

Aplicação full-stack (React + Express + PostgreSQL) para cadastrar, consultar e atualizar informações de paletes (`pallets`) e packs (`pack`).  
A interface web oferece pesquisa com paginação, edição inline/modais e visões dedicadas para packs órfãos (sem `seq_pallet`).  
A **API não usa ORM em runtime**: o **Sequelize é utilizado apenas para migrações (DDL)** — criação do schema, índices, views e triggers.

---

## ⚙️ Stack e Estrutura

- `client/` → React + Vite, CSS puro e componentes customizados.  
- `server/` → Express com `pg`, `morgan`, `cors` e log colorido de queries SQL.  
- `server/src/db/migrations/` → Migrações do **Sequelize (somente DDL)**.  
- `docker compose/` → Contém `docker-compose.yml` para PostgreSQL local.  
- `sql/` → Scripts auxiliares e dumps de banco.  
- `node-red/` → Fluxos JSON para integração externa.

```
root/
  client/
  server/
    config/config.js        # Config Sequelize CLI (CommonJS)
    .sequelizerc            # Caminhos de migrations/seeders
    src/
      db/
        migrations/         # Migrações do Sequelize (DDL)
      controllers/
      routes/
      utils/
  docker compose/
  sql/
  node-red/
```

---

## 🧩 Sequelize (usado **somente** para criar DB e schema)

> O Sequelize CLI é usado apenas para **migrações estruturais (DDL)**.  
> Nenhum model Sequelize é utilizado em runtime.  
> A aplicação utiliza o pacote `pg` diretamente via pool de conexões.

### 📦 Dependências (dev)

```bash
cd server
npm i -D sequelize sequelize-cli dotenv
npm i -D pg pg-hstore
```

### 🧱 Configuração do CLI

**`server/config/config.js`**
```js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const sslmode = (process.env.PGSSLMODE || '').toLowerCase();
const useSSL = sslmode && sslmode !== 'disable';

module.exports = {
  development: {
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD ? String(process.env.PGPASSWORD) : null,
    database: process.env.PGDATABASE || 'postgres',
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  },
};
```

**`server/.sequelizerc`**
```js
const path = require('path');

module.exports = {
  'config': path.resolve('config/config.js'),
  'migrations-path': path.resolve('src/db/migrations'),
  'seeders-path': path.resolve('src/db/seeders'),
};
```

### 🌱 Variáveis `.env`

```
PGHOST=localhost
PGPORT=35432
PGUSER=zegla
PGPASSWORD=zg1982
PGDATABASE=zegla
PGSSLMODE=disable

PORT=4000
CLIENT_ORIGIN=http://localhost:5173
SQL_LOG=true
SQL_SLOW_MS=0
SQL_PARAMS=true
```

### 🛠️ Comandos úteis

```bash
npx sequelize-cli db:migrate           # aplica migrações
npx sequelize-cli db:migrate:status    # mostra status
npx sequelize-cli db:migrate:undo      # desfaz última
npx sequelize-cli db:migrate:undo:all  # desfaz todas
```

---

## 🗃️ Migrações criam:

- Extensão **pg_trgm**
- Função **`public.trg_set_updated_at()`**
- Tabelas **`pallets`** e **`pack`**
- Triggers automáticas de `updated_at`
- Índices BTREE e GIN (`gin_trgm_ops`)
- View **`public.vw_pack_overview`**

> As migrações estão em `server/src/db/migrations` e podem ser executadas localmente ou via CI/CD.

---

## ⚡ Setup Rápido em Desenvolvimento

### 🐘 Banco de Dados
```bash
cd "docker compose"
docker compose up -d
```
- Usuário/senha: `zegla` / `zg1982`
- Banco: `zegla`
- Porta local: `35432`

### 🔧 API (Backend)
```bash
cd server
cp .env.example .env
npm install
npx sequelize-cli db:migrate
npm run dev
```
- A API estará em **http://localhost:4000**
- Rota de saúde: `/api/health`
- Não há models Sequelize em runtime, apenas SQL manual via `pg`.

### 💻 Frontend
```bash
cd client
npm install
npm run dev
```
- Endereço padrão: **http://localhost:5173**
- Ajuste `CLIENT_ORIGIN` no `.env` do server para liberar CORS.

---

## ⚙️ Scripts npm úteis

| Comando | Descrição |
|----------|------------|
| `server npm run dev` | Inicia Express em modo desenvolvimento |
| `server npm start` | Inicia em modo produção |
| `server npx sequelize-cli db:migrate` | Executa migrações (DDL) |
| `client npm run dev` | Inicia Vite com HMR |
| `client npm run build` | Gera bundle estático para produção |

---

## 🌍 Variáveis de Ambiente (Backend)

| Variável | Descrição |
|-----------|------------|
| `PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PGSSLMODE` | Configuração de conexão PostgreSQL |
| `PORT` | Porta da API (default 4000) |
| `CLIENT_ORIGIN` | Origens permitidas (CORS) |
| `SQL_LOG` | Ativa/desativa log detalhado de queries |
| `SQL_SLOW_MS` | Tempo mínimo (ms) para logar queries |
| `SQL_PARAMS` | Exibe parâmetros no log SQL |

---

## 🔗 Endpoints Principais (prefixo `/api`)

- `GET /health`
- `GET /pallets?limit&offset&search`
- `GET /pallets/:id`
- `POST /pallets`
- `PUT /pallets/:id`
- `DELETE /pallets/:id`
- `GET /pallets/:id/packs`
- `GET /packs/orphans`
- `POST /pallets/:id/packs`
- `POST /packs`
- `PUT /packs/:id`
- `DELETE /packs/:id`
- `GET /packs/overview`

---

## 🧠 Interface Web (client/src)

- Lista paginada de pallets com busca por QR code e `seq_pallet`
- Edição e exclusão com confirmação
- Packs vinculados ao pallet
- Painel de packs órfãos (`seq_pallet = null`)
- “Pack Overview” com agregados
- Indicador de status da API (`/api/health`)

---

## 🧾 SQL Auxiliar

Scripts adicionais em `sql/` para criação manual de estruturas.

```sql
ALTER TABLE pallets ADD CONSTRAINT pallets_seq_pallet_unique UNIQUE (seq_pallet);
ALTER TABLE pack
  ADD CONSTRAINT pack_seq_pallet_fk
  FOREIGN KEY (seq_pallet) REFERENCES pallets (seq_pallet)
  ON UPDATE CASCADE ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_pallets_created_at ON pallets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pack_seq_pallet ON pack (seq_pallet);
```

---

## 🧩 Fluxo Node-RED

O arquivo `node-red/dersa_nodered_2025-10-13.json` contém o fluxo de integração utilizado para comunicação com CLPs/esteiras.  
Importe o JSON no Node-RED para reproduzir os fluxos de leitura/escrita.

---

## 🧯 Solução de Problemas

- **API não conecta:** verifique `PG*` no `.env` e se o PostgreSQL está em `localhost:35432`.  
- **CORS bloqueado:** alinhe `CLIENT_ORIGIN` com a URL do frontend.  
- **Queries lentas:** defina `SQL_SLOW_MS=200` para logar queries demoradas.

---

## ✅ Conclusão

Com essas instruções, o ambiente fica pronto para desenvolvimento local, demos internas e integração com sistemas externos (Dersa/ZIA).  
O **Sequelize** é usado **somente** para criação de schema (migrações), enquanto o acesso aos dados é feito diretamente com **pg** e SQL puro.
