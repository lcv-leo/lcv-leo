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
and workflow files and exports as an SBOM on request. Exact versions and
immutable commit pins live only in `package.json`, `package-lock.json` and the
workflow files, where Dependabot updates them; this document deliberately does
not repeat them, so it can never drift from those sources. The official GitHub
Dependency Review action evaluates manifest and lockfile changes on every pull
request, and the Pages workflow installs the committed lockfile with lifecycle
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
| `fsevents`         | Optional transitive dependency of `playwright`; Darwin only | [MIT](https://github.com/fsevents/fsevents/blob/master/LICENSE)         | https://www.npmjs.com/package/fsevents         |

Playwright's official installer additionally obtains the Chrome Headless Shell
and the Playwright FFmpeg build selected by the installed Playwright release.
Neither executable is redistributed in the GitHub Pages artifact; reassess the
complete bundled notices and FFmpeg build terms before any future
redistribution.

## Fonts, icons, and hosted media

These resources are loaded from their providers at render time and are not
vendored in this repository.

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

### Decorative profile GIFs

The five published URLs appear in the catalog at commit
[`278efd0acc149f89992349d4a5bd349b058aaf0e`](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/README.md),
whose repository is under the [MIT license](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/LICENSE).
That commit establishes catalog provenance, but the URLs resolve to external
`user-images.githubusercontent.com` blobs rather than files in the licensed
tree. Ownership and individual licensing of those five blobs therefore remain
**INCONCLUSIVE**. They are embedded remotely and are not vendored or
redistributed in this repository.

| Published asset                                                                                                | Immutable catalog evidence                                                                                                                       | Use                 |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| [GIF 1](https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif) | [`Cool-GIFs-For-GitHub@278efd0`](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/README.md) | Profile separator   |
| [GIF 2](https://user-images.githubusercontent.com/74038190/229223263-cf2e4b07-2615-4f87-9c38-e37600f8381a.gif) | [`Cool-GIFs-For-GitHub@278efd0`](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/README.md) | Coding illustration |
| [GIF 3](https://user-images.githubusercontent.com/74038190/212747903-e9bdf048-2dc8-41f9-b973-0e72ff07bfba.gif) | [`Cool-GIFs-For-GitHub@278efd0`](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/README.md) | Profile separator   |
| [GIF 4](https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif) | [`Cool-GIFs-For-GitHub@278efd0`](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/README.md) | Profile decoration  |
| [GIF 5](https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif) | [`Cool-GIFs-For-GitHub@278efd0`](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/278efd0acc149f89992349d4a5bd349b058aaf0e/README.md) | Profile decoration  |

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
