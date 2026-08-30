# Third-party components

This inventory covers every external GitHub Action recorded in
`.github/workflows/actions.lock`, runtime CLI and OCI tooling selected by those
Actions, CI-only npm and browser validation tooling, the standalone validation
binary installed from an immutable official GitHub release, and externally
hosted components used by the profile or Pages site. The repository's package manifest contains only
development tooling for browser-level provenance tests. No npm package,
browser binary, or FFmpeg binary is copied into `site/` or the deployed GitHub
Pages artifact; the site's committed JavaScript uses browser built-ins and
GitHub APIs.

The repository's original content is proprietary and all rights are reserved.
The licenses below apply only to their respective third-party components.

## Direct GitHub Actions

All Actions are pinned to immutable commit SHAs in the workflows and in
`.github/workflows/actions.lock`.

| Component | Version | Commit SHA | License | Purpose |
| --- | --- | --- | --- | --- |
| [`actions/checkout`](https://github.com/actions/checkout/tree/3d3c42e5aac5ba805825da76410c181273ba90b1) | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` | MIT | Read trusted repository snapshots |
| [`actions/setup-node`](https://github.com/actions/setup-node/tree/820762786026740c76f36085b0efc47a31fe5020) | v7.0.0 | `820762786026740c76f36085b0efc47a31fe5020` | MIT | Configure the exact Node.js runtime for validation and Pages generation |
| [`github/codeql-action`](https://github.com/github/codeql-action/tree/cdf488f595d80d6e07e03d4674febd5ab45fa938) | v4.37.9 | `cdf488f595d80d6e07e03d4674febd5ab45fa938` | MIT | CodeQL analysis and SARIF upload |
| [`linear/linear-release-action`](https://github.com/linear/linear-release-action/tree/3f31fcf14c110cc53579fcc3575a26d469c413b4) | v0.17.1 | `3f31fcf14c110cc53579fcc3575a26d469c413b4` | MIT | Synchronize successful Pages deployments with Linear |
| [`actions/configure-pages`](https://github.com/actions/configure-pages/tree/45bfe0192ca1faeb007ade9deae92b16b8254a0d) | v6.0.0 | `45bfe0192ca1faeb007ade9deae92b16b8254a0d` | MIT | Configure GitHub Pages |
| [`actions/deploy-pages`](https://github.com/actions/deploy-pages/tree/cd2ce8fcbc39b97be8ca5fce6e763baed58fa128) | v5.0.0 | `cd2ce8fcbc39b97be8ca5fce6e763baed58fa128` | MIT | Deploy the Pages artifact |
| [`actions/upload-pages-artifact`](https://github.com/actions/upload-pages-artifact/tree/fc324d3547104276b827a68afc52ff2a11cc49c9) | v5.0.0 | `fc324d3547104276b827a68afc52ff2a11cc49c9` | MIT | Package the Pages artifact |
| [`actions/upload-artifact`](https://github.com/actions/upload-artifact/tree/043fb46d1a93c77aae656e7c1c64a875d1fc6a0a) | v7.0.1 | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` | MIT | Retain Scorecard SARIF |
| [`ossf/scorecard-action`](https://github.com/ossf/scorecard-action/tree/2d1146689b8cda280b9bc96326124645441f03bc) | v2.4.4 | `2d1146689b8cda280b9bc96326124645441f03bc` | Apache-2.0 | Assess supply-chain posture |
| [`zizmorcore/zizmor-action`](https://github.com/zizmorcore/zizmor-action/tree/3dc1ecc9bcb9e94e9b2c709687979e1298497054) | v0.6.2 | `3dc1ecc9bcb9e94e9b2c709687979e1298497054` | MIT | Audit GitHub Actions workflows |

## Runtime CLI and OCI tooling

These are the executable artifacts selected at runtime by the pinned Actions.
The versions below are also fixed in the repository workflows.

| Component | Version | Immutable origin and integrity | License or terms | Executed by |
| --- | --- | --- | --- | --- |
| [`linear/linear-release`](https://github.com/linear/linear-release/tree/2c3741305c53275f884294aad7c2db5f28015938) | v0.17.1 | [Immutable release](https://github.com/linear/linear-release/releases/tag/v0.17.1), commit `2c3741305c53275f884294aad7c2db5f28015938`; Linux x64 SHA-256 `122461a09eadb74e5be1a57d7127fce7ed3b71a7a3b57abf424710c3e862cd58` | [MIT](https://github.com/linear/linear-release/blob/2c3741305c53275f884294aad7c2db5f28015938/LICENSE) | `linear/linear-release-action` |
| [`ossf/scorecard-action` OCI image](https://github.com/orgs/ossf/packages/container/scorecard-action/1061343653) | v2.4.4 | The pinned Action's [`action.yaml`](https://github.com/ossf/scorecard-action/blob/2d1146689b8cda280b9bc96326124645441f03bc/action.yaml) selects `ghcr.io/ossf/scorecard-action:v2.4.4`; on 30/08/2026, the official tag resolved to manifest digest `sha256:ae5104dd3cc28466ebeb11144354be4cac4b7ff829654f9fab89021d71c46670` | [Apache-2.0](https://github.com/ossf/scorecard-action/blob/2d1146689b8cda280b9bc96326124645441f03bc/LICENSE) | `ossf/scorecard-action` |
| [`zizmorcore/zizmor`](https://github.com/zizmorcore/zizmor/tree/3c116961091b50bd1a08ffefe916469d4d90093c) | 1.29.0 | OCI image `ghcr.io/zizmorcore/zizmor:1.29.0@sha256:863026d54f91271b10b60b67ad8054cb37120167e162482597db102b3026a284`, recorded by the pinned Action in [`support/versions`](https://github.com/zizmorcore/zizmor-action/blob/3dc1ecc9bcb9e94e9b2c709687979e1298497054/support/versions) | [MIT](https://github.com/zizmorcore/zizmor/blob/3c116961091b50bd1a08ffefe916469d4d90093c/LICENSE) | `zizmorcore/zizmor-action` |
| [GitHub CodeQL CLI](https://github.com/github/codeql-action/releases/tag/codeql-bundle-v2.26.4) | 2.26.4 (`codeql-bundle-v2.26.4`) | Immutable release selected by the pinned Action's [`defaults.json`](https://github.com/github/codeql-action/blob/cdf488f595d80d6e07e03d4674febd5ab45fa938/src/defaults.json); Linux x64 `.tar.zst` SHA-256 `a9872c9075f85374a8d03546263c6dc01fde50a29baea9fc08dcc6b25cc2efd5` | [GitHub CodeQL terms](https://docs.github.com/en/code-security/codeql-cli/codeql-cli-reference/about-the-codeql-cli#license) | `github/codeql-action` |
| [Node.js](https://github.com/nodejs/node/tree/71b8b174857e25106d39b61a9e6f30d927da8b01) | 24.20.0 | [Signed v24.20.0 release](https://nodejs.org/dist/v24.20.0/), commit `71b8b174857e25106d39b61a9e6f30d927da8b01`; Linux x64 `.tar.xz` SHA-256 `2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2` | [MIT](https://github.com/nodejs/node/blob/71b8b174857e25106d39b61a9e6f30d927da8b01/LICENSE) | `actions/setup-node` in validation and Pages build jobs |
| [`npm` and `npx`](https://github.com/npm/cli/tree/bfacd33ccbcd908480610703b60455d2da5b57a9) | 11.19.0 | Bundled by the signed Node.js v24.20.0 distribution and recorded as `npm: 11.19.0` in the [official release index](https://nodejs.org/dist/index.json); integrity is covered by the Node.js archive SHA-256 above | [Artistic-2.0](https://github.com/npm/cli/blob/bfacd33ccbcd908480610703b60455d2da5b57a9/LICENSE) | Repository test and browser-install commands |

The Linear Action's pinned
[`install.sh`](https://github.com/linear/linear-release-action/blob/3f31fcf14c110cc53579fcc3575a26d469c413b4/install.sh)
requires an immutable GitHub release and verifies the selected binary against
the release's published checksum before execution.

The pinned Scorecard Action still selects an OCI tag rather than a digest. The
digest above records the registry resolution observed during this audit; the
repository-local drift test cannot prove that the publisher will never remap
that tag, and this issue does not change runtime behavior.

## Transitive GitHub Actions

These Actions are invoked by another pinned Action and are recorded in the
lockfile even though no repository workflow calls them directly.

| Component | Version | Commit SHA | License | Invoked by |
| --- | --- | --- | --- | --- |
| [`actions/upload-artifact`](https://github.com/actions/upload-artifact/tree/bbbca2ddaa5d8feaa63e36b76fdaad77386f024f) | v7.0.0 | `bbbca2ddaa5d8feaa63e36b76fdaad77386f024f` | MIT | `actions/upload-pages-artifact` |
| [`github/codeql-action`](https://github.com/github/codeql-action/tree/7188fc363630916deb702c7fdcf4e481b751f97a) | v4.37.1 | `7188fc363630916deb702c7fdcf4e481b751f97a` | MIT | `zizmorcore/zizmor-action` |

## Trusted validation tooling

| Component | Version | Integrity | License | Purpose |
| --- | --- | --- | --- | --- |
| [`github/gh-actions-lock`](https://github.com/github/gh-actions-lock/tree/047fddf38163b304f1e6ef5649f5ac1646edc6a3) | v0.1.6 | [Release](https://github.com/github/gh-actions-lock/releases/tag/v0.1.6), signed commit `047fddf38163b304f1e6ef5649f5ac1646edc6a3`; Linux AMD64 SHA-256 `4181ec1da5408b34b9a542a7ee5c6ce3a4d6ac815c7d0206a00ceca8a817f4e3` | [MIT](https://github.com/github/gh-actions-lock/blob/047fddf38163b304f1e6ef5649f5ac1646edc6a3/LICENSE) | Verify Action pins and lockfile coverage |

## CI-only browser validation tooling

The following development packages are installed from the exact versions and
npm tarball integrities recorded in `package-lock.json`. They run the
repository-local browser provenance tests and are not runtime dependencies of
the profile or Pages site.

| Component | Version | Relation | npm integrity | License | Purpose |
| --- | --- | --- | --- | --- | --- |
| [`@playwright/test`](https://github.com/microsoft/playwright/tree/v1.62.1/packages/playwright-test) | 1.62.1 | Direct development dependency | `sha512-DTcUc8qii+cpHvtOwggMtBRMjKZHXYWdw8syRYu2vtzuq4Wxphqq4NfCs5Zt44L6mA8rfDfj+PHnxFc/FeK6mQ==` | [Apache-2.0](https://github.com/microsoft/playwright/blob/v1.62.1/LICENSE) | Execute browser-level provenance and CSP contract tests |
| [`playwright`](https://github.com/microsoft/playwright/tree/v1.62.1/packages/playwright) | 1.62.1 | Transitive dependency of `@playwright/test` | `sha512-0M+L3LAD8/nm554LOla9Ayx0j0tmFZ0FBcoQ7F1VuVHpM/XpiC8RcDzBQB8W5+hA8L22THxELzeF+2WcUzvcLg==` | [Apache-2.0](https://github.com/microsoft/playwright/blob/v1.62.1/LICENSE) | Browser automation and test runner integration |
| [`playwright-core`](https://github.com/microsoft/playwright/tree/v1.62.1/packages/playwright-core) | 1.62.1 | Transitive dependency of `playwright` | `sha512-wPYSwEBJY9GHraISXqyqtx0na0LpO3XEX7jNDhntbex7tzUS7kLnZsOlFruFJB4Hi/rhDMjXGqHewDZ68nYZVw==` | [Apache-2.0](https://github.com/microsoft/playwright/blob/v1.62.1/LICENSE) | Browser protocol and executable management |
| [`fsevents`](https://github.com/fsevents/fsevents/tree/v2.3.2) | 2.3.2 | Optional transitive dependency of `playwright`; Darwin only | `sha512-xiqMQR4xAeHTuB9uWm+fFRcIOgKBMiOBP+eXiyT7jsgVCq1bkVygt00oASowB7EdtpOHaaPgKt812P9ab+DDKA==` | [MIT](https://github.com/fsevents/fsevents/blob/v2.3.2/LICENSE) | Optional macOS filesystem event support |

The three Playwright 1.62.1 npm packages publish SLSA provenance from the
official [`microsoft/playwright` v1.62.1 source](https://github.com/microsoft/playwright/tree/v1.62.1),
signed commit `26a9e470a7b3c7822084b09fb7f13902c5f37b51`, and publish workflow run
`30562184036`, attempt 1. Their distributed archives include the Apache-2.0
license; `playwright` and `playwright-core` also include the upstream Playwright
NOTICE. The npm integrities above are enforced by the committed lockfile.

Playwright's official installer additionally obtains these CI-only executable
artifacts:

| Component | Version | Origin and observed integrity | License or terms | Purpose |
| --- | --- | --- | --- | --- |
| Chrome Headless Shell | 151.0.7922.34, Playwright revision 1234 | [Official Playwright descriptor](https://github.com/microsoft/playwright/blob/v1.62.1/packages/playwright-core/browsers.json); [versioned Chrome for Testing archive](https://cdn.playwright.dev/builds/cft/151.0.7922.34/linux64/chrome-headless-shell-linux64.zip); archive SHA-256 observed on 30/08/2026: `3cfc2bd00d1bafcf8a68dc74c9c92bb7150ddc8d26ade948a776316e1cec4f14` | The archive supplies Chromium's `LICENSE.headless_shell` (observed SHA-256 `334f3e2d8a58954bc7152a8150bdd3e7f35e0d9bcf30dd323d4edcb7df5f36d5`) with 281 bundled third-party license sections; the executable is not represented as a single SPDX license | Execute Chromium headless for semantic DOM, request, and CSP validation |
| Playwright FFmpeg | Build 1011 | [Versioned official Playwright archive](https://cdn.playwright.dev/dbazure/download/playwright/builds/ffmpeg/1011/ffmpeg-linux.zip); archive SHA-256 observed on 30/08/2026: `ebc74fc5b94830176a3c2914ae96bd8bc7f6a91f4f33890230f84a172ee61ccc` | The archive supplies `COPYING.LGPLv2.1`; exact redistribution terms for the prebuilt binary remain **INCONCLUSIVE** without its complete build configuration and incorporated-component inventory | Playwright-supplied CI media helper |

The browser and FFmpeg hashes are dated audit evidence, not integrity values
enforced by `package-lock.json`. Playwright 1.62.1 selects their versioned
revisions and validates download size, but its installer does not enforce these
recorded SHA-256 values. Neither executable is redistributed in the GitHub
Pages artifact; reassess the complete bundled notices and FFmpeg build terms
before any future redistribution.

## Fonts, icons, and hosted media

These resources are loaded from their providers at render time and are not
vendored in this repository.

| Component | Source | License or terms | Use |
| --- | --- | --- | --- |
| Space Grotesk | [Google Fonts](https://github.com/google/fonts/blob/main/ofl/spacegrotesk/OFL.txt) | OFL-1.1 | Pages typography |
| IBM Plex Sans | [Google Fonts](https://github.com/google/fonts/blob/main/ofl/ibmplexsans/OFL.txt) | OFL-1.1 | Pages typography |
| JetBrains Mono | [Google Fonts](https://github.com/google/fonts/blob/main/ofl/jetbrainsmono/OFL.txt) | OFL-1.1 | Pages typography |
| Devicon icons | [`devicons/devicon@7330accdbc47e2dc0c19789a48533c4a3c50fe58`](https://github.com/devicons/devicon/tree/7330accdbc47e2dc0c19789a48533c4a3c50fe58) | [MIT](https://github.com/devicons/devicon/blob/7330accdbc47e2dc0c19789a48533c4a3c50fe58/LICENSE) | Technology icons in the profile and Pages site |

The repository-local
[`site/assets/lcv-ideas-software-logo.svg`](site/assets/lcv-ideas-software-logo.svg)
is first-party proprietary content, not a third-party component. It was copied
from the approved [organization-governance source](https://github.com/LCV-Ideas-Software/.github/blob/1b6eed828fd72c8ddc382ab271825015e4f14d10/profile/assets/lcv-ideas-software-logo.svg)
at commit `1b6eed828fd72c8ddc382ab271825015e4f14d10`; its SHA-256 is
`70631f32e8b4c01d794a3af5016484dd09d51beb0c26abf3a80a9355db179f27`.
Runtime rendering no longer depends on another LCV repository.

The MIT license applies to the Devicon project assets. Devicon's
[upstream notice](https://github.com/devicons/devicon/blob/7330accdbc47e2dc0c19789a48533c4a3c50fe58/README.md)
also states that product names, logos and brands remain subject to their
respective owners' trademark and brand policies.

### Decorative profile GIFs

The five published URLs appear in the catalog at commit
[`278efd0acc149f89992349d4a5bd349b058aaf0e`](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/README.md),
whose repository is under the [MIT license](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/LICENSE).
That commit establishes catalog provenance, but the URLs resolve to external
`user-images.githubusercontent.com` blobs rather than files in the licensed
tree. Ownership and individual licensing of those five blobs therefore remain
**INCONCLUSIVE**. They are embedded remotely and are not vendored or
redistributed in this repository.

| Published asset | Immutable catalog evidence | Use |
| --- | --- | --- |
| [GIF 1](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif) | [`Cool-GIFs-For-GitHub@278efd0`](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/README.md) | Profile separator |
| [GIF 2](https://user-images.githubusercontent.com/74038190/229223263-cf2e4b07-2615-4f87-9c38-e37600f8381a.gif) | [`Cool-GIFs-For-GitHub@278efd0`](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/README.md) | Coding illustration |
| [GIF 3](https://user-images.githubusercontent.com/74038190/212747903-e9bdf048-2dc8-41f9-b973-0e72ff07bfba.gif) | [`Cool-GIFs-For-GitHub@278efd0`](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/README.md) | Profile separator |
| [GIF 4](https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif) | [`Cool-GIFs-For-GitHub@278efd0`](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/README.md) | Profile decoration |
| [GIF 5](https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif) | [`Cool-GIFs-For-GitHub@278efd0`](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/README.md) | Profile decoration |

## External services and generated images

The profile and Pages site embed responses generated or hosted by GitHub,
Google Fonts, Shields.io, Best Practices Badge, Komarev Profile Views,
Readme Typing SVG, GitHub Readme Streak Stats, GitHub Readme Activity Graph,
GitHub Profile Summary Cards, and Capsule Render. They also link to GitHub,
Slack, and LCV Ideas & Software services. Those responses are not vendored or
licensed as repository content; each provider's current terms and each
underlying data source continue to apply.

The Pages JavaScript reads public profile and repository data from the GitHub
REST API, and the contribution-snake generator reads the GitHub GraphQL API.
The repository-local provenance gate submits the profile Markdown to GitHub's
official REST Markdown endpoint in `gfm` mode so only images rendered by GitHub
enter the exact media catalog. Pull-request CI uses the public endpoint without
authentication; trusted-ref CI authenticates with its read-only repository token.
Comments and code examples therefore follow GitHub's own renderer rather than a
repository-specific Markdown parser.
Those service interactions are governed by the applicable GitHub terms and do
not add a software package dependency.
