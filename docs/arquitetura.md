# Arquitetura

## Visao Geral
- **Frontend SPA (client/)**: React + Vite, comunica via fetch com a API. Controla pallets, packs, packs orfaos e overview.
- **Backend API (server/)**: Express em CommonJS, rotas sob `/api`. Usa `pg` diretamente; Sequelize somente para migracoes DDL.
- **Banco de Dados**: PostgreSQL 16, rodando em Docker (compose) ou infra corporativa. Extensao `pg_trgm`, view `vw_pack_overview`.
- **Integracoes Industriais**: Fluxo Node-RED (arquivo JSON) que consome/produz dados para PLCs e esteiras DERSA.

```
React (client) --> HTTP REST --> Express (server) --> PostgreSQL
                                   |             \
                                   |              --> view / triggers / migracoes
                                   \
                                    --> Node-RED (integracao PLC) via HTTP/DB
```

## Componentes Principais
- **App.jsx**: coordena estado global (paginacao, selecao de pallet) e renderiza listas, detalhes e overview.
- **Controllers Express**: `pallets.controller.js` e `packs.controller.js` encapsulam SQL e regras de negocio.
- **Camada SQL**: consultas parametrizadas, pool do `pg` com logs coloridos via `cli-highlight`/`picocolors`.
- **Migrações**: arquivos em `server/migrations` configuram schema, índices, triggers e view material.
- **Node-RED Flow**: `node-red/dersa_nodered_2025-10-13.json` descreve blocos de integração OT/IT.

## Fluxos de Dados
1. **Cadastro de Pallet**
   - Usuário clica `+ New Pallet` no frontend.
   - App chama `POST /api/pallets` com `seq_pallet` (numérico).
   - API valida, cria registro e retorna payload completo; frontend recarrega lista e seleciona item.
2. **Packs por Pallet**
   - App consulta `GET /api/pallets/:id/packs` para mostrar packs vinculados.
   - Para packs sem vínculo o frontend usa `GET /api/packs/orphans`.
3. **Overview Operacional**
   - `GET /api/packs/overview` lê a view `vw_pack_overview` agregando dados para painel gerencial.
4. **Integracao Node-RED**
   - Fluxo Node-RED pode inserir packs órfãos (`POST /api/packs/orphans`) ou atualizar status conforme eventos de CLP.

## Dependencias e Configuracoes
- **Frontend**: React, ReactDOM, Vite. CSS modularizado via classes.
- **Backend**: express, cors, morgan, pg, cli-highlight, picocolors, sql-formatter.
- **Ferramentas**: Node 20+, npm 10+, Docker Compose, Sequelize CLI (apenas durante migração).

## Segurança e Controles
- CORS configurável via variavel `CLIENT_ORIGIN`.
- Nenhuma autenticação implementada (definir roadmap em `TODO.md` se necessário).
- Sanitização: consultas usam parâmetros posicionais (`$1`, `$2`) evitando SQL injection.
- Logs: controle por `SQL_LOG`, `SQL_SLOW_MS`, `SQL_PARAMS`.

## Observabilidade
- **Logs HTTP**: `morgan` no formato `dev`.
- **Logs SQL**: destaque sintático com duração, verbo e parâmetros.
- **Health Check**: `GET /api/health` retorna `{ ok, time }` para monitoração.

## Escalabilidade
- Pool `pg` com `max: 20` conexões; ajustar conforme carga.
- Índices GIN + BTREE permitem buscas por QR e ordenações. Avaliar estatísticas periodicamente.
- Triggers `trg_set_updated_at` mantêm `updated_at` sem lógica no aplicativo.
