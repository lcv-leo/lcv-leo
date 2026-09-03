# Contributing

This personal profile repository is maintained by LCV Ideas & Software. Contributions should preserve the public profile, GitHub Pages, workflow, and security surfaces of `lcv-leo/lcv-leo`.

## Baseline

- Every change to `main` must use a pull request. Direct pushes, administrative merges, REST merges, force pushes, and ruleset bypasses are prohibited.
- Squash is the only merge method. A pull request is merged only after the effective repository rulesets and all required checks are satisfied on its exact head SHA. There is no merge queue; no workflow or operator may bypass the pull-request, signature, CodeQL, linear-history, or required-check gates.
- Do not commit secrets, tokens, private keys, credentials, generated build output, or local environment files.
- Set workflow-level permissions to `{}` and grant each job only the `GITHUB_TOKEN` capabilities it demonstrably needs. Keep privileged external credentials in protected environments and out of pull-request jobs.
- Pin every external GitHub Action to an immutable commit SHA, as the repository's Actions policy requires; do not introduce a mutable reference.
- Preserve weekly Dependabot checks, automatic rebasing, and GitHub's post-merge branch deletion. Official Actions under `actions/*` and `github/*` are evaluated immediately; third-party GitHub Actions observe a seven-day cooldown. Security updates are not delayed by that cooldown.
- Dependabot prepares dependency pull requests from this repository's own `.github/dependabot.yml`. The repository-local workflow `.github/workflows/dependabot-auto-merge.yml` enables GitHub's native auto-merge on Dependabot's own pull requests; GitHub merges them only after this repository's rulesets and required checks pass. No external repository or custom controller operates their lifecycle.
- Do not add repository tests that assert a value Dependabot controls (Action commit SHAs, Action or package versions, lockfile contents) or that validate the shape of a workflow file: such a test inside a required check blocks automatic merging.
- Use `https://registry.npmjs.org/` by default. A different npm registry is allowed only through an intentional, versioned, applicable `.npmrc` rule.
- Do not change Enterprise or organization rules, settings, applications, or secrets without separate explicit operator consent.

## Validation

Before opening or updating a pull request, run the repository-specific checks documented in the README, package scripts, or workflow files. For security-sensitive changes, retain evidence of the checks performed in the associated Issue, Project item, Discussion, or pull request.
