# Contributing

This personal profile repository is maintained by LCV Ideas & Software. Contributions should preserve the public profile, GitHub Pages, workflow, and security surfaces of `lcv-leo/lcv-leo`.

## Baseline

- Every change to `main` must use a pull request. Direct pushes, administrative merges, REST merges, force pushes, and ruleset bypasses are prohibited.
- Squash is the only merge method. An eligible pull request may use GitHub auto-merge only after the effective repository ruleset and all required checks are satisfied on its exact head SHA. This repository does not currently use a merge queue; no workflow or operator may bypass the pull-request, signature, CodeQL, linear-history, or required-check gates.
- Do not commit secrets, tokens, private keys, credentials, generated build output, or local environment files.
- Set workflow-level permissions to `{}` and grant each job only the `GITHUB_TOKEN` capabilities it demonstrably needs. Keep privileged external credentials in protected environments and out of pull-request jobs.
- Resolve every external GitHub Action to an immutable commit SHA through the canonical `.github/workflows/actions.lock`; do not introduce an untracked mutable reference.
- Preserve daily Dependabot checks, automatic rebasing, and GitHub's post-merge branch deletion. Official Actions under `actions/*` and `github/*` are evaluated immediately; third-party GitHub Actions observe a seven-day cooldown. Security updates are not delayed by that cooldown.
- Dependabot prepares and rebases its pull requests automatically. Dependabot Custom Auto-merge is operated exclusively from `github-operations`; its protected least-privilege credential may update a stale Dependabot head by GitHub's rebase operation and admit that exact SHA to auto-merge or the merge queue. It never admits human-authored or fork pull requests and never bypasses required checks. No part of that controller is implemented in this repository.
- Use `https://registry.npmjs.org/` by default. A different npm registry is allowed only through an intentional, versioned, applicable `.npmrc` rule.
- Do not change Enterprise or organization rules, settings, applications, or secrets without separate explicit operator consent.

## Validation

Before opening or updating a pull request, run the repository-specific checks documented in the README, package scripts, or workflow files. For security-sensitive changes, retain evidence of the checks performed in the associated Issue, Project item, Discussion, or pull request.
