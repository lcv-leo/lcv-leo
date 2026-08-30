import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  DEVICON_COMMIT,
  GIF_CATALOG_COMMIT,
  GIF_URLS,
} from "./pages-provenance-contract.mjs";

const [
  thirdParty,
  actionsLock,
  codeqlWorkflow,
  linearWorkflow,
  pageWorkflow,
  scorecardWorkflow,
  zizmorWorkflow,
  packageManifestSource,
  packageLockSource,
  playwrightBrowsersSource,
  brandLogo,
] = await Promise.all([
  readFile(new URL("../THIRDPARTY.md", import.meta.url), "utf8"),
  readFile(new URL("../.github/workflows/actions.lock", import.meta.url), "utf8"),
  readFile(new URL("../.github/workflows/codeql.yml", import.meta.url), "utf8"),
  readFile(new URL("../.github/workflows/linear-release.yml", import.meta.url), "utf8"),
  readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"),
  readFile(new URL("../.github/workflows/scorecard.yml", import.meta.url), "utf8"),
  readFile(new URL("../.github/workflows/zizmor.yml", import.meta.url), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8"),
  readFile(new URL("../package-lock.json", import.meta.url), "utf8"),
  readFile(new URL("../node_modules/playwright-core/browsers.json", import.meta.url), "utf8"),
  readFile(new URL("../site/assets/lcv-ideas-software-logo.svg", import.meta.url)),
]);

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right, "en"));
}

const BROWSER_PACKAGE_METADATA = new Map([
  [
    "@playwright/test",
    {
      directSection: "devDependencies",
      license: "Apache-2.0",
      order: 0,
      purpose: "Execute browser-level provenance and CSP contract tests",
      relation: "Direct development dependency",
      sourcePath: "packages/playwright-test",
    },
  ],
  [
    "playwright",
    {
      edge: "dependencies",
      license: "Apache-2.0",
      order: 1,
      parent: "@playwright/test",
      purpose: "Browser automation and test runner integration",
      relation: "Transitive dependency of `@playwright/test`",
      sourcePath: "packages/playwright",
    },
  ],
  [
    "playwright-core",
    {
      edge: "dependencies",
      license: "Apache-2.0",
      order: 2,
      parent: "playwright",
      purpose: "Browser protocol and executable management",
      relation: "Transitive dependency of `playwright`",
      sourcePath: "packages/playwright-core",
    },
  ],
  [
    "fsevents",
    {
      edge: "optionalDependencies",
      license: "MIT",
      order: 3,
      parent: "playwright",
      purpose: "Optional macOS filesystem event support",
      relation: "Optional transitive dependency of `playwright`; Darwin only",
    },
  ],
]);

const PLAYWRIGHT_RELEASE_AUDITS = new Map([
  [
    "1.62.1",
    {
      browserArchiveSha256:
        "3cfc2bd00d1bafcf8a68dc74c9c92bb7150ddc8d26ade948a776316e1cec4f14",
      browserLicenseSections: 281,
      browserLicenseSha256:
        "334f3e2d8a58954bc7152a8150bdd3e7f35e0d9bcf30dd323d4edcb7df5f36d5",
      browserRevision: "1234",
      browserVersion: "151.0.7922.34",
      ffmpegArchiveSha256:
        "ebc74fc5b94830176a3c2914ae96bd8bc7f6a91f4f33890230f84a172ee61ccc",
      ffmpegRevision: "1011",
      publishAttempt: 1,
      publishRun: "30562184036",
      sourceCommit: "26a9e470a7b3c7822084b09fb7f13902c5f37b51",
    },
  ],
]);

const BRAND_LOGO_SOURCE_COMMIT = "1b6eed828fd72c8ddc382ab271825015e4f14d10";
const BRAND_LOGO_SHA256 =
  "70631f32e8b4c01d794a3af5016484dd09d51beb0c26abf3a80a9355db179f27";
const BRAND_LOGO_SOURCE_URL =
  `https://github.com/LCV-Ideas-Software/.github/blob/${BRAND_LOGO_SOURCE_COMMIT}/profile/assets/lcv-ideas-software-logo.svg`;

// These regular expressions parse isolated machine syntax, never prose.
function actionIdentityParts(identity, sourceName) {
  const match = /^([^/@]+\/[^/@]+)@([0-9a-f]{40})$/u.exec(identity);
  assert.ok(match, `${sourceName} has an invalid Action identity: ${identity}`);
  return { commit: match[2], repository: match[1] };
}

function actionReferenceParts(identity, sourceName) {
  const match = /^([^/@]+\/[^/@]+)@([^\s@]+)$/u.exec(identity);
  assert.ok(match, `${sourceName} has an invalid Action reference: ${identity}`);
  return { reference: match[2], repository: match[1] };
}

function parseWorkflowVersions(workflowSources) {
  const versions = new Map();
  for (const workflowSource of workflowSources) {
    for (const line of workflowSource.split("\n")) {
      if (line.trimStart().startsWith("#")) continue;
      const match =
        /^\s*(?:-\s*)?uses:\s+([^/@\s]+\/[^/@\s]+)(?:\/[^/@\s]+)*@([0-9a-f]{40})\s+#\s+(\S+)\s*$/u.exec(
          line,
        );
      if (!match) continue;
      const identity = `${match[1]}@${match[2]}`;
      if (versions.has(identity)) {
        assert.equal(versions.get(identity), match[3], `Version comment drifted: ${identity}`);
      }
      versions.set(identity, match[3]);
    }
  }
  return versions;
}

function parseActionsLock(lockSource, workflowSources) {
  assert.ok(lockSource.includes("# This file is machine-generated by `gh actions-lock`."));
  assert.ok(lockSource.includes("version: 'v0.0.2'"));
  const lines = lockSource.split("\n").map((line) => line.trimEnd());
  const workflowsStart = lines.indexOf("workflows:");
  const dependenciesStart = lines.indexOf("dependencies:");
  assert.ok(workflowsStart !== -1 && dependenciesStart > workflowsStart);

  const workflowRows = lines
    .slice(workflowsStart + 1, dependenciesStart)
    .filter((line) => line.trimStart().startsWith("- "));
  const directLockIdentities = new Set(
    workflowRows.map((line) => {
      const match = /^ {8}- '([^']+)'$/u.exec(line);
      assert.ok(match, "actions.lock has a non-canonical workflow dependency");
      actionReferenceParts(match[1], "actions.lock workflows");
      return match[1];
    }),
  );

  const dependencies = new Map();
  let current;
  let readingUses = false;
  for (const line of lines.slice(dependenciesStart + 1)) {
    if (line === "") continue;
    const key = /^ {4}'([^']+)':$/u.exec(line);
    if (key) {
      actionReferenceParts(key[1], "actions.lock dependencies");
      assert.equal(dependencies.has(key[1]), false, "Duplicate actions.lock dependency");
      current = {
        commit: undefined,
        lockIdentity: key[1],
        parents: [],
        ref: undefined,
        uses: [],
      };
      dependencies.set(key[1], current);
      readingUses = false;
      continue;
    }
    assert.ok(current, "actions.lock dependency metadata has no parent key");
    const ref = /^ {8}ref: '([^']+)'$/u.exec(line);
    if (ref) {
      assert.equal(current.ref, undefined, `Duplicate actions.lock ref: ${current.identity}`);
      current.ref = ref[1];
      readingUses = false;
      continue;
    }
    const commit = /^ {8}commit: 'sha1-([0-9a-f]{40})'$/u.exec(line);
    if (commit) {
      assert.equal(
        current.commit,
        undefined,
        `Duplicate actions.lock commit: ${current.lockIdentity}`,
      );
      current.commit = commit[1];
      readingUses = false;
      continue;
    }
    if (line === "        uses:") {
      assert.equal(readingUses, false, `Duplicate actions.lock uses: ${current.identity}`);
      readingUses = true;
      continue;
    }
    const usedIdentity = /^ {12}- '([^']+)'$/u.exec(line);
    if (usedIdentity) {
      assert.equal(readingUses, true, "actions.lock uses item is outside a uses list");
      actionReferenceParts(usedIdentity[1], "actions.lock transitive dependency");
      current.uses.push(usedIdentity[1]);
      continue;
    }
    assert.match(
      line,
      /^ {8}(?:owner_id: \d+|repo_id: \d+)$/u,
      `Non-canonical actions.lock dependency metadata: ${line}`,
    );
    readingUses = false;
  }
  assert.ok(dependencies.size > 0);
  const directVersions = parseWorkflowVersions(workflowSources);
  assert.deepEqual(
    sorted(directLockIdentities),
    sorted(directVersions.keys()),
    "actions.lock workflows must use the exact refs declared by workflow uses",
  );
  for (const identity of directLockIdentities) assert.ok(dependencies.has(identity));
  for (const dependency of dependencies.values()) {
    assert.ok(dependency.ref, `actions.lock dependency has no ref: ${dependency.lockIdentity}`);
    assert.ok(
      dependency.commit,
      `actions.lock dependency has no commit: ${dependency.lockIdentity}`,
    );
    assert.equal(new Set(dependency.uses).size, dependency.uses.length);
    for (const childIdentity of dependency.uses) {
      const child = dependencies.get(childIdentity);
      assert.ok(child, `actions.lock transitive dependency is missing: ${childIdentity}`);
      child.parents.push(
        actionReferenceParts(dependency.lockIdentity, "actions.lock").repository,
      );
    }
    const { repository } = actionReferenceParts(
      dependency.lockIdentity,
      "actions.lock",
    );
    dependency.identity = `${repository}@${dependency.commit}`;
  }
  assert.equal(
    new Set([...dependencies.values()].map((dependency) => dependency.identity)).size,
    dependencies.size,
    "actions.lock maps multiple references to the same repository commit",
  );
  const directDependencies = [...directLockIdentities].map((identity) =>
    dependencies.get(identity),
  );
  const directIdentities = new Set(
    directDependencies.map((dependency) => dependency.identity),
  );
  for (const dependency of directDependencies) {
    const workflowVersion = directVersions.get(dependency.identity);
    assert.ok(
      workflowVersion,
      `Workflow version comment is missing: ${dependency.identity}`,
    );
    if (!/^[0-9a-f]{40}$/u.test(dependency.ref)) {
      assert.equal(
        workflowVersion,
        dependency.ref,
        `Workflow version drifted: ${dependency.identity}`,
      );
    }
    dependency.version = workflowVersion;
  }
  for (const dependency of dependencies.values()) {
    dependency.parents = sorted(new Set(dependency.parents));
    dependency.version ??= dependency.ref;
  }
  const transitive = [...dependencies.values()].filter(
    (dependency) => !directIdentities.has(dependency.identity),
  );
  for (const dependency of transitive) {
    assert.ok(
      dependency.parents.length > 0,
      `actions.lock contains an orphan transitive dependency: ${dependency.identity}`,
    );
  }
  return {
    direct: directDependencies.sort((left, right) =>
      left.identity.localeCompare(right.identity, "en"),
    ),
    transitive: transitive.sort((left, right) =>
      left.identity.localeCompare(right.identity, "en"),
    ),
  };
}

function extractSection(content, heading, nextHeading) {
  const start = content.indexOf(heading);
  const end = content.indexOf(nextHeading, start + heading.length);
  assert.ok(start !== -1 && end > start, `THIRDPARTY section drifted: ${heading}`);
  return content.slice(start, end);
}

function parseJsonObject(source, sourceName) {
  const parsed = JSON.parse(source);
  assert.ok(
    parsed && typeof parsed === "object" && !Array.isArray(parsed),
    `${sourceName} must contain one JSON object`,
  );
  return parsed;
}

function extractTableRows(content, header, columnCount, sourceName) {
  const lines = content.split("\n").map((line) => line.trimEnd());
  const headerIndex = lines.indexOf(header);
  assert.ok(headerIndex !== -1, `${sourceName} table header is missing`);
  assert.equal(
    lines[headerIndex + 1],
    `|${" --- |".repeat(columnCount)}`,
    `${sourceName} table separator drifted`,
  );
  const rows = [];
  for (const line of lines.slice(headerIndex + 2)) {
    if (line === "") break;
    assert.ok(line.startsWith("|") && line.endsWith("|"), `${sourceName} row drifted`);
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    assert.equal(cells.length, columnCount, `${sourceName} column count drifted`);
    rows.push(cells);
  }
  assert.ok(rows.length > 0, `${sourceName} table must not be empty`);
  return rows;
}

function packageNameFromLockLocation(location) {
  const marker = "node_modules/";
  const markerIndex = location.lastIndexOf(marker);
  assert.ok(markerIndex !== -1, `Unsupported package-lock location: ${location}`);
  const suffix = location.slice(markerIndex + marker.length);
  const match = /^(?:@[^/]+\/[^/]+|[^/]+)$/u.exec(suffix);
  assert.ok(match, `Unsupported package-lock location: ${location}`);
  return suffix;
}

function browserPackageRow(packageName, packageNode) {
  const metadata = BROWSER_PACKAGE_METADATA.get(packageName);
  assert.ok(metadata, `Missing browser package metadata: ${packageName}`);
  const sourceUrl = metadata.sourcePath
    ? `https://github.com/microsoft/playwright/tree/v${packageNode.version}/${metadata.sourcePath}`
    : `https://github.com/fsevents/fsevents/tree/v${packageNode.version}`;
  const licenseUrl = metadata.sourcePath
    ? `https://github.com/microsoft/playwright/blob/v${packageNode.version}/LICENSE`
    : `https://github.com/fsevents/fsevents/blob/v${packageNode.version}/LICENSE`;
  return [
    `[\`${packageName}\`](${sourceUrl})`,
    packageNode.version,
    metadata.relation,
    `\`${packageNode.integrity}\``,
    `[${metadata.license}](${licenseUrl})`,
    metadata.purpose,
  ];
}

function assertBrowserToolInventory(
  manifestSource,
  lockSource,
  browsersSource,
  thirdPartySource,
) {
  const manifest = parseJsonObject(manifestSource, "package.json");
  const lock = parseJsonObject(lockSource, "package-lock.json");
  assert.equal(lock.lockfileVersion, 3, "package-lock.json must use lockfileVersion 3");
  assert.equal(lock.name, manifest.name, "package manifest and lockfile names drifted");
  assert.ok(lock.packages && typeof lock.packages === "object" && !Array.isArray(lock.packages));
  const lockRoot = lock.packages[""];
  assert.ok(lockRoot && typeof lockRoot === "object", "package-lock.json root package is missing");
  assert.equal(lockRoot.name, manifest.name, "package-lock.json root name drifted");

  const dependencySections = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
  ];
  for (const section of dependencySections) {
    assert.deepEqual(
      lockRoot[section] ?? {},
      manifest[section] ?? {},
      `${section} drifted between package.json and package-lock.json`,
    );
  }

  const packages = new Map();
  for (const [location, packageNode] of Object.entries(lock.packages)) {
    if (location === "") continue;
    assert.ok(
      packageNode && typeof packageNode === "object" && !Array.isArray(packageNode),
      `Invalid package-lock node: ${location}`,
    );
    const packageName = packageNameFromLockLocation(location);
    assert.equal(packages.has(packageName), false, `Duplicate package in lockfile: ${packageName}`);
    assert.ok(
      BROWSER_PACKAGE_METADATA.has(packageName),
      `Uninventoried lockfile package: ${packageName}`,
    );
    for (const field of ["version", "resolved", "integrity", "license"]) {
      assert.equal(
        typeof packageNode[field],
        "string",
        `package-lock ${packageName} has no ${field}`,
      );
      assert.ok(packageNode[field].length > 0, `package-lock ${packageName} has empty ${field}`);
    }
    assert.equal(packageNode.dev, true, `${packageName} must remain a development dependency`);
    const resolved = new URL(packageNode.resolved);
    assert.equal(
      resolved.origin,
      "https://registry.npmjs.org",
      `${packageName} must resolve from the official npm registry`,
    );
    assert.match(packageNode.integrity, /^sha512-[A-Za-z0-9+/]+={0,2}$/u);
    packages.set(packageName, { location, node: packageNode });
  }
  assert.deepEqual(
    sorted(packages.keys()),
    sorted(BROWSER_PACKAGE_METADATA.keys()),
    "CI-only browser inventory must equal the complete package-lock dependency set",
  );

  for (const [packageName, metadata] of BROWSER_PACKAGE_METADATA) {
    const record = packages.get(packageName);
    assert.ok(record, `Missing locked browser package: ${packageName}`);
    assert.equal(record.node.license, metadata.license, `${packageName} license metadata drifted`);
    for (const section of dependencySections) {
      const declaredDirectly = Object.hasOwn(manifest[section] ?? {}, packageName);
      assert.equal(
        declaredDirectly,
        metadata.directSection === section,
        `${packageName} direct dependency relation drifted in ${section}`,
      );
    }
    if (metadata.directSection) {
      assert.equal(
        manifest[metadata.directSection]?.[packageName],
        record.node.version,
        `${packageName} must be exactly pinned as a direct dependency`,
      );
    } else {
      const parent = packages.get(metadata.parent);
      assert.ok(parent, `Missing ${packageName} parent package: ${metadata.parent}`);
      assert.equal(
        parent.node[metadata.edge]?.[packageName],
        record.node.version,
        `${packageName} dependency edge drifted`,
      );
    }
  }
  const fsevents = packages.get("fsevents").node;
  assert.equal(fsevents.optional, true, "fsevents must remain optional");
  assert.deepEqual(fsevents.os, ["darwin"], "fsevents must remain Darwin-only");

  const browserSection = extractSection(
    thirdPartySource,
    "## CI-only browser validation tooling",
    "## Fonts, icons, and hosted media",
  );
  const packageRows = extractTableRows(
    browserSection,
    "| Component | Version | Relation | npm integrity | License | Purpose |",
    6,
    "CI-only npm package inventory",
  );
  const expectedPackageRows = [...BROWSER_PACKAGE_METADATA.entries()]
    .sort(([, left], [, right]) => left.order - right.order)
    .map(([packageName]) => browserPackageRow(packageName, packages.get(packageName).node));
  assert.deepEqual(
    packageRows,
    expectedPackageRows,
    "THIRDPARTY CI-only package rows must equal package-lock.json",
  );

  const playwrightVersion = packages.get("playwright-core").node.version;
  for (const packageName of ["@playwright/test", "playwright"]) {
    assert.equal(
      packages.get(packageName).node.version,
      playwrightVersion,
      `${packageName} and playwright-core versions drifted`,
    );
  }
  const audit = PLAYWRIGHT_RELEASE_AUDITS.get(playwrightVersion);
  assert.ok(
    audit,
    `Playwright ${playwrightVersion} needs a reviewed provenance and browser artifact audit`,
  );
  const expectedProvenance = [
    `The three Playwright ${playwrightVersion} npm packages publish SLSA provenance from the`,
    `official [\`microsoft/playwright\` v${playwrightVersion} source](https://github.com/microsoft/playwright/tree/v${playwrightVersion}),`,
    `signed commit \`${audit.sourceCommit}\`, and publish workflow run`,
    `\`${audit.publishRun}\`, attempt ${audit.publishAttempt}. Their distributed archives include the Apache-2.0`,
    "license; `playwright` and `playwright-core` also include the upstream Playwright",
    "NOTICE. The npm integrities above are enforced by the committed lockfile.",
  ].join("\n");
  assert.equal(
    browserSection.split(expectedProvenance).length - 1,
    1,
    "Playwright npm provenance drifted",
  );

  const browsers = parseJsonObject(browsersSource, "playwright-core/browsers.json");
  assert.ok(Array.isArray(browsers.browsers), "Playwright browser descriptor list is missing");
  const descriptor = (name) => {
    const matches = browsers.browsers.filter((browser) => browser.name === name);
    assert.equal(matches.length, 1, `Playwright descriptor must contain one ${name}`);
    return matches[0];
  };
  const headlessShell = descriptor("chromium-headless-shell");
  const ffmpeg = descriptor("ffmpeg");
  assert.equal(headlessShell.revision, audit.browserRevision, "headless shell revision drifted");
  assert.equal(headlessShell.browserVersion, audit.browserVersion, "headless shell version drifted");
  assert.equal(headlessShell.installByDefault, true, "headless shell install contract drifted");
  assert.equal(ffmpeg.revision, audit.ffmpegRevision, "Playwright FFmpeg revision drifted");
  assert.equal(ffmpeg.installByDefault, true, "Playwright FFmpeg install contract drifted");

  const artifactRows = extractTableRows(
    browserSection,
    "| Component | Version | Origin and observed integrity | License or terms | Purpose |",
    5,
    "CI-only browser artifact inventory",
  );
  const expectedArtifactRows = [
    [
      "Chrome Headless Shell",
      `${audit.browserVersion}, Playwright revision ${audit.browserRevision}`,
      `[Official Playwright descriptor](https://github.com/microsoft/playwright/blob/v${playwrightVersion}/packages/playwright-core/browsers.json); [versioned Chrome for Testing archive](https://cdn.playwright.dev/builds/cft/${audit.browserVersion}/linux64/chrome-headless-shell-linux64.zip); archive SHA-256 observed on 30/08/2026: \`${audit.browserArchiveSha256}\``,
      `The archive supplies Chromium's \`LICENSE.headless_shell\` (observed SHA-256 \`${audit.browserLicenseSha256}\`) with ${audit.browserLicenseSections} bundled third-party license sections; the executable is not represented as a single SPDX license`,
      "Execute Chromium headless for semantic DOM, request, and CSP validation",
    ],
    [
      "Playwright FFmpeg",
      `Build ${audit.ffmpegRevision}`,
      `[Versioned official Playwright archive](https://cdn.playwright.dev/dbazure/download/playwright/builds/ffmpeg/${audit.ffmpegRevision}/ffmpeg-linux.zip); archive SHA-256 observed on 30/08/2026: \`${audit.ffmpegArchiveSha256}\``,
      "The archive supplies `COPYING.LGPLv2.1`; exact redistribution terms for the prebuilt binary remain **INCONCLUSIVE** without its complete build configuration and incorporated-component inventory",
      "Playwright-supplied CI media helper",
    ],
  ];
  assert.deepEqual(
    artifactRows,
    expectedArtifactRows,
    "THIRDPARTY browser artifacts must equal the installed Playwright descriptor and audit",
  );
  const expectedCaveat = [
    "The browser and FFmpeg hashes are dated audit evidence, not integrity values",
    `enforced by \`package-lock.json\`. Playwright ${playwrightVersion} selects their versioned`,
    "revisions and validates download size, but its installer does not enforce these",
    "recorded SHA-256 values. Neither executable is redistributed in the GitHub",
    "Pages artifact; reassess the complete bundled notices and FFmpeg build terms",
    "before any future redistribution.",
  ].join("\n");
  assert.equal(
    browserSection.split(expectedCaveat).length - 1,
    1,
    "Browser artifact integrity caveat drifted",
  );
}

function assertBrandLogoProvenance(thirdPartySource, logoBytes) {
  const mediaSection = extractSection(
    thirdPartySource,
    "## Fonts, icons, and hosted media",
    "### Decorative profile GIFs",
  );
  const expectedBlock = [
    "The repository-local",
    "[`site/assets/lcv-ideas-software-logo.svg`](site/assets/lcv-ideas-software-logo.svg)",
    "is first-party proprietary content, not a third-party component. It was copied",
    `from the approved [organization-governance source](${BRAND_LOGO_SOURCE_URL})`,
    `at commit \`${BRAND_LOGO_SOURCE_COMMIT}\`; its SHA-256 is`,
    `\`${BRAND_LOGO_SHA256}\`.`,
    "Runtime rendering no longer depends on another LCV repository.",
  ].join("\n");
  const blockStart = mediaSection.indexOf("The repository-local\n");
  const blockEnd = mediaSection.indexOf("\n\nThe MIT license applies", blockStart);
  assert.ok(blockStart !== -1 && blockEnd > blockStart, "Logo provenance block is missing");
  const documentedBlock = mediaSection.slice(blockStart, blockEnd);
  assert.equal(documentedBlock, expectedBlock, "Repository-local logo provenance drifted");
  const documentedDigests = [
    ...documentedBlock.matchAll(/`([0-9a-f]{64})`/gu),
  ].map((match) => match[1]);
  assert.deepEqual(documentedDigests, [BRAND_LOGO_SHA256]);
  const actualDigest = createHash("sha256").update(logoBytes).digest("hex");
  assert.equal(
    actualDigest,
    documentedDigests[0],
    "site/assets/lcv-ideas-software-logo.svg drifted from its documented digest",
  );
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

const ACTION_LICENSES = new Map([
  ["actions/checkout", "MIT"],
  ["actions/setup-node", "MIT"],
  ["github/codeql-action", "MIT"],
  ["linear/linear-release-action", "MIT"],
  ["actions/configure-pages", "MIT"],
  ["actions/deploy-pages", "MIT"],
  ["actions/upload-pages-artifact", "MIT"],
  ["actions/upload-artifact", "MIT"],
  ["ossf/scorecard-action", "Apache-2.0"],
  ["zizmorcore/zizmor-action", "MIT"],
]);

const DIRECT_ACTION_PURPOSES = new Map([
  ["actions/checkout", "Read repository snapshots without persisting credentials"],
  [
    "actions/setup-node",
    "Configure the exact Node.js runtime for validation and Pages generation",
  ],
  ["github/codeql-action", "CodeQL analysis and SARIF upload"],
  ["linear/linear-release-action", "Synchronize successful Pages deployments with Linear"],
  ["actions/configure-pages", "Configure GitHub Pages"],
  ["actions/deploy-pages", "Deploy the Pages artifact"],
  ["actions/upload-pages-artifact", "Package the Pages artifact"],
  ["actions/upload-artifact", "Retain Scorecard SARIF"],
  ["ossf/scorecard-action", "Assess supply-chain posture"],
  ["zizmorcore/zizmor-action", "Audit GitHub Actions workflows"],
]);

function assertInventoryRows(dependencies, rows, relationship) {
  const message = `THIRDPARTY ${relationship} Actions must equal actions.lock`;
  assert.equal(rows.length, dependencies.length, message);
  for (const dependency of dependencies) {
    const { commit, repository } = actionIdentityParts(
      dependency.identity,
      "actions.lock",
    );
    const component = `[\`${repository}\`](https://github.com/${repository}/tree/${commit})`;
    const matches = rows.filter((row) => row.split("|")[1]?.trim() === component);
    assert.equal(matches.length, 1, message);
    const cells = matches[0]
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    assert.equal(cells.length, 5, message);
    assert.equal(cells[1], dependency.version, message);
    assert.equal(cells[2], `\`${commit}\``, message);
    assert.equal(cells[3], ACTION_LICENSES.get(repository), message);
    if (relationship === "transitive") {
      const canonicalParents = dependency.parents.map((parent) => `\`${parent}\``).join(", ");
      assert.equal(cells[4], canonicalParents, message);
    } else {
      assert.equal(cells[4], DIRECT_ACTION_PURPOSES.get(repository), message);
    }
  }
}

function assertActionInventoryReconciled(actionsLockSource, thirdPartySource) {
  const workflowSources = [
    codeqlWorkflow,
    linearWorkflow,
    pageWorkflow,
    scorecardWorkflow,
    zizmorWorkflow,
  ];
  const { direct, transitive } = parseActionsLock(actionsLockSource, workflowSources);
  for (const [dependencies, heading, nextHeading, relationship] of [
    [direct, "## Direct GitHub Actions", "## Runtime CLI and OCI tooling", "direct"],
    [transitive, "## Transitive GitHub Actions", "## Trusted validation tooling", "transitive"],
  ]) {
    assertInventoryRows(
      dependencies,
      extractActionRows(thirdPartySource, heading, nextHeading),
      relationship,
    );
  }
}

function assertPullRequestActivityTypes(workflowSource) {
  const lines = workflowSource.replaceAll("\r\n", "\n").split("\n");
  const start = lines.indexOf("  pull_request:");
  assert.notEqual(start, -1, "Pages workflow needs one pull_request trigger");
  const duplicate = lines.indexOf("  pull_request:", start + 1);
  assert.equal(duplicate, -1, "Pages workflow must not duplicate pull_request triggers");
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^ {2}[a-z_]+:$/u.test(lines[index])) {
      end = index;
      break;
    }
  }
  assert.deepEqual(lines.slice(start, end), [
    "  pull_request:",
    "    branches:",
    "      - main",
    "    types:",
    "      - edited",
    "      - opened",
    "      - ready_for_review",
    "      - reopened",
    "      - synchronize",
  ]);
}

function assertPageTestTokenBoundary(workflowSource) {
  const normalizedWorkflow = workflowSource.replaceAll("\r\n", "\n");
  const testJobStart = normalizedWorkflow.indexOf("  test-snake:");
  const buildJobStart = normalizedWorkflow.indexOf("\n  build:", testJobStart);
  assert.ok(testJobStart !== -1 && buildJobStart > testJobStart);
  const testJob = normalizedWorkflow.slice(testJobStart, buildJobStart);
  const stepsStart = testJob.indexOf("    steps:\n");
  assert.ok(stepsStart !== -1);
  const preamble = testJob.slice(0, stepsStart);
  assert.doesNotMatch(preamble, /^\s+env:/mu);

  const steps = testJob
    .slice(stepsStart + "    steps:\n".length)
    .split(/(?=^ {6}- )/mu)
    .map((step) => step.trimEnd())
    .filter(Boolean);
  assert.deepEqual(steps, [
    [
      "      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1",
      "        with:",
      "          persist-credentials: false",
    ].join("\n"),
    [
      "      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0",
      "        with:",
      '          node-version: "24.20.0"',
      "          package-manager-cache: false",
    ].join("\n"),
    [
      "      - name: Install locked test dependencies without lifecycle scripts",
      "        run: npm ci --ignore-scripts",
    ].join("\n"),
    [
      "      - name: Install official Playwright Chromium headless shell",
      "        run: ./node_modules/.bin/playwright install --with-deps --only-shell chromium",
    ].join("\n"),
    [
      "      - name: Install official GitHub Actions lock validator",
      "        shell: bash",
      "        env:",
      "          ACTIONS_LOCK_SHA256: 4181ec1da5408b34b9a542a7ee5c6ce3a4d6ac815c7d0206a00ceca8a817f4e3",
      "          ACTIONS_LOCK_URL: https://github.com/github/gh-actions-lock/releases/download/v0.1.6/linux-amd64",
      "        run: |",
      "          set -euo pipefail",
      '          readonly binary="${RUNNER_TEMP}/gh-actions-lock"',
      "          curl \\",
      "            --fail \\",
      "            --location \\",
      "            --proto '=https' \\",
      "            --proto-redir '=https' \\",
      "            --show-error \\",
      "            --silent \\",
      "            --tlsv1.2 \\",
      '            "${ACTIONS_LOCK_URL}" \\',
      '            --output "${binary}"',
      "          printf '%s  %s\\n' \"${ACTIONS_LOCK_SHA256}\" \"${binary}\" | sha256sum --check --strict",
      '          chmod 0500 "${binary}"',
      "          printf '%s\\n' \"${RUNNER_TEMP}\" >>\"${GITHUB_PATH}\"",
    ].join("\n"),
    [
      "      - name: Verify actions.lock with the official GitHub validator",
      "        run: >-",
      "          gh-actions-lock",
      "          --verify-local",
      "          --no-fix",
      "          --no-migrate-local-actions",
    ].join("\n"),
    [
      "      - name: Reverify actions.lock against GitHub on a trusted ref",
      "        if: github.event_name != 'pull_request'",
      "        env:",
      "          GH_TOKEN: ${{ github.token }}",
      "        run: >-",
      "          gh-actions-lock",
      "          --verify",
      "          --no-migrate-local-actions",
    ].join("\n"),
    [
      "      - name: Run local repository tests without credentials",
      "        run: >-",
      "          node --test",
      "          scripts/generate-contribution-snake.test.mjs",
      "          scripts/linear-release-trust.test.mjs",
    ].join("\n"),
    [
      "      - name: Run provenance tests without credentials",
      "        if: github.event_name == 'pull_request'",
      "        run: |",
      "          node --test scripts/provenance-drift.test.mjs",
      "          ./node_modules/.bin/playwright test",
    ].join("\n"),
    [
      "      - name: Run provenance tests on a trusted ref",
      "        if: github.event_name != 'pull_request'",
      "        env:",
      "          GITHUB_TOKEN: ${{ github.token }}",
      "        run: |",
      "          node --test scripts/provenance-drift.test.mjs",
      "          ./node_modules/.bin/playwright test",
    ].join("\n"),
  ]);
  assert.equal(testJob.split("${{ github.token }}").length - 1, 2);
  assert.equal(testJob.split("GITHUB_TOKEN:").length - 1, 1);
  assert.equal(testJob.split("GH_TOKEN:").length - 1, 1);
}

test("pull-request retargeting reruns the repository-local gate", () => {
  assertPullRequestActivityTypes(pageWorkflow);
  for (const mutant of [
    pageWorkflow.replace("      - edited\n", ""),
    pageWorkflow.replace("      - ready_for_review\n", "      # - ready_for_review\n"),
  ]) {
    assert.notEqual(mutant, pageWorkflow);
    assert.throws(() => assertPullRequestActivityTypes(mutant));
  }
});

test("pull-request tests never receive GITHUB_TOKEN", () => {
  assertPageTestTokenBoundary(pageWorkflow);
  const auxiliaryTokenStep = [
    "      - name: Auxiliary pull-request step",
    "        if: github.event_name == 'pull_request'",
    "        env:",
    "          GH_TOKEN: ${{ github['token'] }}",
    "        run: echo exposed",
  ].join("\n");
  const mutants = [
    pageWorkflow.replace("GITHUB_TOKEN: ${{ github.token }}", "GH_TOKEN: ${{ github.token }}"),
    pageWorkflow.replace(
      "          ./node_modules/.bin/playwright test",
      '          echo "${{ github.token }}"\n          ./node_modules/.bin/playwright test',
    ),
    pageWorkflow.replace(
      "    timeout-minutes: 15",
      "    timeout-minutes: 15\n    env:\n      GITHUB_TOKEN: ${{ github.token }}",
    ),
    pageWorkflow.replace(
      "      - name: Run provenance tests on a trusted ref",
      "      - name: Run a second pull-request test\n        if: github.event_name == 'pull_request'\n        env:\n          GITHUB_TOKEN: ${{ github.token }}\n        run: ./node_modules/.bin/playwright test\n\n      - name: Run provenance tests on a trusted ref",
    ),
    pageWorkflow.replace(
      "      - name: Run local repository tests without credentials",
      `${auxiliaryTokenStep}\n\n      - name: Run local repository tests without credentials`,
    ),
  ];
  for (const mutant of mutants) {
    assert.notEqual(mutant, pageWorkflow);
    assert.throws(() => assertPageTestTokenBoundary(mutant));
  }
});

const RUNTIME_TOOL_ROWS = [
  [
    "[`linear/linear-release`](https://github.com/linear/linear-release/tree/2c3741305c53275f884294aad7c2db5f28015938)",
    "v0.17.1",
    "[Immutable release](https://github.com/linear/linear-release/releases/tag/v0.17.1), commit `2c3741305c53275f884294aad7c2db5f28015938`; Linux x64 SHA-256 `122461a09eadb74e5be1a57d7127fce7ed3b71a7a3b57abf424710c3e862cd58`",
    "[MIT](https://github.com/linear/linear-release/blob/2c3741305c53275f884294aad7c2db5f28015938/LICENSE)",
    "`linear/linear-release-action`",
  ],
  [
    "[`ossf/scorecard-action` OCI image](https://github.com/orgs/ossf/packages/container/scorecard-action/1061343653)",
    "v2.4.4",
    "The pinned Action's [`action.yaml`](https://github.com/ossf/scorecard-action/blob/2d1146689b8cda280b9bc96326124645441f03bc/action.yaml) selects `ghcr.io/ossf/scorecard-action:v2.4.4`; on 30/08/2026, the official tag resolved to manifest digest `sha256:ae5104dd3cc28466ebeb11144354be4cac4b7ff829654f9fab89021d71c46670`",
    "[Apache-2.0](https://github.com/ossf/scorecard-action/blob/2d1146689b8cda280b9bc96326124645441f03bc/LICENSE)",
    "`ossf/scorecard-action`",
  ],
  [
    "[`zizmorcore/zizmor`](https://github.com/zizmorcore/zizmor/tree/3c116961091b50bd1a08ffefe916469d4d90093c)",
    "1.29.0",
    "OCI image `ghcr.io/zizmorcore/zizmor:1.29.0@sha256:863026d54f91271b10b60b67ad8054cb37120167e162482597db102b3026a284`, recorded by the pinned Action in [`support/versions`](https://github.com/zizmorcore/zizmor-action/blob/3dc1ecc9bcb9e94e9b2c709687979e1298497054/support/versions)",
    "[MIT](https://github.com/zizmorcore/zizmor/blob/3c116961091b50bd1a08ffefe916469d4d90093c/LICENSE)",
    "`zizmorcore/zizmor-action`",
  ],
  [
    "[GitHub CodeQL CLI](https://github.com/github/codeql-action/releases/tag/codeql-bundle-v2.26.4)",
    "2.26.4 (`codeql-bundle-v2.26.4`)",
    "Immutable release selected by the pinned Action's [`defaults.json`](https://github.com/github/codeql-action/blob/cdf488f595d80d6e07e03d4674febd5ab45fa938/src/defaults.json); Linux x64 `.tar.zst` SHA-256 `a9872c9075f85374a8d03546263c6dc01fde50a29baea9fc08dcc6b25cc2efd5`",
    "[GitHub CodeQL terms](https://docs.github.com/en/code-security/codeql-cli/codeql-cli-reference/about-the-codeql-cli#license)",
    "`github/codeql-action`",
  ],
  [
    "[Node.js](https://github.com/nodejs/node/tree/71b8b174857e25106d39b61a9e6f30d927da8b01)",
    "24.20.0",
    "[Signed v24.20.0 release](https://nodejs.org/dist/v24.20.0/), commit `71b8b174857e25106d39b61a9e6f30d927da8b01`; Linux x64 `.tar.xz` SHA-256 `2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2`",
    "[MIT](https://github.com/nodejs/node/blob/71b8b174857e25106d39b61a9e6f30d927da8b01/LICENSE)",
    "`actions/setup-node` in validation and Pages build jobs",
  ],
  [
    "[`npm` and `npx`](https://github.com/npm/cli/tree/bfacd33ccbcd908480610703b60455d2da5b57a9)",
    "11.19.0",
    "Bundled by the signed Node.js v24.20.0 distribution and recorded as `npm: 11.19.0` in the [official release index](https://nodejs.org/dist/index.json); integrity is covered by the Node.js archive SHA-256 above",
    "[Artistic-2.0](https://github.com/npm/cli/blob/bfacd33ccbcd908480610703b60455d2da5b57a9/LICENSE)",
    "Repository test and browser-install commands",
  ],
];

const TRUSTED_VALIDATION_TOOL_ROW = [
  "[`github/gh-actions-lock`](https://github.com/github/gh-actions-lock/tree/047fddf38163b304f1e6ef5649f5ac1646edc6a3)",
  "v0.1.6",
  "[Release](https://github.com/github/gh-actions-lock/releases/tag/v0.1.6), signed commit `047fddf38163b304f1e6ef5649f5ac1646edc6a3`; Linux AMD64 SHA-256 `4181ec1da5408b34b9a542a7ee5c6ce3a4d6ac815c7d0206a00ceca8a817f4e3`",
  "[MIT](https://github.com/github/gh-actions-lock/blob/047fddf38163b304f1e6ef5649f5ac1646edc6a3/LICENSE)",
  "Verify Action pins and lockfile coverage",
];

function extractRuntimeToolRows(content) {
  const section = extractSection(
    content,
    "## Runtime CLI and OCI tooling",
    "## Transitive GitHub Actions",
  );
  const lines = section.split("\n").map((line) => line.trimEnd());
  const header = lines.indexOf(
    "| Component | Version | Immutable origin and integrity | License or terms | Executed by |",
  );
  assert.ok(header !== -1 && lines[header + 1] === "| --- | --- | --- | --- | --- |");
  const rows = [];
  for (const line of lines.slice(header + 2)) {
    if (line === "") break;
    assert.ok(line.startsWith("|") && line.endsWith("|"), "Non-canonical runtime row");
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    assert.equal(cells.length, 5, "Runtime inventory must have exactly five cells");
    rows.push(cells);
  }
  return rows;
}

function extractTrustedValidationToolRows(content) {
  const section = extractSection(
    content,
    "## Trusted validation tooling",
    "## Fonts, icons, and hosted media",
  );
  const lines = section.split("\n").map((line) => line.trimEnd());
  const header = lines.indexOf("| Component | Version | Integrity | License | Purpose |");
  assert.ok(header !== -1 && lines[header + 1] === "| --- | --- | --- | --- | --- |");
  const rows = [];
  for (const line of lines.slice(header + 2)) {
    if (line === "") break;
    assert.ok(line.startsWith("|") && line.endsWith("|"), "Non-canonical trusted row");
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    assert.equal(cells.length, 5, "Trusted inventory must have exactly five cells");
    rows.push(cells);
  }
  return rows;
}

function inlineActionStepInputs(
  workflowSource,
  actionIdentity,
  expectedVersionComment,
  sourceName,
) {
  const lines = workflowSource.replaceAll("\r\n", "\n").split("\n");
  const selectedSteps = [];
  for (const [index, line] of lines.entries()) {
    assert.doesNotMatch(line, /\t/u, `${sourceName} must use spaces for indentation`);
    if (line.trimStart().startsWith("#")) continue;
    const match = /^ {6}- uses:\s+(\S+)\s+#\s+(\S+)\s*$/u.exec(line);
    if (match?.[1] === actionIdentity) {
      assert.equal(
        match[2],
        expectedVersionComment,
        `${sourceName} Action version comment drifted`,
      );
      selectedSteps.push({ index, inputIndexes: new Map(), inputs: new Map() });
    }
  }

  for (const step of selectedSteps) {
    let stepEnd = lines.length;
    for (let index = step.index + 1; index < lines.length; index += 1) {
      if (/^ {6}- /u.test(lines[index])) {
        stepEnd = index;
        break;
      }
    }
    const withLines = [];
    for (let index = step.index + 1; index < stepEnd; index += 1) {
      if (lines[index] === "        with:") withLines.push(index);
    }
    assert.equal(withLines.length, 1, `${sourceName} Action step needs one with mapping`);
    for (let index = withLines[0] + 1; index < stepEnd; index += 1) {
      const line = lines[index];
      if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
      const indent = line.length - line.trimStart().length;
      if (indent <= 8) break;
      assert.equal(indent, 10, `${sourceName} has a non-canonical with mapping`);
      const match = /^ {10}([a-z_][a-z0-9_-]*):\s+(.+?)\s*$/iu.exec(line);
      assert.ok(match, `${sourceName} has a non-scalar Action input`);
      assert.equal(
        step.inputs.has(match[1]),
        false,
        `${sourceName} has a duplicate ${match[1]} input`,
      );
      step.inputs.set(match[1], match[2]);
      step.inputIndexes.set(match[1], index);
    }
  }
  return { lines, selectedSteps };
}

function actionStepInputs(
  workflowSource,
  actionIdentity,
  expectedVersionComment,
  inputName,
  sourceName,
) {
  const lines = workflowSource.replaceAll("\r\n", "\n").split("\n");
  const uses = [];
  for (const [index, line] of lines.entries()) {
    assert.doesNotMatch(line, /\t/u, `${sourceName} must use spaces for indentation`);
    if (line.trimStart().startsWith("#")) continue;
    const match = /^ {8}uses:\s+(\S+)\s+#\s+(\S+)\s*$/u.exec(line);
    if (match?.[1] === actionIdentity) {
      uses.push({ index, versionComment: match[2] });
    }
  }
  assert.equal(uses.length, 1, `${sourceName} must select ${actionIdentity} exactly once`);
  const selected = uses[0];
  assert.equal(
    selected.versionComment,
    expectedVersionComment,
    `${sourceName} Action version comment drifted`,
  );
  let stepStart = selected.index - 1;
  while (stepStart >= 0 && !/^ {6}- /u.test(lines[stepStart])) stepStart -= 1;
  assert.ok(
    stepStart >= 0 && /^ {6}- name:\s+\S/u.test(lines[stepStart]),
    `${sourceName} Action must be a named canonical step`,
  );
  let stepEnd = lines.length;
  for (let index = selected.index + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^ {6}- /u.test(line)) {
      stepEnd = index;
      break;
    }
  }

  const withLines = [];
  for (let index = selected.index + 1; index < stepEnd; index += 1) {
    const line = lines[index];
    if (line.trimStart().startsWith("#")) continue;
    if (line === "        with:") withLines.push(index);
  }
  assert.equal(withLines.length, 1, `${sourceName} Action step needs one with mapping`);
  const withIndex = withLines[0];
  const inputs = new Map();
  const inputIndexes = new Map();
  for (let index = withIndex + 1; index < stepEnd; index += 1) {
    const line = lines[index];
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    const indent = line.length - line.trimStart().length;
    if (indent <= 8) break;
    assert.equal(indent, 10, `${sourceName} has a non-canonical with mapping`);
    const match = /^ {10}([a-z_][a-z0-9_-]*):\s+(.+?)\s*$/iu.exec(line);
    assert.ok(match, `${sourceName} has a non-scalar Action input`);
    assert.equal(inputs.has(match[1]), false, `${sourceName} has a duplicate ${match[1]} input`);
    inputs.set(match[1], match[2]);
    inputIndexes.set(match[1], index);
  }

  const activeInputIndexes = [];
  const inputPattern = new RegExp(String.raw`^\s*${inputName}:\s+`, "u");
  for (const [index, line] of lines.entries()) {
    if (!line.trimStart().startsWith("#") && inputPattern.test(line)) {
      activeInputIndexes.push(index);
    }
  }
  assert.deepEqual(
    activeInputIndexes,
    [inputIndexes.get(inputName)],
    `${sourceName} ${inputName} must occur once in the selected Action step`,
  );
  return inputs;
}

function assertRuntimeToolInventory(thirdPartySource, workflowOverrides = {}) {
  const currentLinearWorkflow = workflowOverrides.linearWorkflow ?? linearWorkflow;
  const currentPageWorkflow = workflowOverrides.pageWorkflow ?? pageWorkflow;
  const currentZizmorWorkflow = workflowOverrides.zizmorWorkflow ?? zizmorWorkflow;
  const setupNode = inlineActionStepInputs(
    currentPageWorkflow,
    "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020",
    "v7.0.0",
    "Pages workflow",
  );
  assert.equal(setupNode.selectedSteps.length, 2, "Pages workflow needs two setup-node steps");
  for (const step of setupNode.selectedSteps) {
    assert.deepEqual([...step.inputs], [
      ["node-version", '"24.20.0"'],
      ["package-manager-cache", "false"],
    ]);
  }
  for (const inputName of ["node-version", "package-manager-cache"]) {
    const activeInputIndexes = [];
    const inputPattern = new RegExp(String.raw`^\s*${inputName}:\s+`, "u");
    for (const [index, line] of setupNode.lines.entries()) {
      if (!line.trimStart().startsWith("#") && inputPattern.test(line)) {
        activeInputIndexes.push(index);
      }
    }
    assert.deepEqual(
      activeInputIndexes,
      setupNode.selectedSteps.map((step) => step.inputIndexes.get(inputName)),
      `Pages workflow ${inputName} inputs must belong to setup-node steps`,
    );
  }
  assert.ok(
    currentPageWorkflow.includes("github/gh-actions-lock/releases/download/v0.1.6/linux-amd64"),
  );
  assert.ok(
    currentPageWorkflow.includes(
      "ACTIONS_LOCK_SHA256: 4181ec1da5408b34b9a542a7ee5c6ce3a4d6ac815c7d0206a00ceca8a817f4e3",
    ),
  );
  assert.ok(currentPageWorkflow.includes("gh-actions-lock\n          --verify-local\n          --no-fix"));
  assert.ok(
    currentPageWorkflow.includes(
      "Reverify actions.lock against GitHub on a trusted ref\n        if: github.event_name != 'pull_request'\n        env:\n          GH_TOKEN: ${{ github.token }}\n        run: >-\n          gh-actions-lock\n          --verify",
    ),
  );
  assert.ok(
    codeqlWorkflow.includes(
      "github/codeql-action/init@cdf488f595d80d6e07e03d4674febd5ab45fa938 # v4.37.9",
    ),
  );
  const linearInputs = actionStepInputs(
    currentLinearWorkflow,
    "linear/linear-release-action@3f31fcf14c110cc53579fcc3575a26d469c413b4",
    "v0.17.1",
    "cli_version",
    "Linear Release workflow",
  );
  assert.equal(linearInputs.get("cli_version"), "v0.17.1");
  assert.ok(
    scorecardWorkflow.includes(
      "ossf/scorecard-action@2d1146689b8cda280b9bc96326124645441f03bc # v2.4.4",
    ),
  );
  const zizmorInputs = actionStepInputs(
    currentZizmorWorkflow,
    "zizmorcore/zizmor-action@3dc1ecc9bcb9e94e9b2c709687979e1298497054",
    "v0.6.2",
    "version",
    "Zizmor workflow",
  );
  assert.equal(zizmorInputs.get("version"), "1.29.0");

  const actualRows = extractRuntimeToolRows(thirdPartySource);
  assert.equal(actualRows.length, RUNTIME_TOOL_ROWS.length, "Runtime inventory row count drifted");
  for (const expected of RUNTIME_TOOL_ROWS) {
    const matches = actualRows.filter((row) => row[0] === expected[0]);
    assert.equal(matches.length, 1, `Runtime inventory component drifted: ${expected[0]}`);
    assert.deepEqual(matches[0], expected, `Runtime inventory row drifted: ${expected[0]}`);
  }
  const trustedRows = extractTrustedValidationToolRows(thirdPartySource);
  assert.equal(trustedRows.length, 1, "Trusted validation inventory must contain one row");
  assert.deepEqual(
    trustedRows[0],
    TRUSTED_VALIDATION_TOOL_ROW,
    "gh-actions-lock trusted validation row drifted",
  );
}

test("CI-only browser packages and artifacts stay reconciled", () => {
  assertBrowserToolInventory(
    packageManifestSource,
    packageLockSource,
    playwrightBrowsersSource,
    thirdParty,
  );
});

test("CI-only browser inventory rejects lockfile and artifact drift", () => {
  const manifestDrift = parseJsonObject(packageManifestSource, "package.json mutant");
  manifestDrift.devDependencies["@playwright/test"] = "1.62.2";

  const versionDrift = parseJsonObject(packageLockSource, "package-lock.json mutant");
  versionDrift.packages["node_modules/@playwright/test"].version = "1.62.2";

  const integrityDrift = parseJsonObject(packageLockSource, "package-lock.json mutant");
  integrityDrift.packages["node_modules/playwright-core"].integrity =
    `sha512-${"A".repeat(86)}==`;

  const extraPackage = parseJsonObject(packageLockSource, "package-lock.json mutant");
  extraPackage.packages["node_modules/uninventoried-package"] = {
    dev: true,
    integrity: `sha512-${"A".repeat(86)}==`,
    license: "MIT",
    resolved: "https://registry.npmjs.org/uninventoried-package/-/uninventoried-package-1.0.0.tgz",
    version: "1.0.0",
  };

  const descriptorDrift = parseJsonObject(
    playwrightBrowsersSource,
    "playwright-core/browsers.json mutant",
  );
  descriptorDrift.browsers.find(
    (browser) => browser.name === "chromium-headless-shell",
  ).revision = "9999";

  const canonicalLock = parseJsonObject(packageLockSource, "package-lock.json");
  const canonicalPlaywrightVersion =
    canonicalLock.packages["node_modules/playwright-core"].version;
  const canonicalAudit = PLAYWRIGHT_RELEASE_AUDITS.get(canonicalPlaywrightVersion);
  assert.ok(canonicalAudit);
  const staleThirdParty = thirdParty.replace(
    canonicalAudit.sourceCommit,
    "0".repeat(40),
  );
  assert.notEqual(staleThirdParty, thirdParty);

  for (const [name, manifest, lock, browsers, inventory] of [
    [
      "manifest version",
      JSON.stringify(manifestDrift),
      packageLockSource,
      playwrightBrowsersSource,
      thirdParty,
    ],
    [
      "package version",
      packageManifestSource,
      JSON.stringify(versionDrift),
      playwrightBrowsersSource,
      thirdParty,
    ],
    [
      "package integrity",
      packageManifestSource,
      JSON.stringify(integrityDrift),
      playwrightBrowsersSource,
      thirdParty,
    ],
    [
      "complete package set",
      packageManifestSource,
      JSON.stringify(extraPackage),
      playwrightBrowsersSource,
      thirdParty,
    ],
    [
      "browser descriptor",
      packageManifestSource,
      packageLockSource,
      JSON.stringify(descriptorDrift),
      thirdParty,
    ],
    [
      "published provenance",
      packageManifestSource,
      packageLockSource,
      playwrightBrowsersSource,
      staleThirdParty,
    ],
  ]) {
    assert.throws(
      () =>
        assertBrowserToolInventory(
          manifest,
          lock,
          browsers,
          inventory,
        ),
      undefined,
      `${name} drift must be rejected`,
    );
  }
});

test("repository-local brand logo matches its approved documented digest", () => {
  assertBrandLogoProvenance(thirdParty, brandLogo);
});

test("brand logo provenance rejects byte and documented-digest drift", () => {
  const mutatedLogo = Buffer.from(brandLogo);
  mutatedLogo[0] ^= 1;
  assert.throws(() => assertBrandLogoProvenance(thirdParty, mutatedLogo));

  const driftedDocumentation = thirdParty.replace(BRAND_LOGO_SHA256, "0".repeat(64));
  assert.notEqual(driftedDocumentation, thirdParty);
  assert.throws(() => assertBrandLogoProvenance(driftedDocumentation, brandLogo));
});

test("runtime tool versions and immutable origins stay inventoried", () => {
  assertRuntimeToolInventory(thirdParty);
});

test("runtime tool inputs reject stale comments and detached duplicates", () => {
  const buildJobStart = pageWorkflow.indexOf("\n  build:");
  assert.notEqual(buildJobStart, -1);
  const driftedBuildWorkflow =
    pageWorkflow.slice(0, buildJobStart) +
    pageWorkflow
      .slice(buildJobStart)
      .replace(
        '          node-version: "24.20.0"',
        '          node-version: "25.0.0"\n          # node-version: "24.20.0"',
      );
  assert.notEqual(driftedBuildWorkflow, pageWorkflow);
  assert.throws(() =>
    assertRuntimeToolInventory(thirdParty, { pageWorkflow: driftedBuildWorkflow }),
  );

  const driftedLinearWorkflow = linearWorkflow.replace(
    "          cli_version: v0.17.1",
    "          cli_version: v0.18.0\n          # cli_version: v0.17.1",
  );
  assert.notEqual(driftedLinearWorkflow, linearWorkflow);
  assert.throws(() =>
    assertRuntimeToolInventory(thirdParty, { linearWorkflow: driftedLinearWorkflow }),
  );

  const driftedZizmorWorkflow = zizmorWorkflow.replace(
    "          version: 1.29.0",
    "          version: 1.30.0\n          # version: 1.29.0",
  );
  assert.notEqual(driftedZizmorWorkflow, zizmorWorkflow);
  assert.throws(() =>
    assertRuntimeToolInventory(thirdParty, { zizmorWorkflow: driftedZizmorWorkflow }),
  );

  for (const [source, current, drifted, key] of [
    [linearWorkflow, "# v0.17.1", "# v0.18.0", "linearWorkflow"],
    [zizmorWorkflow, "# v0.6.2", "# v0.7.0", "zizmorWorkflow"],
  ]) {
    const driftedComment = source.replace(current, drifted);
    assert.notEqual(driftedComment, source);
    assert.throws(() =>
      assertRuntimeToolInventory(thirdParty, { [key]: driftedComment }),
    );
  }

  const detachedInput = linearWorkflow.replace(
    "          command: sync",
    "          command: sync\n\n      - name: Detached input fixture\n        env:\n          cli_version: v0.17.1",
  );
  assert.notEqual(detachedInput, linearWorkflow);
  assert.throws(() =>
    assertRuntimeToolInventory(thirdParty, { linearWorkflow: detachedInput }),
  );

  const spoofedRunBlock = linearWorkflow
    .replace(
      "linear/linear-release-action@3f31fcf14c110cc53579fcc3575a26d469c413b4 # v0.17.1",
      `linear/linear-release-action@${"a".repeat(40)} # v0.18.0`,
    )
    .replace("          cli_version: v0.17.1", "          next_cli_version: v0.18.0")
    .replace(
      "          command: sync",
      "          command: sync\n\n      - name: Detached run fixture\n        run: |\n          uses: linear/linear-release-action@3f31fcf14c110cc53579fcc3575a26d469c413b4 # v0.17.1\n          with:\n            cli_version: v0.17.1",
    );
  assert.notEqual(spoofedRunBlock, linearWorkflow);
  assert.throws(() =>
    assertRuntimeToolInventory(thirdParty, { linearWorkflow: spoofedRunBlock }),
  );
});

test("runtime provenance stays attached to the correct component row", () => {
  for (const [current, drifted] of [
    ["| 2.26.4 (`codeql-bundle-v2.26.4`) |", "| 0.0.0 (`codeql-bundle-v2.26.4`) |"],
    [
      "a9872c9075f85374a8d03546263c6dc01fde50a29baea9fc08dcc6b25cc2efd5",
      "0".repeat(64),
    ],
    [
      "[GitHub CodeQL terms](https://docs.github.com/en/code-security/codeql-cli/codeql-cli-reference/about-the-codeql-cli#license)",
      "Unknown terms",
    ],
    ["`github/codeql-action` |", "`example/unrelated-action` |"],
  ]) {
    const driftedInventory = thirdParty.replace(current, drifted);
    assert.notEqual(driftedInventory, thirdParty);
    assert.throws(() => assertRuntimeToolInventory(driftedInventory));
  }
});

test("trusted gh-actions-lock metadata stays attached to its exact row", () => {
  for (const [current, drifted] of [
    ["| v0.1.6 |", "| v0.0.0 |"],
    [
      "[MIT](https://github.com/github/gh-actions-lock/blob/047fddf38163b304f1e6ef5649f5ac1646edc6a3/LICENSE)",
      "[Apache-2.0](https://github.com/github/gh-actions-lock/blob/047fddf38163b304f1e6ef5649f5ac1646edc6a3/LICENSE)",
    ],
    ["Verify Action pins and lockfile coverage", "Unrelated validation purpose"],
  ]) {
    const driftedInventory = thirdParty.replace(current, drifted);
    assert.notEqual(driftedInventory, thirdParty);
    assert.throws(() => assertRuntimeToolInventory(driftedInventory));
  }
});

test("THIRDPARTY Action components equal all actions.lock dependencies", () => {
  assertActionInventoryReconciled(actionsLock, thirdParty);
});

test("actions.lock rejects a symbolic direct ref backed by the same commit", () => {
  const directSha =
    "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020";
  const symbolicRef = "actions/setup-node@v7.0.0";
  const driftedLock = actionsLock.replaceAll(directSha, symbolicRef);
  assert.notEqual(driftedLock, actionsLock);
  assert.ok(driftedLock.includes("commit: 'sha1-820762786026740c76f36085b0efc47a31fe5020'"));
  assert.throws(() => assertActionInventoryReconciled(driftedLock, thirdParty));
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

test("actions.lock reconciliation validates versions and transitive parents", () => {
  const wrongVersion = thirdParty.replace(
    "| v6.0.0 | `45bfe0192ca1faeb007ade9deae92b16b8254a0d` |",
    "| v0.0.0 | `45bfe0192ca1faeb007ade9deae92b16b8254a0d` |",
  );
  assert.throws(() => assertActionInventoryReconciled(actionsLock, wrongVersion));

  const wrongParent = thirdParty.replace(
    "| MIT | `actions/upload-pages-artifact` |",
    "| MIT | `example/unrelated-action` |",
  );
  assert.throws(() => assertActionInventoryReconciled(actionsLock, wrongParent));

  for (const parentCell of [
    "prefix `actions/upload-pages-artifact`",
    "`actions/upload-pages-artifact` suffix",
    "`actions/upload-pages-artifact`, `actions/upload-pages-artifact`",
    "`actions/upload-pages-artifact`, `example/unrelated-action`",
  ]) {
    const contradictoryParent = thirdParty.replace(
      "| MIT | `actions/upload-pages-artifact` |",
      `| MIT | ${parentCell} |`,
    );
    assert.notEqual(contradictoryParent, thirdParty);
    assert.throws(() => assertActionInventoryReconciled(actionsLock, contradictoryParent));
  }
});

test("Action inventory rejects an incorrect license", () => {
  const checkoutRow = thirdParty
    .split("\n")
    .find((line) => line.includes("actions/checkout/tree/3d3c42e5"));
  assert.ok(checkoutRow);
  const wrongLicenseRow = checkoutRow.replace(" | MIT | ", " | GPL-3.0 | ");
  assert.notEqual(wrongLicenseRow, checkoutRow);
  const wrongLicenseInventory = thirdParty.replace(checkoutRow, wrongLicenseRow);
  assert.throws(() => assertActionInventoryReconciled(actionsLock, wrongLicenseInventory));

  const wrongPurposeRow = checkoutRow.replace(
    "Read repository snapshots without persisting credentials",
    "Unrelated purpose",
  );
  assert.notEqual(wrongPurposeRow, checkoutRow);
  const wrongPurposeInventory = thirdParty.replace(checkoutRow, wrongPurposeRow);
  assert.throws(() => assertActionInventoryReconciled(actionsLock, wrongPurposeInventory));
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
