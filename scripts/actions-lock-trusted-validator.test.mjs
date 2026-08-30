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

async function readNormalizedText(url) {
  return (await readFile(url, "utf8")).replaceAll("\r\n", "\n");
}

test("the trusted validator consumes the pinned central semantic bundle", async () => {
  const workflow = await readNormalizedText(workflowUrl);

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

test("the status publisher uses the official action and a dedicated least-privilege App", async () => {
  const workflow = await readNormalizedText(workflowUrl);

  assert.match(workflow, /environment: actions-lock-validation/u);
  assert.match(
    workflow,
    /actions\/create-github-app-token@bcd2ba49218906704ab6c1aa796996da409d3eb1 # v3\.2\.0/u,
  );
  assert.match(
    workflow,
    /client-id: \$\{\{ vars\.ACTIONS_LOCK_VALIDATOR_CLIENT_ID \}\}/u,
  );
  assert.match(
    workflow,
    /private-key: \$\{\{ secrets\.ACTIONS_LOCK_VALIDATOR_PRIVATE_KEY \}\}/u,
  );
  assert.match(workflow, /permission-statuses: write/u);
  assert.match(
    workflow,
    /GH_STATUS_TOKEN: \$\{\{ steps\.status-token\.outputs\.token \}\}/u,
  );
  assert.match(workflow, /GH_TOKEN="\$\{GH_STATUS_TOKEN\}" gh api/u);
  assert.match(workflow, /STATUS_CONTEXT: Validate actions\.lock/u);
  assert.match(workflow, /post_status 'pending'/u);
  assert.match(workflow, /post_status 'success'/u);
  assert.match(workflow, /post_status 'failure'/u);
  assert.doesNotMatch(
    workflow,
    /permissions:\s*\n\s+contents: read[^]*?\n\s+statuses: write/u,
  );
  assert.doesNotMatch(workflow, /\bapp-id:/u);
  assert.doesNotMatch(workflow, /\bopenssl\b|\bjwt\b/iu);
});

test("the unprivileged trigger covers pull requests retargeted to main", async () => {
  const trigger = await readNormalizedText(triggerUrl);

  assert.match(trigger, /^\s*- edited\s*$/mu);
});
