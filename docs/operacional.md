# Operacional

## Setup de Desenvolvimento
1. **Clonar repositório**.
2. **Subir banco**: `cd "docker compose" && docker compose up -d`.
3. **Backend**:
   ```bash
   cd server
   cp .env.example .env   # ajustar credenciais se necessario
   npm install
   npx sequelize-cli db:migrate
   npm run dev
   ```
4. **Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
5. Acessar `http://localhost:5173` e confirmar status verde em `DatabaseConnection`.

## Deploy (baseline)
1. Construir container ou usar Node direto.
2. Definir variáveis de ambiente (usar secrets).
3. Executar `npm install --production` e `npx sequelize-cli db:migrate`.
4. Iniciar com `npm start`.
5. Configurar reverse proxy -> `/api/*` (CORS liberado via `CLIENT_ORIGIN`).

## Migracoes
- Executar sempre que atualizar branch principal.
- Registrar resultado no change-log interno (se houver).
- Para ambientes produtivos:
  1. Backup antes (`pg_dump`).
  2. Aplicar migração.
  3. Rodar smoke test (`GET /api/health`, listar pallets).

## Logs e Monitoramento
- **API**: stdout com `morgan` (`dev`) + logs SQL. Coletar via stack ELK ou journald.
- **Banco**: utilizar `docker logs pg1` ou ferramentas de observabilidade.
- **Node-RED**: monitorar métricas no dashboard do Node-RED.
- **Health**: monitor externo chamando `/api/health` (timeout < 5s).

## Backup e Restauração
- Script sugerido:
  ```bash
  pg_dump -Fc -h localhost -p 35432 -U zegla zegla > backups/$(date +%F).dump
  ```
- Restaurar:
  ```bash
  pg_restore -c -h localhost -p 35432 -U zegla -d zegla backups/2025-10-22.dump
  ```
- Automatizar via cron no servidor de banco.

## Solucao de Problemas
- **API nao conecta**: verificar container `pg1`, conferir `.env`.
- **Erro CORS**: atualizar `CLIENT_ORIGIN` (CSV) e reiniciar API.
- **Lentidao**: definir `SQL_SLOW_MS=200` para identificar queries lentas.
- **FK impede exclusao**: API deleta packs primeiro; se usar SQL manual remova dependencias antes.
- **Falha em migracao**: rodar `npx sequelize-cli db:migrate:status`, aplicar `undo` e corrigir.

## Checklists
- **Antes de subir PR**:
  - Rodar `npm run build` no client.
  - Testar endpoints críticos (`pallets`, `packs`, `overview`).
  - Atualizar documentação relacionada.
- **Antes de deploy**:
  - Backup recente validado.
  - `.env` atualizado e seguro.
  - Node-RED sincronizado (importar fluxo se houve alteração).

## Pendencias (link com TODO.md)
- Rotina de limpeza automática 6 meses.
- Sincronizar `lastpack` com saída do pallet.
- Integração PLC → API para registrar número do caminhão.
- Avaliar estação de input manual e eventos OPC-UA.

## Roadmap Sugerido
1. Implementar autenticação (JWT ou proxy corporativo).
2. Adicionar testes automatizados (Jest para controllers).
3. Casar Node-RED com API (webhook dedicado).
4. Observabilidade (Prometheus + Grafana ou semelhante).
