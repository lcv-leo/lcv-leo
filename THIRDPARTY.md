# Third-party components

This inventory covers every external GitHub Action recorded in
`.github/workflows/actions.lock`, the standalone validation binary downloaded
by a workflow, and externally hosted components used by the profile or Pages
site. The repository has no package manifest or vendored package dependency;
its committed JavaScript uses browser or Node.js built-ins and GitHub APIs.

The repository's original content is proprietary and all rights are reserved.
The licenses below apply only to their respective third-party components.

## Direct GitHub Actions

All Actions are pinned to immutable commit SHAs in the workflows and in
`.github/workflows/actions.lock`.

| Component | Version | Commit SHA | License | Purpose |
| --- | --- | --- | --- | --- |
| [`actions/create-github-app-token`](https://github.com/actions/create-github-app-token/tree/bcd2ba49218906704ab6c1aa796996da409d3eb1) | v3.2.0 | `bcd2ba49218906704ab6c1aa796996da409d3eb1` | MIT | Create the least-privilege trusted-validator status token |
| [`actions/checkout`](https://github.com/actions/checkout/tree/3d3c42e5aac5ba805825da76410c181273ba90b1) | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` | MIT | Read trusted repository snapshots |
| [`github/codeql-action`](https://github.com/github/codeql-action/tree/cdf488f595d80d6e07e03d4674febd5ab45fa938) | v4.37.9 | `cdf488f595d80d6e07e03d4674febd5ab45fa938` | MIT | CodeQL analysis and SARIF upload |
| [`linear/linear-release-action`](https://github.com/linear/linear-release-action/tree/3f31fcf14c110cc53579fcc3575a26d469c413b4) | v0.17.1 | `3f31fcf14c110cc53579fcc3575a26d469c413b4` | MIT | Synchronize successful Pages deployments with Linear |
| [`actions/configure-pages`](https://github.com/actions/configure-pages/tree/45bfe0192ca1faeb007ade9deae92b16b8254a0d) | v6.0.0 | `45bfe0192ca1faeb007ade9deae92b16b8254a0d` | MIT | Configure GitHub Pages |
| [`actions/deploy-pages`](https://github.com/actions/deploy-pages/tree/cd2ce8fcbc39b97be8ca5fce6e763baed58fa128) | v5.0.0 | `cd2ce8fcbc39b97be8ca5fce6e763baed58fa128` | MIT | Deploy the Pages artifact |
| [`actions/upload-pages-artifact`](https://github.com/actions/upload-pages-artifact/tree/fc324d3547104276b827a68afc52ff2a11cc49c9) | v5.0.0 | `fc324d3547104276b827a68afc52ff2a11cc49c9` | MIT | Package the Pages artifact |
| [`actions/upload-artifact`](https://github.com/actions/upload-artifact/tree/043fb46d1a93c77aae656e7c1c64a875d1fc6a0a) | v7.0.1 | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` | MIT | Retain Scorecard SARIF |
| [`ossf/scorecard-action`](https://github.com/ossf/scorecard-action/tree/2d1146689b8cda280b9bc96326124645441f03bc) | v2.4.4 | `2d1146689b8cda280b9bc96326124645441f03bc` | Apache-2.0 | Assess supply-chain posture |
| [`zizmorcore/zizmor-action`](https://github.com/zizmorcore/zizmor-action/tree/3dc1ecc9bcb9e94e9b2c709687979e1298497054) | v0.6.2 | `3dc1ecc9bcb9e94e9b2c709687979e1298497054` | MIT | Audit GitHub Actions workflows |

The CodeQL CLI is separately governed by
[GitHub's CodeQL terms](https://docs.github.com/en/code-security/codeql-cli/codeql-cli-reference/about-the-codeql-cli#license).
Since `v0.16.1` the Linear Action verifies its selected CLI against a published
SHA-256 checksum before executing it, closing the upstream provenance gap
tracked in
[`linear/linear-release-action#59`](https://github.com/linear/linear-release-action/issues/59).

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
| [`github/gh-actions-lock`](https://github.com/github/gh-actions-lock/releases/tag/v0.1.6) | v0.1.6 | Linux AMD64 SHA-256 `4181ec1da5408b34b9a542a7ee5c6ce3a4d6ac815c7d0206a00ceca8a817f4e3` | MIT | Verify Action pins and lockfile coverage |

The semantic verifier executed by the trusted workflow is first-party
proprietary code from
[`LCV-Ideas-Software/actions-lock-policy`](https://github.com/LCV-Ideas-Software/actions-lock-policy/tree/bdde91d4d2b47275e244e4a9b23cbf97269d23da)
at commit `bdde91d4d2b47275e244e4a9b23cbf97269d23da`; it is listed here for complete
execution provenance and is not a third-party component.

## Fonts, icons, and hosted media

These resources are loaded from their providers at render time and are not
vendored in this repository.

| Component | Source | License or terms | Use |
| --- | --- | --- | --- |
| Space Grotesk | [Google Fonts](https://github.com/google/fonts/blob/main/ofl/spacegrotesk/OFL.txt) | OFL-1.1 | Pages typography |
| IBM Plex Sans | [Google Fonts](https://github.com/google/fonts/blob/main/ofl/ibmplexsans/OFL.txt) | OFL-1.1 | Pages typography |
| JetBrains Mono | [Google Fonts](https://github.com/google/fonts/blob/main/ofl/jetbrainsmono/OFL.txt) | OFL-1.1 | Pages typography |
| Devicon icons | [`devicons/devicon`](https://github.com/devicons/devicon/blob/master/LICENSE) | MIT | Technology icons in the profile and Pages site |
| Decorative profile GIFs | [`Anmol-Baranwal/Cool-GIFs-For-GitHub`](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/main/LICENSE) | MIT | Profile decoration |
| LCV Ideas & Software logo | [`LCV-Ideas-Software/.github`](https://github.com/LCV-Ideas-Software/.github) | First-party proprietary content | Branding in the profile and Pages site |

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
Those service interactions are governed by the applicable GitHub terms and do
not add a software package dependency.
