# Frontend (React + Vite)

## Stack
- React 18 (hooks).
- Vite como bundler/dev server.
- CSS modularizado manualmente (`styles.css` + classes por componente).
- Fetch API nativa (helper `src/api.js`).

## Estrutura
- `main.jsx` monta `<App />` e importa `styles.css`.
- `App.jsx` gerencia estado global:
  - Lista e selecao de pallets.
  - Paginacao (`limit`, `offset`).
  - Erros e carregamento.
  - Dialogos de confirmacao.
  - Renderiza `PalletList`, `PalletDetails`, `PackList`, `OrphanList`, `PackOverview`.
- `api.js` centraliza chamadas HTTP (prefixo `VITE_API_BASE`).
- `components/`:
  - `DatabaseConnection` checa `/api/health`.
  - `PalletList` lista com paginacao e filtros.
  - `PalletDetails` formulario para editar pallet selecionado.
  - `PackList` packs vinculados ao pallet.
  - `OrphanList` packs sem `seq_pallet`.
  - `PackEdit` modal para criar/editar packs.
  - `PackOverview/PackOverview.jsx` painel resumido.
  - `ConfirmDialog` componente generico.

## Fluxo de Estado
1. `App` chama `listPallets` em `useEffect` sempre que `limit`, `offset`, `search` mudarem.
2. Se lista retorna vazia, zera `selectedId`.
3. Quando `selectedId` muda, carrega detalhes via `getPallet`.
4. `PackList` e `OrphanList` possuem estado interno com paginação e modais.
5. Após qualquer criação/edição/exclusão, componentes chamam `load()` novamente.

## Estilos
- Arquivo principal `styles.css`.
- Layout dividido em:
  - `.topbar` (header com logo + status DB).
  - `.sidebar` com toolbar, lista de pallets e orphans.
  - `.main` com detalhes, packs e overview.
- Botões: classes `.btn`, `.primary`, `.danger`.
- Tabelas desenhadas com `.t-head`, `.t-row`, `.t-body`.

## Variaveis de Ambiente
- `VITE_API_BASE` define URL base (default `http://localhost:4000`).
- Definir em `.env` (root do client) ou via variáveis de build (por exemplo `VITE_API_BASE=https://api.exemplo.com npm run build`).

## Build
- `npm run dev` levanta Vite (porta 5173).
- `npm run build` gera artefatos em `dist/`.
- `npm run preview` (opcional) para testar build.

## Tratamento de Erros
- `api.js` lança `Error` com mensagem da resposta (`error`).
- Componentes exibem `alert` ou inline (`error` na UI).
- `DatabaseConnection` indica status via cores (verificar implementacao para mensagens).

## UX Pontos de Atenção
- Campo de busca `search` reseta offset ao digitar.
- Criação de pallet sugere `seq_pallet` baseado em timestamp (segundos).
- Botões de paginação desativam conforme limites.
- Confirm diálogo para deletar pallet/pack impede exclusões acidentais.

## Extensoes Sugeridas
- Implementar autenticação básica.
- Trocar `prompt/alert` por modal custom (alinhar com UX).
- Internacionalização (strings hoje hard-coded em inglês/português).
