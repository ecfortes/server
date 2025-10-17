# Pallet & Pack Manager

> README disponível em Português e Español.

## Português

Aplicacao full-stack (React + Express + PostgreSQL) para cadastrar, consultar e atualizar informacoes de paletes (`pallets`) e packs (`pack`). A interface web oferece pesquisa com paginacao, edicao inline/modais e visoes dedicadas para packs orfaos (sem `seq_pallet`). A API valida entradas, aplica logs SQL detalhados e protege o banco via pool seguro de conexoes.

### Stack e estrutura
- `client/` React + Vite, CSS puro e componentes customizados.
- `server/` Express com `pg`, morgan, cors e log colorido de queries.
- `docker compose/` docker-compose.yml para subir PostgreSQL local rapidamente.
- `sql/` scripts de schema/dump para iniciar ou popular o banco.
- `node-red/` fluxo exportado (JSON) utilizado em integracoes externas.

```
root/
  client/           # interface ZIA - Pallet & Pack Overview
  server/           # API REST em Node.js
  docker compose/   # PostgreSQL 16 via Docker
  sql/              # scripts auxiliares e dumps
  node-red/         # fluxo Node-RED de apoio
```

### Pre-requisitos
- Node.js 18+ (testado com npm).
- PostgreSQL 15+ ou Docker Desktop para usar o compose incluso.
- Porta 4000 livre para a API e 5173 para o frontend (padroes Vite).

### Setup rapido em desenvolvimento
1. **Banco de dados**
   ```bash
   cd "docker compose"
   docker compose up -d
   ```
   - Usuario/senha padrao: `zegla` / `zg1982`.
   - Banco padrao: `zegla`.
   - A porta local exposta e 35432.
   - Opcional: importe `sql/pallets.sql` e `sql/pack.sql` para criar estrutura basica ou use o dump `sql/dump-zegla-*.sql`.

2. **API (backend)**
   ```bash
   cd server
   cp .env.example .env       # ajuste DATABASE_URL e CLIENT_ORIGIN
   npm install
   npm run dev                # inicia em http://localhost:4000
   ```
   - A API sobe com rota de saude em `/api/health`.
   - Variavel `DATABASE_URL` aceita string completa de conexao ou variaveis PG*.
   - Logs SQL detalhados podem ser controlados com `SQL_LOG`, `SQL_SLOW_MS` e `SQL_PARAMS`.

3. **Frontend**
   ```bash
   cd client
   npm install
   npm run dev                # http://localhost:5173
   ```
   - Configure `server/.env` com `CLIENT_ORIGIN=http://localhost:5173` para liberar CORS.
   - Em producao, utilize `npm run build` e sirva o `dist/` (Vite).

### Scripts npm uteis
- `server npm run dev` -> roda Express em modo desenvolvimento.
- `server npm start` -> modo producao (NODE_ENV=production).
- `client npm run dev` -> inicia Vite com HMR.
- `client npm run build` -> gera bundle estatico.

### Variaveis de ambiente do backend
- `DATABASE_URL` -> string de conexao PostgreSQL.
- `CLIENT_ORIGIN` -> lista separada por virgula de origens permitidas (CORS).
- `PORT` -> porta HTTP (default 4000).
- `SQL_LOG` -> `true`/`false` para habilitar logs (ativa por padrao fora de producao).
- `SQL_SLOW_MS` -> loga apenas queries iguais ou acima do tempo informado (ms).
- `SQL_PARAMS` -> `true` para registrar parametros das queries.

### Principais endpoints (prefixo /api)
- `GET /health` -> status da API e conexao com o banco.
- `GET /pallets?limit&offset&search` -> retorna `{ items, total, limit, offset }`.
- `GET /pallets/:id` -> detalha um pallet.
- `POST /pallets` -> cria novo pallet (exige `seq_pallet` unico).
- `PUT /pallets/:id` -> atualiza campos editaveis.
- `DELETE /pallets/:id` -> remove pallet e packs associados.
- `GET /pallets/:id/packs?limit&offset` -> lista packs vinculados ao pallet.
- `GET /packs/orphans?limit&offset` -> lista packs com `seq_pallet` nulo.
- `POST /pallets/:id/packs` -> cria pack vinculado ao `seq_pallet` do pallet.
- `POST /packs` -> cria pack orfao (seq_pallet nulo).
- `PUT /packs/:id` -> atualiza pack.
- `DELETE /packs/:id` -> exclui pack.

> Veja `server/src/controllers/*.js` para validacoes detalhadas, mascaras e mensagens de erro.

### Interface web (client/src)
- Lista paginada de pallets com busca por QR code e `seq_pallet`.
- Formulario completo para editar dados do pallet e remover registros.
- Tabela de packs ligados ao pallet selecionado com paginacao, edicao e delecao.
- Painel dedicado a packs orfaos (`seq_pallet = null`) com botao `+ Add Pack`.
- Cartao "Pack Overview" oferecendo indicadores agregados (total, ultimas atualizacoes).
- Badge de status da API (DatabaseConnection) que consome `/api/health`.
- Confirmacoes modais para operacoes destrutivas (delete pallet/pack).

### Dados e suporte SQL
- `sql/pallets.sql` e `sql/pack.sql` criam as tabelas base e constraints essenciais.
- O bloco abaixo adiciona constraints e indices recomendados:
  ```sql
  ALTER TABLE pallets ADD CONSTRAINT pallets_seq_pallet_unique UNIQUE (seq_pallet);
  ALTER TABLE pack
    ADD CONSTRAINT pack_seq_pallet_fk
    FOREIGN KEY (seq_pallet) REFERENCES pallets (seq_pallet)
    ON UPDATE CASCADE ON DELETE CASCADE;
  CREATE INDEX IF NOT EXISTS idx_pallets_created_at ON pallets (created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_pallets_qr_code ON pallets (qr_code);
  CREATE INDEX IF NOT EXISTS idx_pack_seq_pallet ON pack (seq_pallet);
  CREATE INDEX IF NOT EXISTS idx_pack_qr_code ON pack (qr_code);
  ```

### Fluxo Node-RED
- `node-red/dersa_nodered_2025-10-13.json` contem o fluxo exportado utilizado para integracao com CLPs/esteiras. Importe o JSON no editor Node-RED para reproduzir os fluxos de leitura/escrita.

### Resolucao de problemas rapidos
- **API nao conecta**: confirme `DATABASE_URL`, se o banco esta em `localhost:35432` (compose) e se o usuario possui permissao.
- **CORS bloqueado**: alinhe `CLIENT_ORIGIN` com a URL real do frontend (localhost, IP da rede, etc.).
- **Queries lentas**: habilite `SQL_SLOW_MS=200` (por exemplo) para identificar gargalos no log.

Pronto! Com isso o ambiente fica pronto para demos, testes locais ou integracoes com outros sistemas da Dersa/ZIA.

## Español

Aplicación full-stack (React + Express + PostgreSQL) para registrar, consultar y actualizar información de pallets (`pallets`) y packs (`pack`). La interfaz web ofrece búsqueda con paginación, edición inline/modales y vistas dedicadas para packs huérfanos (sin `seq_pallet`). La API valida entradas, aplica logs SQL detallados y protege la base mediante un pool seguro de conexiones.

### Stack y estructura
- `client/` React + Vite, CSS puro y componentes personalizados.
- `server/` Express con `pg`, morgan, cors y log coloreado de queries.
- `docker compose/` docker-compose.yml para levantar PostgreSQL local rápidamente.
- `sql/` scripts de schema/dump para iniciar o poblar la base.
- `node-red/` flujo exportado (JSON) utilizado en integraciones externas.

```
root/
  client/           # interfaz ZIA - Pallet & Pack Overview
  server/           # API REST en Node.js
  docker compose/   # PostgreSQL 16 vía Docker
  sql/              # scripts auxiliares y dumps
  node-red/         # flujo Node-RED de apoyo
```

### Requisitos previos
- Node.js 18+ (probado con npm).
- PostgreSQL 15+ o Docker Desktop para usar el compose incluido.
- Puerto 4000 libre para la API y 5173 para el frontend (valores por defecto de Vite).

### Configuración rápida en desarrollo
1. **Base de datos**
   ```bash
   cd "docker compose"
   docker compose up -d
   ```
   - Usuario/contraseña por defecto: `zegla` / `zg1982`.
   - Base de datos predeterminada: `zegla`.
   - El puerto expuesto localmente es 35432.
   - Opcional: importa `sql/pallets.sql` y `sql/pack.sql` para crear la estructura básica o usa el dump `sql/dump-zegla-*.sql`.

2. **API (backend)**
   ```bash
   cd server
   cp .env.example .env       # ajusta DATABASE_URL y CLIENT_ORIGIN
   npm install
   npm run dev                # inicia en http://localhost:4000
   ```
   - La API expone una ruta de health-check en `/api/health`.
   - La variable `DATABASE_URL` acepta la cadena completa de conexión o variables PG*.
   - Los logs SQL detallados se controlan con `SQL_LOG`, `SQL_SLOW_MS` y `SQL_PARAMS`.

3. **Frontend**
   ```bash
   cd client
   npm install
   npm run dev                # http://localhost:5173
   ```
   - Configura `server/.env` con `CLIENT_ORIGIN=http://localhost:5173` para habilitar CORS.
   - En producción, utiliza `npm run build` y sirve el contenido de `dist/` (Vite).

### Scripts npm útiles
- `server npm run dev` -> ejecuta Express en modo desarrollo.
- `server npm start` -> modo producción (NODE_ENV=production).
- `client npm run dev` -> inicia Vite con HMR.
- `client npm run build` -> genera el bundle estático.

### Variables de entorno del backend
- `DATABASE_URL` -> cadena de conexión PostgreSQL.
- `CLIENT_ORIGIN` -> lista separada por comas de orígenes permitidos (CORS).
- `PORT` -> puerto HTTP (por defecto 4000).
- `SQL_LOG` -> `true`/`false` para habilitar logs (activo por defecto fuera de producción).
- `SQL_SLOW_MS` -> registra solo queries con tiempo igual o superior al configurado (ms).
- `SQL_PARAMS` -> `true` para incluir parámetros de las queries en los logs.

### Endpoints principales (prefijo /api)
- `GET /health` -> estado de la API y conexión con la base.
- `GET /pallets?limit&offset&search` -> retorna `{ items, total, limit, offset }`.
- `GET /pallets/:id` -> detalla un pallet.
- `POST /pallets` -> crea un nuevo pallet (requiere `seq_pallet` único).
- `PUT /pallets/:id` -> actualiza campos editables.
- `DELETE /pallets/:id` -> elimina el pallet y sus packs asociados.
- `GET /pallets/:id/packs?limit&offset` -> lista packs vinculados al pallet.
- `GET /packs/orphans?limit&offset` -> lista packs con `seq_pallet` nulo.
- `POST /pallets/:id/packs` -> crea un pack vinculado al `seq_pallet` del pallet.
- `POST /packs` -> crea un pack huérfano (seq_pallet nulo).
- `PUT /packs/:id` -> actualiza un pack.
- `DELETE /packs/:id` -> elimina un pack.

> Consulta `server/src/controllers/*.js` para validaciones detalladas, máscaras y mensajes de error.

### Interfaz web (client/src)
- Lista paginada de pallets con búsqueda por código QR y `seq_pallet`.
- Formulario completo para editar datos del pallet y eliminar registros.
- Tabla de packs ligados al pallet seleccionado con paginación, edición y eliminación.
- Panel dedicado a packs huérfanos (`seq_pallet = null`) con botón `+ Add Pack`.
- Tarjeta "Pack Overview" con indicadores agregados (total, últimas actualizaciones).
- Badge de estado de la API (DatabaseConnection) que consume `/api/health`.
- Confirmaciones modales para operaciones destructivas (eliminar pallet/pack).

### Datos y soporte SQL
- `sql/pallets.sql` y `sql/pack.sql` crean las tablas base y constraints esenciales.
- El bloque siguiente agrega constraints e índices recomendados:
  ```sql
  ALTER TABLE pallets ADD CONSTRAINT pallets_seq_pallet_unique UNIQUE (seq_pallet);
  ALTER TABLE pack
    ADD CONSTRAINT pack_seq_pallet_fk
    FOREIGN KEY (seq_pallet) REFERENCES pallets (seq_pallet)
    ON UPDATE CASCADE ON DELETE CASCADE;
  CREATE INDEX IF NOT EXISTS idx_pallets_created_at ON pallets (created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_pallets_qr_code ON pallets (qr_code);
  CREATE INDEX IF NOT EXISTS idx_pack_seq_pallet ON pack (seq_pallet);
  CREATE INDEX IF NOT EXISTS idx_pack_qr_code ON pack (qr_code);
  ```

### Flujo Node-RED
- `node-red/dersa_nodered_2025-10-13.json` contiene el flujo exportado utilizado para integración con CLPs/cintas. Importa el JSON en el editor Node-RED para reproducir los flujos de lectura/escritura.

### Resolución rápida de problemas
- **La API no conecta**: verifica `DATABASE_URL`, si la base está en `localhost:35432` (compose) y si el usuario tiene permisos.
- **CORS bloqueado**: alinea `CLIENT_ORIGIN` con la URL real del frontend (localhost, IP de la red, etc.).
- **Queries lentas**: habilita `SQL_SLOW_MS=200` (por ejemplo) para identificar cuellos de botella en el log.

¡Listo! Con esto el entorno queda preparado para demos, pruebas locales o integraciones con otros sistemas de Dersa/ZIA.
