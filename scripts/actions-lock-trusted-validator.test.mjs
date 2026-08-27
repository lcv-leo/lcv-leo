import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowUrl = new URL(
  "../.github/workflows/actions-lock-validate.yml",
  import.meta.url,
);
const triggerUrl = new URL(
  "../.github/workflows/actions-lock-trigger.yml",
  import.meta.url,
);

test("the trusted validator consumes the pinned central semantic bundle", async () => {
  const workflow = await readFile(workflowUrl, "utf8");

  assert.match(
    workflow,
    /readonly policy_repository='LCV-Ideas-Software\/actions-lock-policy'/u,
  );
  assert.match(
    workflow,
    /readonly policy_sha='bdde91d4d2b47275e244e4a9b23cbf97269d23da'/u,
  );
  assert.match(workflow, /readonly policy_bundle='dist\/verify-actions-lock\.cjs'/u);
  assert.match(
    workflow,
    /gh api \\\n\s+-H 'Accept: application\/vnd\.github\+json' \\\n\s+-H 'X-GitHub-Api-Version: 2022-11-28' \\\n\s+"repos\/\$\{policy_repository\}\/tarball\/\$\{policy_sha\}"/u,
  );
  assert.match(workflow, /repos\/\$\{policy_repository\}\/tarball\/\$\{policy_sha\}/u);
  assert.match(workflow, /--gh-actions-lock-report "\$\{lock_report\}"/u);
  assert.match(workflow, /--gh-actions-lock-exit-code "\$\{lock_exit_code\}"/u);
  assert.doesNotMatch(workflow, /scripts\/verify-actions-lock\.mjs/u);
});

test("the legacy status publisher remains active during the dedicated-App canary", async () => {
  const workflow = await readFile(workflowUrl, "utf8");

  assert.match(workflow, /STATUS_CONTEXT: Validate actions\.lock/u);
  assert.match(workflow, /statuses: write/u);
  assert.match(workflow, /post_status 'pending'/u);
  assert.match(workflow, /post_status 'success'/u);
  assert.match(workflow, /post_status 'failure'/u);
});

test("the unprivileged trigger covers pull requests retargeted to main", async () => {
  const trigger = await readFile(triggerUrl, "utf8");

  assert.match(trigger, /^\s*- edited\s*$/mu);
});
