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

<!-- entire-agent:begin -->
Read .entire/agent-guide.md for this repository's workflow, source inspection, and verification guidance.
@.entire/agent-guide.md
<!-- entire-agent:end -->

## Entire and GitHub together (enterprise standard)

This section applies to agent sessions on a local workstation with the Entire
CLI installed. It does not apply to agents that run in GitHub Actions or in a
provider's cloud, such as the `@claude` workflow, Codex cloud tasks or the
Copilot coding agent: they commit through their own tools and follow their own
instructions.

Entire and GitHub run together, in parallel, at all times. GitHub remains the
source of truth and the home of the controls (signed commits, rulesets, CodeQL,
reviews); Entire captures a checkpoint when a commit is made and syncs it when
the commit is pushed. Work recorded in only one of them is incomplete.

1. Start the agent session at this repository's root, or at its worktree under
   `.worktrees/`. A session opened in a parent folder is not attributed to this
   repository.
2. Before working, run `entire status --detailed`. If the hooks are missing, run
   `entire configure --force`; do not reinstall what already works.
3. Keep the result in files of this repository. Work that changes no file here,
   such as API-only or console operations, produces no checkpoint.
4. Commit with a local, signed `git commit`; never through the GitHub API or web
   editor, and never with `--no-verify`, so that Entire's Git hooks run.
   `.entire/settings.json` sets `"commit_linking": "always"`, so commits link to
   the captured session without a prompt.
5. Never write the `Entire-Checkpoint` trailer by hand. The hook writes it; if it
   is missing, investigate instead of adding it.
6. Push with `git push`, then prove that the checkpoint reached GitHub:
   `git ls-remote origin 'refs/entire/*'` lists the ID from the commit trailer,
   and `entire checkpoint explain <id> --repo gh/<owner>/<repo> --json` answers.
7. Once per pull request, after it is merged, generate a remote dispatch with
   `entire dispatch --repos gh/<owner>/<repo> --since <time the PR was opened> --voice neutral`
   and give it a title: the CLI has no title option, so take the newest setup
   for this repository from `entire api --to cell /api/v1/me/dispatch-setups`
   and run `entire api --to cell -X PATCH /api/v1/me/dispatch-setups/<setup-id> -f "name=<repo> — PR #<number>: <PR title>"`.
   Every dispatch must have a title. Post its markdown as a comment on the pull
   request, with the checkpoint IDs and the title. Entire allows one generation
   per minute per account: after a rate-limit
   answer, wait 60 seconds and retry once. "No checkpoints" means step 6 failed;
   never create an artificial commit to fill a dispatch.
8. Report configuration, executed-and-proven evidence, and pending items
   separately.
