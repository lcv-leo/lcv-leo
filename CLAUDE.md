# CLAUDE.md

Instructions for Claude Code in this repository. The repository's own conventions live in
`README.md` and `SECURITY.md`; read them before changing anything.

## Running in GitHub Actions (`.github/workflows/claude.yml`)

When you run through the official `anthropics/claude-code-action`, triggered by `@claude` on an
issue, pull request or review in this repository:

- The only commands you may run are the read-only `gh pr diff` and `gh pr view`, to read a pull
  request's changes and description. You do not run repository code, builds or tests; the
  repository's checks run on the pull request. Commits go through the action's tools and are
  signed by the GitHub API (`use_commit_signing: true`).
- Review request: the format of each finding is fixed in the workflow itself (one inline comment
  per finding, with a priority badge). A review does not change files.
- Change request: work on a `claude/...` branch or on the pull request you were given, as the
  action defines.
