# Integracao Node-RED

## Arquivos
- `node-red/dersa_nodered_2025-10-13.json` export completo do fluxo.
- `node-red/README.md` placeholder (atualizar conforme evolucao).

## Requisitos
- Node-RED 3.x.
- Acesso HTTP à API (`/api/packs/orphans`, `/api/packs/:id`, etc).
- Credenciais e variáveis de ambiente alinhadas com o ambiente (dev/prod).

## Importacao do Fluxo
1. Abra editor Node-RED.
2. Menu hambúrguer → `Import`.
3. Cole o conteúdo do arquivo JSON ou use `Select a file`.
4. Confirme `Import`.
5. Ajuste credenciais em nós HTTP (tokens, URLs).
6. Deploy.

## Configuracoes Padrao
- **Endpoints**: apontar para `VITE_API_BASE` equivalente (ex: `http://localhost:4000/api/...`).
- **Timeout**: sugerido <= 5s para detectar indisponibilidade rápido.
- **Retry**: configurar `catch`/`status` nodes para retentativas ou alarmes.
- **DB**: alguns fluxos podem acessar PostgreSQL direto (validar antes de habilitar).

## Boas Praticas
- Versionar fluxo sempre que alterar (renomear arquivo com data `YYYY-MM-DD`).
- Documentar variáveis externas (por exemplo, chaves de API, IPs de PLC).
- Utilizar `env vars` do Node-RED para URLs em vez de hardcode.
- Configurar `contextStorage` persistente para contadores críticos.

## Monitoracao
- Habilitar `system nodes` para enviar métricas (CPU, memória).
- Criar alertas quando requisições à API falharem repetidamente (`status` node).
- Registrar logs em syslog/ELK se disponível.

## Teste em Sandbox
- Antes de publicar em produção, importar fluxo em instância de homologação.
- Apontar para base de dados de teste (ou cópia isolada).
- Validar caminhos críticos: inserção de packs órfãos, atualizações em pallets.

## Checklist de Atualizacao
1. Atualizar arquivo JSON com nova data.
2. Notificar time backend caso endpoints mudem.
3. Revisar documentação neste arquivo (passos e integrações afetadas).
4. Fazer backup do fluxo anterior (export e armazenar).
