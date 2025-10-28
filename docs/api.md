# API REST

Prefixo padrao: `/api`.

## Padroes Gerais
- Respostas JSON.
- Erros retornam `{ "error": "mensagem" }` e status correspondente.
- Paginacao usa `limit` (1..200) e `offset >= 0`.
- Datas `created_at/updated_at` em formato ISO.

## Health
### `GET /api/health`
- **Sucesso (200)** `{ "ok": true, "time": "2025-10-23T15:00:00.000Z" }`

## Pallets
### `GET /api/pallets`
- **Query** `limit`, `offset`, `search` (busca por `qr_code`).
- **Sucesso (200)** `{ "items": [ ... ], "total": 120, "limit": 20, "offset": 0, "order": "created_at" }`
- `items[]` campos: `id`, `created_at`, `updated_at`, `qr_code`, `completed`, `num_doca`, `seq_pallet`, `station`.

### `GET /api/pallets/:id`
- **Sucesso (200)** objeto pallet.
- **Erros**: `404` se não encontrado.

### `POST /api/pallets`
- **Body**
```json
{
  "seq_pallet": 1728234567,
  "qr_code": "PALLET-ABC",
  "completed": false,
  "num_doca": 12,
  "station": 3
}
```
- `seq_pallet` obrigatorio (numeric). Restante opcional.
- **Sucesso (201)** objeto criado.
- **Erros**:
  - `400` `seq_pallet must be numeric`
  - `400` `seq_pallet must be unique`

### `PUT /api/pallets/:id`
- **Body** campos a atualizar (todos opcionais). Validacoes:
  - `num_doca` inteiro ou null.
  - `seq_pallet` numerico ou null.
  - `station` inteiro ou null.
- **Sucesso (200)** objeto atualizado.
- **Erros**: `400` mensagem de validacao; `404` quando inexistente.

### `DELETE /api/pallets/:id`
- Remove pallet e packs vinculados (transacao).
- **Sucesso (200)** `{ "ok": true }`.
- **Erros**: `404` quando inexistente.

### `GET /api/pallets/:id/packs`
- **Query** `limit`, `offset`.
- Retorna packs vinculados ao pallet (`JOIN` via `seq_pallet`).
- **Sucesso (200)** `{ "items": [ ... ], "total": X, "limit": L, "offset": O }`.

### `POST /api/pallets/:id/packs`
- Cria pack vinculado (usa `seq_pallet` do pallet).
- **Body** (todos opcionais exceto `seq_pack` quando quiser garantir):
```json
{
  "qr_code": "PACK-123",
  "orig": 1,
  "seq_pack": 9812734,
  "lastpack": false,
  "pospallet": 3,
  "robot_num": 7
}
```
- **Sucesso (201)** objeto pack criado.
- **Erros**: `404` pallet inexistente; `400` quando parsing falha.

## Packs (geral)
### `PUT /api/packs/:id`
- Atualiza qualquer campo (`qr_code`, `seq_pallet`, `orig`, `seq_pack`, `lastpack`, `pospallet`, `robot_num`).
- Validacoes iguais às dos controllers (`toInt`, `toNum`, `toBool`).
- **Sucesso (200)** objeto atualizado.
- **Erros**: `400` (dados invalidos), `404`.

### `DELETE /api/packs/:id`
- **Sucesso (200)** `{ "ok": true }`.
- **Erros**: `404`.

## Packs Orfaos
### `GET /api/packs/orphans`
- Lista packs com `seq_pallet IS NULL`.
- **Query** `limit`, `offset`, `search` (`qr_code`).
- **Sucesso (200)** `{ "items": [ ... ], "total": X, "limit": L, "offset": O }`.

### `POST /api/packs/orphans`
- Cria pack sem `seq_pallet`.
- **Body exemplo**
```json
{
  "qr_code": "ORF-7890",
  "orig": 11,
  "seq_pack": 5556677,
  "lastpack": false,
  "pospallet": null,
  "robot_num": 4
}
```
- `seq_pack` obrigatorio (numerico).
- `orig`, `pospallet`, `robot_num` aceitam null ou inteiro.
- Se `orig` não informado, sistema tenta extrair dos primeiros dígitos do `qr_code`.
- **Sucesso (201)** objeto criado.
- **Erros**: `400` mensagens de validacao.

## Pack Overview
### `GET /api/packs/overview`
- Lê view `public.vw_pack_overview`.
- **Query**
  - `limit` (1..200)
  - `offset`
  - `search` aplica `ILIKE` em `idea_ean`, `iden_pallet` ou `ot`.
- **Resposta (200)**
```json
{
  "items": [
    {
      "fecha": "2025-10-23",
      "hora": "14:32:11",
      "idea_ean": "7891234567890",
      "origem_enfardadeira": 1,
      "ot": "912345",
      "iden_robot": 3,
      "iden_pallet": "PALLET-001",
      "palet_completo": true,
      "destino_muelle": 5
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

## Respostas de Erro
- `400` JSON: `{ "error": "mensagem", "details": opcional }`
- `404` JSON: `{ "error": "Pallet not found" }`
- `500` JSON: `{ "error": "Failed to ..." }` (mensagens genericas, detalhes só em log).
