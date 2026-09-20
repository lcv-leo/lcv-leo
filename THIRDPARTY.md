# Third-party components

This inventory covers every external GitHub Action invoked by the repository
workflows, the CI-only npm and browser validation tooling, and the externally
hosted components used by the profile or the Pages site. The repository's
package manifest contains only development tooling for browser-level
provenance tests. No npm package, browser binary, or FFmpeg binary is copied
into `site/` or the deployed GitHub Pages artifact; the site's committed
JavaScript uses browser built-ins and GitHub APIs.

The versioned inventory is the repository's **dependency graph** (Insights →
Dependency graph), which GitHub maintains from the committed manifest, lockfile
and workflow files and exports as an SBOM on request. Versions, version ranges
and immutable commit pins live only in `package.json`, `package-lock.json` and
the workflow files, where Dependabot updates them; this document deliberately
does not repeat them, so it can never drift from those sources. The official GitHub
Dependency Review action evaluates manifest and lockfile changes on every pull
request to `main`, and the Pages workflow installs the committed lockfile with lifecycle
scripts disabled.

The repository's original content is proprietary and all rights are reserved.
The licenses below apply only to their respective third-party components.

## GitHub Actions

Every external Action is pinned to an immutable commit SHA in the workflows, as
the repository's Actions policy requires. Tooling that an Action selects at
runtime (the Linear CLI, the zizmor and Scorecard images, the CodeQL bundle
used by code scanning) is governed by that Action's own release and license.

| Component                          | License                                                                      | Source                                              | Purpose                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `actions/checkout`                 | [MIT](https://github.com/actions/checkout/blob/main/LICENSE)                 | https://github.com/actions/checkout                 | Read repository snapshots without persisting credentials    |
| `actions/setup-node`               | [MIT](https://github.com/actions/setup-node/blob/main/LICENSE)               | https://github.com/actions/setup-node               | Configure the Node.js runtime for validation and generation |
| `actions/dependency-review-action` | [MIT](https://github.com/actions/dependency-review-action/blob/main/LICENSE) | https://github.com/actions/dependency-review-action | Review dependency changes on pull requests                  |
| `linear/linear-release-action`     | [MIT](https://github.com/linear/linear-release-action/blob/main/LICENSE)     | https://github.com/linear/linear-release-action     | Synchronize successful Pages deployments with Linear        |
| `actions/configure-pages`          | [MIT](https://github.com/actions/configure-pages/blob/main/LICENSE)          | https://github.com/actions/configure-pages          | Configure GitHub Pages                                      |
| `actions/upload-pages-artifact`    | [MIT](https://github.com/actions/upload-pages-artifact/blob/main/LICENSE)    | https://github.com/actions/upload-pages-artifact    | Package the Pages artifact                                  |
| `actions/deploy-pages`             | [MIT](https://github.com/actions/deploy-pages/blob/main/LICENSE)             | https://github.com/actions/deploy-pages             | Deploy the Pages artifact                                   |
| `actions/upload-artifact`          | [MIT](https://github.com/actions/upload-artifact/blob/main/LICENSE)          | https://github.com/actions/upload-artifact          | Retain the Scorecard SARIF artifact                         |
| `github/codeql-action`             | [MIT](https://github.com/github/codeql-action/blob/main/LICENSE)             | https://github.com/github/codeql-action             | Upload the Scorecard SARIF to code scanning                 |
| `ossf/scorecard-action`            | [Apache-2.0](https://github.com/ossf/scorecard-action/blob/main/LICENSE)     | https://github.com/ossf/scorecard-action            | Assess supply-chain posture                                 |
| `zizmorcore/zizmor-action`         | [MIT](https://github.com/zizmorcore/zizmor-action/blob/main/LICENSE)         | https://github.com/zizmorcore/zizmor-action         | Audit GitHub Actions workflows                              |

`github/codeql-action` is MIT-licensed; the CodeQL CLI that GitHub's code
scanning default setup runs is governed by the
[GitHub CodeQL Terms and Conditions](https://github.com/github/codeql-cli-binaries/blob/main/LICENSE.md).

The official `ossf/scorecard-action` delegates at runtime to a container image
addressed by a version tag, which is mutable and therefore not covered by the
commit pin of the consumer workflow. The repository keeps the official Action
because Scorecard is mandatory and the upstream project exposes no consumer-side
image digest override. Track
[ossf/scorecard-action#1676](https://github.com/ossf/scorecard-action/issues/1676).

## CI-only browser validation tooling

The following development packages are installed from the committed
`package-lock.json` with lifecycle scripts disabled. They run the
repository-local browser provenance tests and are not runtime dependencies of
the profile or Pages site.

| Component          | Relation                                                    | License                                                                 | Source                                         |
| ------------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| `@playwright/test` | Direct development dependency                               | [Apache-2.0](https://github.com/microsoft/playwright/blob/main/LICENSE) | https://www.npmjs.com/package/@playwright/test |
| `playwright`       | Transitive dependency of `@playwright/test`                 | [Apache-2.0](https://github.com/microsoft/playwright/blob/main/LICENSE) | https://www.npmjs.com/package/playwright       |
| `playwright-core`  | Transitive dependency of `playwright`                       | [Apache-2.0](https://github.com/microsoft/playwright/blob/main/LICENSE) | https://www.npmjs.com/package/playwright-core  |

Playwright's official installer additionally obtains the Chrome Headless Shell
and the Playwright FFmpeg build selected by the installed Playwright release.
Neither executable is redistributed in the GitHub Pages artifact; reassess the
complete bundled notices and FFmpeg build terms before any future
redistribution.

## Fonts, icons, and hosted media

Fonts are loaded from their providers at render time. The Devicon icons and
decorative profile GIFs are vendored locally with the source notices below;
service-generated statistics and badges remain dynamic.

| Component      | Source                                                                                                                                           | License or terms                                                                                 | Use                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Space Grotesk  | [Google Fonts](https://github.com/google/fonts/blob/main/ofl/spacegrotesk/OFL.txt)                                                               | OFL-1.1                                                                                          | Pages typography                               |
| IBM Plex Sans  | [Google Fonts](https://github.com/google/fonts/blob/main/ofl/ibmplexsans/OFL.txt)                                                                | OFL-1.1                                                                                          | Pages typography                               |
| JetBrains Mono | [Google Fonts](https://github.com/google/fonts/blob/main/ofl/jetbrainsmono/OFL.txt)                                                              | OFL-1.1                                                                                          | Pages typography                               |
| Devicon icons  | [`devicons/devicon@7330accdbc47e2dc0c19789a48533c4a3c50fe58`](https://github.com/devicons/devicon/tree/7330accdbc47e2dc0c19789a48533c4a3c50fe58) | [MIT](https://github.com/devicons/devicon/blob/7330accdbc47e2dc0c19789a48533c4a3c50fe58/LICENSE) | Technology icons in the profile and Pages site |

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


The vendored icon files come from the exact Devicon commit above:

| Local file | Upstream file | SHA-256 |
| --- | --- | --- |
| [site/assets/devicon/icons/typescript/typescript-original.svg](site/assets/devicon/icons/typescript/typescript-original.svg) | [Source](https://raw.githubusercontent.com/devicons/devicon/7330accdbc47e2dc0c19789a48533c4a3c50fe58/icons/typescript/typescript-original.svg) | `c9191199f4049920c2fc19035b8a6664f37f4689fcd9e8434e786097e78863f0` |
| [site/assets/devicon/icons/javascript/javascript-original.svg](site/assets/devicon/icons/javascript/javascript-original.svg) | [Source](https://raw.githubusercontent.com/devicons/devicon/7330accdbc47e2dc0c19789a48533c4a3c50fe58/icons/javascript/javascript-original.svg) | `0656ff65fc8eeacda5c78d7f9ffe91ec1eb919db64f56e0b7dcd460af4bbd36c` |
| [site/assets/devicon/icons/rust/rust-original.svg](site/assets/devicon/icons/rust/rust-original.svg) | [Source](https://raw.githubusercontent.com/devicons/devicon/7330accdbc47e2dc0c19789a48533c4a3c50fe58/icons/rust/rust-original.svg) | `16c6c6a98e990944fc5e1cc64cc8fc7b8be3a662ec4ee7951b7995d2e52f5e12` |
| [site/assets/devicon/icons/python/python-original.svg](site/assets/devicon/icons/python/python-original.svg) | [Source](https://raw.githubusercontent.com/devicons/devicon/7330accdbc47e2dc0c19789a48533c4a3c50fe58/icons/python/python-original.svg) | `71493b4a732f0532b3a03a7a95da3ee11a65766367c8303b901ffbe7bf91a3a2` |
| [site/assets/devicon/icons/sqlite/sqlite-original.svg](site/assets/devicon/icons/sqlite/sqlite-original.svg) | [Source](https://raw.githubusercontent.com/devicons/devicon/7330accdbc47e2dc0c19789a48533c4a3c50fe58/icons/sqlite/sqlite-original.svg) | `2b91c30887d3602479ba845cc012ef6ae577fba71eb96705a05b12e35d2c5e7e` |
| [site/assets/devicon/icons/html5/html5-original.svg](site/assets/devicon/icons/html5/html5-original.svg) | [Source](https://raw.githubusercontent.com/devicons/devicon/7330accdbc47e2dc0c19789a48533c4a3c50fe58/icons/html5/html5-original.svg) | `34826e5b3315daadf4fa15f723a3c1d5ba4a89277bfd94e22ac4d7d3d54338c5` |
| [site/assets/devicon/icons/css3/css3-original.svg](site/assets/devicon/icons/css3/css3-original.svg) | [Source](https://raw.githubusercontent.com/devicons/devicon/7330accdbc47e2dc0c19789a48533c4a3c50fe58/icons/css3/css3-original.svg) | `36b7d94b657d571d3f94042acbf6a4c86a5301a222f83f4b4583ad2acf6e297d` |
| [site/assets/devicon/icons/react/react-original.svg](site/assets/devicon/icons/react/react-original.svg) | [Source](https://raw.githubusercontent.com/devicons/devicon/7330accdbc47e2dc0c19789a48533c4a3c50fe58/icons/react/react-original.svg) | `5825b649c8c04dec13ecf01d0182401bd0ec71789d2fa06224866d882cd1515f` |
| [site/assets/devicon/icons/vitejs/vitejs-original.svg](site/assets/devicon/icons/vitejs/vitejs-original.svg) | [Source](https://raw.githubusercontent.com/devicons/devicon/7330accdbc47e2dc0c19789a48533c4a3c50fe58/icons/vitejs/vitejs-original.svg) | `f84e50febcb3a2a81399c9a1ae76d96dc235428202f91610b6f36bfb5b62051a` |
| [site/assets/devicon/icons/cloudflareworkers/cloudflareworkers-original.svg](site/assets/devicon/icons/cloudflareworkers/cloudflareworkers-original.svg) | [Source](https://raw.githubusercontent.com/devicons/devicon/7330accdbc47e2dc0c19789a48533c4a3c50fe58/icons/cloudflareworkers/cloudflareworkers-original.svg) | `6b3490a3395c3ccd0d79c8972ac9fa4e131b5d9564394efe1de1a787d269e858` |
| [site/assets/devicon/icons/cloudflare/cloudflare-original.svg](site/assets/devicon/icons/cloudflare/cloudflare-original.svg) | [Source](https://raw.githubusercontent.com/devicons/devicon/7330accdbc47e2dc0c19789a48533c4a3c50fe58/icons/cloudflare/cloudflare-original.svg) | `6bb87edf9d3759ab11efb064a4cbe25271d4761539aa4928e68bcaf795839c63` |
| [site/assets/devicon/icons/nodejs/nodejs-original.svg](site/assets/devicon/icons/nodejs/nodejs-original.svg) | [Source](https://raw.githubusercontent.com/devicons/devicon/7330accdbc47e2dc0c19789a48533c4a3c50fe58/icons/nodejs/nodejs-original.svg) | `3218687c5ea24a4d4c0a33dc5c287da38c33a72dcfe9382469d7ce4e0bf661fb` |
| [site/assets/devicon/icons/tauri/tauri-original.svg](site/assets/devicon/icons/tauri/tauri-original.svg) | [Source](https://raw.githubusercontent.com/devicons/devicon/7330accdbc47e2dc0c19789a48533c4a3c50fe58/icons/tauri/tauri-original.svg) | `ead32ee5a82726948b9038ccae84f8c071681db1df988460ecd1c8ac3b132744` |
### Decorative profile GIFs

The operator requested local copies of the five existing animations on
09/09/2026, superseding the earlier replacement-artwork approach. The files
below are copied byte for byte, without resizing, re-encoding or removing
frames. The README no longer loads them from another profile's uploads.

**Declared upstream license: MIT.** The original copyright and license notice
is preserved verbatim in
[`site/assets/profile-gifs/LICENSE`](site/assets/profile-gifs/LICENSE), from
[`Anmol-Baranwal/Cool-GIFs-For-GitHub@278efd0acc149f89992349d4a5bd349b058aaf0e`](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/LICENSE).
The [catalog README at that commit](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/README.md)
contains all five source URLs. The commit identifies the catalog revision;
the SHA-256 values below identify the downloaded binary files.

This records the catalog's license declaration, not original authorship by LCV.
The catalog does not identify each original artist; the maintainer describes
the indirect sourcing in
[upstream issue #5](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/issues/5#issuecomment-2019568216).
Copying the files and preserving that notice do not establish independent
verification of each artist's rights. Third-party rights remain with their
respective holders.

| Repository-hosted file | Original download | SHA-256 |
| --- | --- | --- |
| [site/assets/profile-gifs/fading-line.gif](https://raw.githubusercontent.com/lcv-leo/lcv-leo/main/site/assets/profile-gifs/fading-line.gif) | [Source](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif) | `66755568f640f93051ca779dd85131a85bc03d6385f7c57bdaaf388de6854fbc` |
| [site/assets/profile-gifs/awesome-workspace.gif](https://raw.githubusercontent.com/lcv-leo/lcv-leo/main/site/assets/profile-gifs/awesome-workspace.gif) | [Source](https://user-images.githubusercontent.com/74038190/229223263-cf2e4b07-2615-4f87-9c38-e37600f8381a.gif) | `d59b78f7c6ae48d28f26e0f28794f8ad2cfd431b3c5fa268544acf5d6415043b` |
| [site/assets/profile-gifs/curious-tech-geek.gif](https://raw.githubusercontent.com/lcv-leo/lcv-leo/main/site/assets/profile-gifs/curious-tech-geek.gif) | [Source](https://user-images.githubusercontent.com/74038190/212747903-e9bdf048-2dc8-41f9-b973-0e72ff07bfba.gif) | `3cab8b519d8a85ecab393e388703867d2c6cfe7882d6a6a27b5ed1b6f5b718da` |
| [site/assets/profile-gifs/pacman.gif](https://raw.githubusercontent.com/lcv-leo/lcv-leo/main/site/assets/profile-gifs/pacman.gif) | [Source](https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif) | `d91d83139a869f7c77497036e0850d40e54b1daa42d256ea34b3bd7f54bde8ff` |
| [site/assets/profile-gifs/gradient-line.gif](https://raw.githubusercontent.com/lcv-leo/lcv-leo/main/site/assets/profile-gifs/gradient-line.gif) | [Source](https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif) | `f5d8f1f1971ee82a1f201aced2477d7acc11ca956308df5923e0d16860111cd4` |

## External services and generated images

Dynamic services remain live; no counters, statistics, graphs, badges or service
responses have been converted to static snapshots. The existing contribution
snake generation, client-side API requests, refresh behavior and workflows
are unchanged.

The profile and Pages site embed responses generated or hosted by GitHub,
Google Fonts, Shields.io, Best Practices Badge, Komarev Profile Views,
Readme Typing SVG, GitHub Readme Streak Stats, GitHub Profile Summary Cards,
and Capsule Render. They also link to GitHub, Slack, and LCV Ideas & Software
services. Those responses are not vendored or licensed as repository content;
each provider's current terms and each underlying data source continue to apply.

The Pages JavaScript reads public profile and repository data from the GitHub
REST API, and the contribution-snake and contribution-graph generators read the
GitHub GraphQL API.

The contribution activity graph is rendered by this repository from that
official calendar and served from lcv-leo.lcv.dev. It is no longer requested
from GitHub Readme Activity Graph, whose public deployment was disabled by its
host; the card stayed dynamic and was not converted to a static snapshot.

The repository-local provenance gate submits the profile Markdown to GitHub's
official REST Markdown endpoint in `gfm` mode so only images rendered by GitHub
enter the exact media catalog. Pull-request CI uses the public endpoint without
authentication; trusted-ref CI authenticates with its read-only repository token.
Comments and code examples therefore follow GitHub's own renderer rather than a
repository-specific Markdown parser.
Those service interactions are governed by the applicable GitHub terms and do
not add a software package dependency.
