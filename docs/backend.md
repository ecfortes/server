# Backend (Express + PostgreSQL)

## Stack
- Node.js 20+, CommonJS.
- Express 4, cors, morgan.
- PostgreSQL via `pg` (`Pool` com SSL opcional).
- Sequelize CLI apenas para migrações em `server/migrations`.

## Estrutura
- `src/server.js` inicia HTTP na porta `PORT`.
- `src/app.js` registra middlewares e roteadores (`/api`).
- `src/db.js` encapsula pool, logging e helper `query/getClient`.
- `src/controllers/` regras de negócio e SQL:
  - `pallets.controller.js`
  - `packs.controller.js`
- `src/routes/` agrupa endpoints.
- `src/utils/parse.js` sanitiza números/bools.
- `src/utils/http.js` helpers de resposta (`badRequest`).

## Variaveis de Ambiente
- `PORT` porta HTTP (padrao 4000).
- `CLIENT_ORIGIN` CSV de origens permitidas.
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGSSLMODE`.
- `DATABASE_URL` ativa conexão única e ignora campos acima.
- Logging:
  - `SQL_LOG`: `true`|`false`.
  - `SQL_SLOW_MS`: ms mínimos para logar.
  - `SQL_PARAMS`: loga parâmetros JSON.

Arquivos de configuração:
- `.env.development` (padrão para `npm run dev`, inclui conexão local Docker).
- `.env.production` (template carregado quando `NODE_ENV=production` via `npm start`).
- `.env` pode ser usado para variáveis comuns às duas execuções.
- Em cenários sem domínio (uso via IP fixo), preencha `PGHOST`, `CLIENT_ORIGIN` e demais URLs com o endereço IP e porta correspondentes.

## Logging SQL
- `db.js` usa `cli-highlight` + `picocolors`.
- Header indica duração (`colorMs`), verbo (`verbColor`) e erros.
- Logs só aparecem quando `SQL_LOG` ativo e `duration >= SQL_SLOW_MS`.

## Convenções de Código
- Use `query(text, params)` com placeholders posicionais.
- Validações centralizadas em `parse.js` (`toInt`, `toNum`, `toBool`, `clamp`).
- Sempre `try/catch`; logar erro e responder `500` com mensagem genérica.
- Ao atualizar registros, atualize `updated_at` via trigger (`trg_set_updated_at`).

## Migrações
- Localizadas em `server/migrations`.
- Executar com `npx sequelize-cli db:migrate`.
- Arquivos cobrem:
  - Extensão `pg_trgm`.
  - Função `trg_set_updated_at`.
  - Tabelas `pallets`, `pack`.
  - Índices BTREE/GIN.
  - View `vw_pack_overview`.
  - Ajustes de chave primária e FKs.

## Scripts npm
- `npm run dev` usa `node src/server.js` (futuro: considerar nodemon).
- `npm start` define `NODE_ENV=production`.

## Erros e Status
- 400 `badRequest` para validações.
- 404 quando registro não existe.
- 500 para falhas inesperadas (log no servidor).
- `delete` retorna `{ ok: true }`.

## Health Check
- `GET /api/health` (arquivo `health.routes.js`) retorna `{ ok: true, time }`.
- Usar em monitoramento e readiness probes.

## Convenções de Deploy
- Copiar `.env` (ou usar variáveis de plataforma).
- Executar `npm install --production` + `npx sequelize-cli db:migrate`.
- Iniciar com `npm start` (porta 4000 por default).
- Configurar serviço reverso (Nginx/Ingress) com `CLIENT_ORIGIN` atualizado.
