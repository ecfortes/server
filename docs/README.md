# Documentacao do Pallet & Pack Manager

Este diretório reúne os guias técnicos do projeto, segmentados por tema para facilitar manutenção e onboarding.

## Como navegar
- Leia este índice para identificar o guia adequado.
- Mantenha as informações sincronizadas com o código; alterou comportamento, atualize o documento correspondente.
- Prefira referências internas antes de duplicar conteúdo entre arquivos.

## Conteúdo
- `arquitetura.md` visão macro dos componentes (frontend, backend, banco, integrações).
- `backend.md` configuração do serviço Express, variáveis e logging.
- `api.md` catálogo dos endpoints REST, parâmetros e respostas.
- `database.md` esquema lógico, migrações e views.
- `frontend.md` camada React/Vite, páginas e componentes.
- `operacional.md` rotinas de setup, migração, deploy e suporte diário.
- `integracao-node-red.md` fluxo de automação industrial e passos de importação.

## Convencoes de Documentacao
- Idioma padrão: português (sem acentuação para manter ASCII).
- Use blocos de código para comandos shell ou trechos SQL/JSON.
- Datas no formato ISO `YYYY-MM-DD`.
- Indique caminhos relativos ao repositório quando possível.

## Atualizacao
- Abra PR com alterações sincronizadas (código + doc).
- Referencie tarefas do `TODO.md` quando um item for concluído.
- Documente incidentes relevantes em `operacional.md` (seções de troubleshooting).
