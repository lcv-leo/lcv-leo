import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [
  readme,
  page,
  thirdParty,
  actionsLock,
  actionsLockValidatorWorkflow,
  codeqlWorkflow,
  linearWorkflow,
  scorecardWorkflow,
  zizmorWorkflow,
] =
  await Promise.all([
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../site/index.html", import.meta.url), "utf8"),
    readFile(new URL("../THIRDPARTY.md", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/actions.lock", import.meta.url), "utf8"),
    readFile(
      new URL("../.github/workflows/actions-lock-validate.yml", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../.github/workflows/codeql.yml", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/linear-release.yml", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/scorecard.yml", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/zizmor.yml", import.meta.url), "utf8"),
  ]);

const DEVICON_COMMIT = "7330accdbc47e2dc0c19789a48533c4a3c50fe58";
const DEVICON_PREFIX = `https://raw.githubusercontent.com/devicons/devicon/${DEVICON_COMMIT}/`;
const DEVICON_PATHS = [
  "icons/typescript/typescript-original.svg",
  "icons/javascript/javascript-original.svg",
  "icons/rust/rust-original.svg",
  "icons/python/python-original.svg",
  "icons/sqlite/sqlite-original.svg",
  "icons/html5/html5-original.svg",
  "icons/css3/css3-original.svg",
  "icons/react/react-original.svg",
  "icons/vitejs/vitejs-original.svg",
  "icons/cloudflareworkers/cloudflareworkers-original.svg",
  "icons/cloudflare/cloudflare-original.svg",
  "icons/nodejs/nodejs-original.svg",
  "icons/tauri/tauri-original.svg",
];

const GIF_CATALOG_COMMIT = "278efd0acc149f89992349d4a5bd349b058aaf0e";
const GIF_URLS = [
  "https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif",
  "https://user-images.githubusercontent.com/74038190/229223263-cf2e4b07-2615-4f87-9c38-e37600f8381a.gif",
  "https://user-images.githubusercontent.com/74038190/212747903-e9bdf048-2dc8-41f9-b973-0e72ff07bfba.gif",
  "https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif",
  "https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif",
];

function extractImageSources(content, surfaceName) {
  const normalized = content.toLowerCase();
  for (const unsupported of ["![", "srcset", "<source", "url("]) {
    assert.equal(normalized.includes(unsupported), false, `${surfaceName} must use <img src>`);
  }

  for (const comment of content.split("<!--").slice(1)) {
    const end = comment.indexOf("-->");
    assert.notEqual(end, -1, `${surfaceName} has an unterminated comment`);
    assert.equal(comment.slice(0, end).toLowerCase().includes("<img"), false);
  }
  const codeBlocks = content.split("```");
  assert.equal(codeBlocks.length % 2, 1, `${surfaceName} has an unterminated code block`);
  for (let index = 1; index < codeBlocks.length; index += 2) {
    assert.equal(codeBlocks[index].toLowerCase().includes("<img"), false);
  }
  for (const line of content.split("\n")) {
    const image = line.toLowerCase().indexOf("<img");
    const firstTick = line.indexOf("`");
    const lastTick = line.lastIndexOf("`");
    assert.ok(image === -1 || firstTick === -1 || image < firstTick || image > lastTick);
  }

  const sources = [];
  let cursor = 0;
  while (true) {
    const start = normalized.indexOf("<img", cursor);
    if (start === -1) break;
    assert.ok([" ", "\n", "\r", "\t", "\f", "/", ">"].includes(normalized[start + 4]));
    const end = normalized.indexOf(">", start + 4);
    assert.notEqual(end, -1, `${surfaceName} has an unterminated <img> tag`);
    const tag = content.slice(start, end + 1);
    assert.equal([...tag.matchAll(/(?:^|\s)src=/giu)].length, 1);
    const matches = [...tag.matchAll(/\ssrc="([^"]*)"|\ssrc='([^']*)'/giu)];
    assert.equal(matches.length, 1, `${surfaceName} <img> needs one quoted src`);
    const source = (matches[0][1] ?? matches[0][2]).trim();
    assert.notEqual(source, "", `${surfaceName} has an empty image src`);
    sources.push(source);
    cursor = end + 1;
  }
  return sources;
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right, "en"));
}

function assertImageCatalog(content, surface, predicate, expected) {
  const actual = extractImageSources(content, surface).filter(predicate);
  assert.deepEqual(sorted(actual), sorted(expected), `${surface} image catalog drifted`);
}

function assertImmutableDeviconInventory(readmeSource, pageSource) {
  const expected = DEVICON_PATHS.map((path) => `${DEVICON_PREFIX}${path}`);
  const isDevicon = (source) => source.toLowerCase().includes("devicon");
  assertImageCatalog(readmeSource, "README", isDevicon, expected);
  assertImageCatalog(pageSource, "Pages", isDevicon, expected);
}

function isGifSource(source) {
  if (source.toLowerCase().startsWith("data:image/gif")) return true;
  const pathname = new URL(source, "https://repository.invalid/").pathname;
  return decodeURIComponent(pathname).toLowerCase().endsWith(".gif");
}

function assertCataloguedGifInventory(readmeSource, pageSource) {
  assertImageCatalog(readmeSource, "README", isGifSource, GIF_URLS);
  assertImageCatalog(pageSource, "Pages", isGifSource, []);
}

// These regular expressions parse isolated machine syntax, never prose.
function actionIdentityParts(identity, sourceName) {
  const match = /^([^/@]+\/[^/@]+)@([0-9a-f]{40})$/u.exec(identity);
  assert.ok(match, `${sourceName} has an invalid Action identity: ${identity}`);
  return { commit: match[2], repository: match[1] };
}

function parseActionsLock(lockSource) {
  assert.ok(lockSource.includes("# This file is machine-generated by `gh actions-lock`."));
  assert.ok(lockSource.includes("version: 'v0.0.2'"));
  const lines = lockSource.split("\n").map((line) => line.trimEnd());
  const workflowsStart = lines.indexOf("workflows:");
  const dependenciesStart = lines.indexOf("dependencies:");
  assert.ok(workflowsStart !== -1 && dependenciesStart > workflowsStart);

  const workflowRows = lines
    .slice(workflowsStart + 1, dependenciesStart)
    .filter((line) => line.trimStart().startsWith("- "));
  const direct = new Set(
    workflowRows.map((line) => {
      const match = /^ {8}- '([^']+)'$/u.exec(line);
      assert.ok(match, "actions.lock has a non-canonical workflow dependency");
      actionIdentityParts(match[1], "actions.lock workflows");
      return match[1];
    }),
  );

  const dependencyRows = lines
    .slice(dependenciesStart + 1)
    .filter((line) => line.trim() !== "" && !line.startsWith("        "));
  const dependencies = dependencyRows.map((line) => {
    const match = /^ {4}'([^']+)':$/u.exec(line);
    assert.ok(match, "actions.lock has a non-canonical dependency key");
    actionIdentityParts(match[1], "actions.lock dependencies");
    return match[1];
  });
  assert.ok(dependencies.length > 0 && new Set(dependencies).size === dependencies.length);
  for (const identity of direct) assert.ok(dependencies.includes(identity));
  return {
    direct: sorted(direct),
    transitive: sorted(dependencies.filter((identity) => !direct.has(identity))),
  };
}

function extractSection(content, heading, nextHeading) {
  const start = content.indexOf(heading);
  const end = content.indexOf(nextHeading, start + heading.length);
  assert.ok(start !== -1 && end > start, `THIRDPARTY section drifted: ${heading}`);
  return content.slice(start, end);
}

function extractActionRows(content, heading, nextHeading) {
  const section = extractSection(content, heading, nextHeading);
  const lines = section
    .split("\n")
    .map((line) => line.trimEnd());
  const header = lines.findIndex((line) => line.startsWith("| Component |"));
  assert.ok(header !== -1 && lines[header + 1]?.startsWith("| --- |"));
  const rows = [];
  for (const line of lines.slice(header + 2)) {
    if (line === "") break;
    assert.ok(line.startsWith("| [`") && line.endsWith("|"), "Non-canonical Action row");
    rows.push(line);
  }
  assert.equal(section.split("https://github.com/").length - 1, rows.length);
  return rows;
}

function assertInventoryRows(identities, rows, relationship) {
  const message = `THIRDPARTY ${relationship} Actions must equal actions.lock`;
  assert.equal(rows.length, identities.length, message);
  for (const identity of identities) {
    const { commit, repository } = actionIdentityParts(identity, "actions.lock");
    const component = `[\`${repository}\`](https://github.com/${repository}/tree/${commit})`;
    const matches = rows.filter((row) => row.split("|")[1]?.trim() === component);
    assert.equal(matches.length, 1, message);
    assert.equal(matches[0].split("|")[3]?.trim(), `\`${commit}\``, message);
  }
}

function assertActionInventoryReconciled(actionsLockSource, thirdPartySource) {
  const { direct, transitive } = parseActionsLock(actionsLockSource);
  for (const [identities, heading, nextHeading, relationship] of [
    [direct, "## Direct GitHub Actions", "## Runtime CLI and OCI tooling", "direct"],
    [transitive, "## Transitive GitHub Actions", "## Trusted validation tooling", "transitive"],
  ]) {
    assertInventoryRows(
      identities,
      extractActionRows(thirdPartySource, heading, nextHeading),
      relationship,
    );
  }
}

test("profile and Pages use the immutable Devicon inventory", () => {
  assertImmutableDeviconInventory(readme, page);
});

test("Devicon inventory rejects an image from another ref", () => {
  const mutableUrl =
    "https://raw.githubusercontent.com/devicons/devicon/main/icons/go/go-original.svg";
  const approvedUrl = `${DEVICON_PREFIX}${DEVICON_PATHS[0]}`;
  const approvedLine = readme.split("\n").find((line) => line.includes(approvedUrl));
  assert.ok(approvedLine);
  for (const driftedReadme of [
    `${readme}\n<img src="${mutableUrl}">`,
    `${readme}\n![unapproved Devicon](${mutableUrl})`,
    readme.replace(approvedLine, `<!-- ${approvedLine} -->`),
    readme.replace(
      approvedLine,
      `<img src=${mutableUrl} alt='ignored src="${approvedUrl}"'>`,
    ),
    readme.replace(approvedLine, `\`${approvedLine}\``),
  ]) {
    assert.throws(() => assertImmutableDeviconInventory(driftedReadme, page));
  }
});

test("profile and Pages use exactly the five catalogued GIFs", () => {
  assertCataloguedGifInventory(readme, page);
});

test("GIF inventory rejects an image from another host", () => {
  const gif = "https://example.com/untracked.GIF?cache=1";
  const approvedLine = readme.split("\n").find((line) => line.includes(GIF_URLS[0]));
  assert.ok(approvedLine);
  for (const [readmeSource, pageSource] of [
    [readme, `${page}\n<img src="${gif}">`],
    [`${readme}\n![untracked GIF](${gif})`, page],
    [readme, `${page}\n<img src="/safe.svg" srcset="${gif}">`],
    [readme.replace(approvedLine, `<!-- ${approvedLine} -->`), page],
  ]) {
    assert.throws(() => assertCataloguedGifInventory(readmeSource, pageSource));
  }
});

test("runtime tool versions and immutable origins stay inventoried", () => {
  assert.ok(actionsLockValidatorWorkflow.includes("readonly lock_version='v0.1.6'"));
  assert.ok(
    actionsLockValidatorWorkflow.includes(
      "readonly lock_asset_url='https://github.com/github/gh-actions-lock/releases/download/v0.1.6/linux-amd64'",
    ),
  );
  assert.ok(
    actionsLockValidatorWorkflow.includes(
      "readonly lock_asset_sha256='4181ec1da5408b34b9a542a7ee5c6ce3a4d6ac815c7d0206a00ceca8a817f4e3'",
    ),
  );
  assert.ok(
    codeqlWorkflow.includes(
      "github/codeql-action/init@cdf488f595d80d6e07e03d4674febd5ab45fa938 # v4.37.9",
    ),
  );
  assert.ok(
    linearWorkflow.includes(
      "linear/linear-release-action@3f31fcf14c110cc53579fcc3575a26d469c413b4 # v0.17.1",
    ),
  );
  assert.ok(linearWorkflow.includes("cli_version: v0.17.1"));
  assert.ok(
    scorecardWorkflow.includes(
      "ossf/scorecard-action@2d1146689b8cda280b9bc96326124645441f03bc # v2.4.4",
    ),
  );
  assert.ok(
    zizmorWorkflow.includes(
      "zizmorcore/zizmor-action@3dc1ecc9bcb9e94e9b2c709687979e1298497054 # v0.6.2",
    ),
  );
  assert.ok(zizmorWorkflow.includes("version: 1.29.0"));

  for (const evidence of [
    "github/gh-actions-lock/releases/tag/v0.1.6",
    "047fddf38163b304f1e6ef5649f5ac1646edc6a3",
    "github/gh-actions-lock/blob/047fddf38163b304f1e6ef5649f5ac1646edc6a3/LICENSE",
    "4181ec1da5408b34b9a542a7ee5c6ce3a4d6ac815c7d0206a00ceca8a817f4e3",
    "2c3741305c53275f884294aad7c2db5f28015938",
    "linear/linear-release/blob/2c3741305c53275f884294aad7c2db5f28015938/LICENSE",
    "122461a09eadb74e5be1a57d7127fce7ed3b71a7a3b57abf424710c3e862cd58",
    "ghcr.io/ossf/scorecard-action:v2.4.4",
    "sha256:ae5104dd3cc28466ebeb11144354be4cac4b7ff829654f9fab89021d71c46670",
    "ossf/scorecard-action/blob/2d1146689b8cda280b9bc96326124645441f03bc/LICENSE",
    "3c116961091b50bd1a08ffefe916469d4d90093c",
    "sha256:863026d54f91271b10b60b67ad8054cb37120167e162482597db102b3026a284",
    "zizmorcore/zizmor/blob/3c116961091b50bd1a08ffefe916469d4d90093c/LICENSE",
    "codeql-bundle-v2.26.4",
    "a9872c9075f85374a8d03546263c6dc01fde50a29baea9fc08dcc6b25cc2efd5",
    "docs.github.com/en/code-security/codeql-cli/codeql-cli-reference/about-the-codeql-cli#license",
  ]) {
    assert.ok(
      thirdParty.includes(evidence),
      `Missing runtime provenance: ${evidence}`,
    );
  }
});

test("THIRDPARTY Action components equal all actions.lock dependencies", () => {
  assertActionInventoryReconciled(actionsLock, thirdParty);
});

test("third-party inventory rejects an action added only to actions.lock", () => {
  const untrackedIdentity = `example/action@${"a".repeat(40)}`;
  for (const dependencyKey of [`'${untrackedIdentity}'`, `"${untrackedIdentity}"`]) {
    const driftedLock = actionsLock.replace(
      "dependencies:",
      `dependencies:\n    ${dependencyKey}:\n        ref: 'v1.0.0'`,
    );
    assert.throws(() => assertActionInventoryReconciled(driftedLock, thirdParty));
  }
});

test("actions.lock reconciliation rejects an inventory-only Action", () => {
  const commit = "b".repeat(40);
  const untrackedRow = `| [\`example/action\`](https://github.com/example/action/tree/${commit}) | v1.0.0 | \`${commit}\` | MIT | Untracked test fixture |`;
  const driftedInventory = thirdParty.replace(
    "## Runtime CLI and OCI tooling",
    `${untrackedRow}\n\n## Runtime CLI and OCI tooling`,
  );
  assert.throws(() => assertActionInventoryReconciled(actionsLock, driftedInventory));
  const compactRow = untrackedRow.replaceAll("| ", "|").replaceAll(" |", "|");
  const compactInventory = thirdParty.replace(
    "## Runtime CLI and OCI tooling",
    `${compactRow}\n\n## Runtime CLI and OCI tooling`,
  );
  assert.throws(() => assertActionInventoryReconciled(actionsLock, compactInventory));
  const noLeadingPipe = compactRow.slice(1);
  const noLeadingInventory = thirdParty.replace(
    "## Runtime CLI and OCI tooling",
    `${noLeadingPipe}\n\n## Runtime CLI and OCI tooling`,
  );
  assert.throws(() => assertActionInventoryReconciled(actionsLock, noLeadingInventory));
});

test("actions.lock reconciliation preserves direct and transitive relationships", () => {
  const checkoutRow = thirdParty
    .split("\n")
    .find((line) => line.includes("actions/checkout/tree/3d3c42e5"));
  assert.ok(checkoutRow);
  const driftedInventory = thirdParty
    .replace(`${checkoutRow}\n`, "")
    .replace("## Trusted validation tooling", `${checkoutRow}\n\n## Trusted validation tooling`);
  assert.throws(() => assertActionInventoryReconciled(actionsLock, driftedInventory));
});

test("hosted media origins stay immutable and complete", () => {
  assert.ok(thirdParty.includes(DEVICON_COMMIT));
  assert.ok(thirdParty.includes(GIF_CATALOG_COMMIT));
  assert.ok(
    thirdParty.includes(`devicons/devicon/blob/${DEVICON_COMMIT}/LICENSE`),
  );
  assert.ok(
    thirdParty.includes(
      `Anmol-Baranwal/Cool-GIFs-For-GitHub/blob/${GIF_CATALOG_COMMIT}/LICENSE`,
    ),
  );
  assert.ok(thirdParty.includes("trademark and brand policies"));
  assert.equal(thirdParty.includes("devicons/devicon/blob/master"), false);

  for (const url of GIF_URLS) {
    assert.ok(thirdParty.includes(url), `Missing hosted-media provenance: ${url}`);
  }
});
