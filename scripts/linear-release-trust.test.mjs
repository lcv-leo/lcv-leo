import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflow = await readFile(
  new URL("../.github/workflows/linear-release.yml", import.meta.url),
  "utf8",
);

const jobCondition = workflow.match(
  /jobs:\s*\n[\s\S]*?\n\s+if: >-\s*\n([\s\S]*?)\n\s+runs-on:/,
)?.[1];

test("Linear Release accepts only trusted pushes from this repository's default branch", () => {
  assert.ok(jobCondition, "Linear Release job condition was not found");
  assert.match(jobCondition, /workflow_run\.conclusion == 'success'/);
  assert.match(jobCondition, /workflow_run\.event == 'push'/);
  assert.match(
    jobCondition,
    /workflow_run\.head_repository\.full_name == github\.repository/,
  );
  assert.match(
    jobCondition,
    /workflow_run\.head_branch == github\.event\.repository\.default_branch/,
  );
  assert.doesNotMatch(jobCondition, /workflow_run\.head_branch == 'main'/);
});
