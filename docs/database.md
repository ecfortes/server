# Banco de Dados

PostgreSQL 16 (imagem oficial). Todas as migrações estão em `server/migrations`.

## Esquema

### Tabela `pallets`
| Coluna      | Tipo     | Detalhe                                      |
|-------------|----------|----------------------------------------------|
| `seq_pallet`| DECIMAL  | **Primary Key** (migração 20251023161500)    |
| `id`        | BIGINT   | Auto incremento legado (não usado como PK)   |
| `created_at`| TIMESTAMP| default `now()`                              |
| `updated_at`| TIMESTAMP| mantido via trigger `trg_set_updated_at`     |
| `qr_code`   | TEXT     | código lido                                 |
| `completed` | BOOLEAN  | indica pallet completo                      |
| `num_doca`  | INTEGER  | destino de doca                             |
| `station`   | INTEGER  | estação de origem                           |

Índices:
- `idx_pallets_created_at` (BTREE DESC).
- `idx_pallets_qr_code_trgm` (GIN `pg_trgm`).

### Tabela `pack`
| Coluna      | Tipo     | Detalhe                                      |
|-------------|----------|----------------------------------------------|
| `id`        | BIGINT   | Auto incremento                              |
| `created_at`| TIMESTAMP| default `now()`                              |
| `updated_at`| TIMESTAMP| trigger `trg_set_updated_at`                 |
| `qr_code`   | TEXT     | Idea/EAN                                    |
| `orig`      | INTEGER  | origem da enfardadeira                      |
| `seq_pallet`| DECIMAL  | FK opcional para `pallets.seq_pallet`       |
| `seq_pack`  | DECIMAL  | Unique (`pack_seq_pack_uk`)                  |
| `lastpack`  | BOOLEAN  | identifica ultimo pack do pallet            |
| `pospallet` | INTEGER  | posicao no pallet                           |
| `robot_num` | INTEGER  | identificador do robot                      |

Índices:
- `idx_pack_created_at` (BTREE DESC).
- `idx_pack_qr_code_trgm` (GIN).
- `idx_pack_seq_pallet` (BTREE).
- `idx_pack_seq_pallet_created_at` (BTREE composto).

### Função `public.trg_set_updated_at`
Atualiza `NEW.updated_at` com `now()` em triggers `BEFORE UPDATE` (aplicadas a `pallets` e `pack`).

### View `public.vw_pack_overview`
Combina `pack` + `pallets` para fornecer campos:
- `fecha` / `hora`
- `idea_ean`
- `origem_enfardadeira`
- `ot` (substring do QR quando >= 10 chars)
- `iden_robot`
- `iden_pallet`
- `palet_completo`
- `destino_muelle`

### Extensão
- `pg_trgm` instalada para suportar `ILIKE` com índices GIN.

## Migrações Notáveis
1. `20251022120000-enable-pgtrgm` cria extensão.
2. `20251022120100-create-updated-at-function` (função trigger).
3. `20251022120200-create-pallets-and-pack` tabelas base.
4. `20251022120300-indexes-and-triggers` índices + triggers.
5. `20251022120400-view-vw-pack-overview` view SQL.
6. `20251023161500-set-seq-pallet-as-primary` promove `seq_pallet` a PK.
7. `20251023162000-update-pack-fk-delete-restrict` ajusta `ON DELETE RESTRICT`.

## Operacoes Comuns
- **Aplicar migrações**: `cd server && npx sequelize-cli db:migrate`.
- **Rollback último passo**: `npx sequelize-cli db:migrate:undo`.
- **Limpar tudo**: `db:migrate:undo:all` (atenção, remove schema).

## Politicas de Integridade
- `seq_pallet` único garante vinculo 1:N.
- FK pack → pallets com `ON UPDATE CASCADE` e `ON DELETE RESTRICT` (evita apagar pallet se houver packs vinculados; API lida apagando manualmente).
- Unicidade `seq_pack` impede duplicidade de leitura PLC.

## Manutencao
- Reindexar GIN quando base crescer (usar `REINDEX INDEX idx_pack_qr_code_trgm`).
- Atualizar estatísticas: `ANALYZE pack; ANALYZE pallets;`.
- Monitorar tamanho do volume Docker `pgdata`.

## Backups
- Sugestão: `pg_dump -Fc -h localhost -p 35432 -U zegla zegla > backups/YYYY-MM-DD.dump`.
- Restaurar: `pg_restore -c -d zegla backups/arquivo.dump`.
