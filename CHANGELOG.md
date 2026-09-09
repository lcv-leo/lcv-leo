# Changelog

Notable changes to this repository are recorded here from 02/09/2026 onward.
Earlier work is verifiable in the commit history and in the closed pull
requests.

This repository is **not versioned**: it publishes the personal profile of
`lcv-leo` and the static site at lcv-leo.lcv.dev. It does not publish packages
or a numbered artifact. Entries are grouped by date rather than semantic
version. Dates are written `DD/MM/AAAA` in Brasília time (UTC−03:00).

## 09/09/2026 — Mídia do perfil hospedada no próprio repositório (LCV2-24)

### Changed

- Os cinco GIFs e os 13 ícones Devicon usados no perfil agora têm cópias locais
  byte a byte, com referências ao próprio repositório; o Pages usa os ícones
  locais. As animações, a composição e as dimensões foram preservadas.
- Fontes, contadores, estatísticas, gráficos, badges e demais serviços dinâmicos
  permanecem ativos, sem snapshots ou alteração dos workflows.
- O cartão dinâmico de detalhes do README exibe `lcv-leo (LCV)` usando o
  parâmetro oficial `name` do provedor, evitando o corte do nome. O nome do
  perfil GitHub e o título equivalente no Pages não foram alterados.
- Incluídos os textos MIT originais do Devicon e do catálogo dos GIFs, com
  créditos, fontes e hashes em THIRDPARTY; a declaração do catálogo não foi
  apresentada como comprovação de autoria individual das animações.
- Ajustados somente o inventário de mídia, a política de imagens do Pages e
  a descrição do teste de proveniência correspondente.
- O teste existente de retry usa `Clock.pauseAt` do Playwright e aguarda o
  agendamento antes de verificar o limite de 2.500 ms, sem alterar a lógica
  do site ou relaxar as asserções.

## 02/09/2026 — Governança nativa do repositório ([#51](https://github.com/lcv-leo/lcv-leo/issues/51), LCV2-21)

### Removed

- O lockfile `.github/workflows/actions.lock`, os passos de instalação e
  verificação do `gh-actions-lock` no workflow `Deploy Pages` e os cabeçalhos
  "managed by gh actions-lock": o padrão da organização deixou de usar lockfile
  de Actions.
- O workflow `codeql.yml`, substituído pelo default setup do code scanning do
  GitHub.
- O teste `scripts/linear-release-trust.test.mjs` e, em
  `scripts/provenance-drift.test.mjs`, os testes que validavam a forma dos
  workflows, o `actions.lock`, as tabelas de versão do `THIRDPARTY.md` e o
  lockfile: um teste que fixa uma versão ou um SHA controlados pelo Dependabot
  dentro do check obrigatório impediria o merge automático. Ficam os testes de
  proveniência da marca e da mídia hospedada e os testes de navegador do site.
- Os badges "Merge Queues", "Merge queue ALLGREEN" e "actions.lock + SHA pins"
  do perfil, e as menções a merge queue e ao lockfile no perfil e no site.

### Added

- `.github/workflows/dependabot-auto-merge.yml`, o padrão da organização para
  auto-merge nativo dos PRs do Dependabot, com o token pessoal guardado como
  segredo do Dependabot (`DEPENDABOT_AUTOMERGE_TOKEN`).
- `.github/workflows/dependency-review.yml`, `.github/CODEOWNERS`, `INBOUND.md`
  e este `CHANGELOG.md`.

### Changed

- `dependabot.yml` semanal (segunda-feira, 06:00 em Brasília) com um grupo de
  minor e patch por ecossistema, majors separados, labels, prefixo e rebase
  automático.
- `zizmor.yml` alinhado ao exemplo oficial (zizmor-action v0.6.3, agenda
  semanal); `scorecard.yml` só com push em `main` e agenda semanal;
  `linear-release.yml` com linear-release-action v0.17.2, mantendo o gatilho
  `workflow_run` em `Deploy Pages` e `command: sync`; `Deploy Pages` com
  deploy-pages v5.0.1, Node.js 24 e o job de deploy restrito a `main`.
- `SECURITY.md`, `CONTRIBUTING.md` e `THIRDPARTY.md` reescritos para o padrão
  nativo; o `THIRDPARTY.md` lista dependências por nome, licença e fonte, com o
  grafo de dependências do GitHub como inventário versionado, e mantém as seções
  legais de fontes, ícones, mídia hospedada e serviços externos.
