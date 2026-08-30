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
  pageWorkflow,
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
    readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"),
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

const DEVICON_URLS = DEVICON_PATHS.map((path) => `${DEVICON_PREFIX}${path}`);

const SHIELDS_PATHS = [
  "github/followers/lcv-leo?label=Followers&style=flat-square&color=3B82F6",
  "github/stars/lcv-leo?label=Stars&style=flat-square&color=3B82F6",
  "badge/TipTap-000000?style=flat-square&logo=tiptap&logoColor=white",
  "badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white",
  "badge/DOMPurify-7952B3?style=flat-square",
  "badge/Hono-E36002?style=flat-square&logo=hono&logoColor=white",
  "badge/D1-F38020?style=flat-square&logo=cloudflare&logoColor=white",
  "badge/Model_Context_Protocol-000000?style=for-the-badge&logo=anthropic&logoColor=white",
  "badge/Vertex_AI_(Gemini)-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white",
  "badge/Claude-D97757?style=for-the-badge&logo=anthropic&logoColor=white",
  "badge/GPT-412991?style=for-the-badge&logo=openai&logoColor=white",
  "badge/Grok-000000?style=for-the-badge&logo=x&logoColor=white",
  "badge/DeepSeek-4D6BFE?style=for-the-badge",
  "badge/Perplexity-1FB8CD?style=for-the-badge&logo=perplexity&logoColor=white",
  "badge/Mercado_Pago-00B1EA?style=for-the-badge&logo=mercadopago&logoColor=white",
  "badge/Stripe_(planned)-635BFF?style=for-the-badge&logo=stripe&logoColor=white",
  "badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white",
  "badge/Slack_Integrations-4A154B?style=for-the-badge&logo=slack&logoColor=white",
  "badge/Linear-5E6AD2?style=for-the-badge&logo=linear&logoColor=white",
  "badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white",
  "badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white",
  "badge/Biome-60A5FA?style=for-the-badge&logo=biome&logoColor=white",
  "badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white",
  "badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black",
  "badge/CodeQL-2088FF?style=for-the-badge&logo=github&logoColor=white",
  "badge/Zizmor-FF6B6B?style=for-the-badge",
  "badge/OpenSSF_Scorecard-2E7D32?style=for-the-badge&logo=openssf&logoColor=white",
  "badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white",
  "badge/Merge_Queues-181717?style=for-the-badge&logo=github&logoColor=white",
  "badge/Wrangler-F38020?style=for-the-badge&logo=cloudflare&logoColor=white",
  "badge/Dependabot-025E8C?style=for-the-badge&logo=dependabot&logoColor=white",
  "badge/SHA--pinned_Actions-181717?style=for-the-badge&logo=git&logoColor=white",
  "badge/npm_Publishing-CB3837?style=for-the-badge&logo=npm&logoColor=white",
  "badge/Status-Live_on_npm-brightgreen?style=flat-square",
  "badge/Status-Live_on_npm-brightgreen?style=flat-square",
  "badge/Status-Live-brightgreen?style=flat-square",
  "badge/Status-Live-brightgreen?style=flat-square",
  "badge/Status-Shipping-blue?style=flat-square",
  "badge/Status-Live_→_Stripe_planned-blue?style=flat-square",
  "badge/TypeScript_end--to--end-3178C6?style=flat-square&logo=typescript&logoColor=white",
  "badge/React_19_+_Vite-20232A?style=flat-square&logo=react&logoColor=61DAFB",
  "badge/Cloudflare_Workers_+_Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white",
  "badge/Hono_on_the_edge-E36002?style=flat-square&logo=hono&logoColor=white",
  "badge/D1_+_migrations-F38020?style=flat-square&logo=sqlite&logoColor=white",
  "badge/MCP_servers_(stdio)-000000?style=flat-square&logo=anthropic&logoColor=white",
  "badge/Vertex_AI_SA_OAuth-4285F4?style=flat-square&logo=googlecloud&logoColor=white",
  "badge/Mercado_Pago_3DS-00B1EA?style=flat-square&logo=mercadopago&logoColor=white",
  "badge/HMAC_signed_webhooks-333333?style=flat-square&logo=letsencrypt&logoColor=white",
  "badge/Tauri_desktop-24C8DB?style=flat-square&logo=tauri&logoColor=white",
  "badge/Vitest_TDD-6E9F18?style=flat-square&logo=vitest&logoColor=white",
  "badge/Zod_validation-3E67B1?style=flat-square&logo=zod&logoColor=white",
  "badge/Merge_queue_ALLGREEN-181717?style=flat-square&logo=github&logoColor=white",
  "badge/actions.lock_+_SHA_pins-181717?style=flat-square&logo=git&logoColor=white",
  "badge/npm_publishing-CB3837?style=flat-square&logo=npm&logoColor=white",
  "badge/PWA_offline--first-5A0FC8?style=flat-square&logo=pwa&logoColor=white",
  "badge/Stripe_migration-635BFF?style=flat-square&logo=stripe&logoColor=white",
  "badge/Gemini_explicit_caching-4285F4?style=flat-square&logo=googlecloud&logoColor=white",
  "badge/Android_(Play_Store)-3DDC84?style=flat-square&logo=android&logoColor=white",
  "badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white",
  "badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white",
  "badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white",
  "badge/www.lcv.dev-3B82F6?style=for-the-badge&logo=googlechrome&logoColor=white",
  "badge/LCV_Ideas_%26_Software-0A66C2?style=for-the-badge&logo=github&logoColor=white",
];

const README_OTHER_IMAGE_URLS = [
  "https://raw.githubusercontent.com/LCV-Ideas-Software/.github/main/profile/assets/lcv-ideas-software-logo.svg",
  "https://readme-typing-svg.herokuapp.com?font=Poppins&weight=600&size=32&duration=3000&pause=1000&color=3B82F6&center=true&vCenter=true&width=820&lines=Hi+I'm+Leonardo+Cardozo+Vargas;Full-Stack+%26+Edge+Developer;TypeScript+%E2%80%A2+React+%E2%80%A2+Cloudflare;Rust+%E2%80%A2+Tauri+%E2%80%A2+MCP+Servers;Building+Real+Products+at+LCV+Ideas+%26+Software",
  "https://komarev.com/ghpvc/?username=lcv-leo&label=Profile%20Views&color=3B82F6&style=flat-square",
  "https://www.bestpractices.dev/projects/14239/badge",
  "https://streak-stats.demolab.com/?user=lcv-leo&theme=tokyonight&hide_border=true",
  "https://github-readme-activity-graph.vercel.app/graph?username=lcv-leo&theme=tokyo-night&hide_border=true&area=true&custom_title=Leonardo%27s%20Contribution%20Graph",
  "https://lcv-leo.lcv.dev/github-contribution-grid-snake-dark.svg",
  "https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=lcv-leo&theme=tokyonight",
  "https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=lcv-leo&theme=tokyonight",
  "https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=lcv-leo&theme=tokyonight",
  "https://github-profile-summary-cards.vercel.app/api/cards/stats?username=lcv-leo&theme=tokyonight",
  "https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&text=Thanks%20for%20visiting!&fontSize=35&fontAlignY=70&animation=twinkling",
  "https://komarev.com/ghpvc/?username=lcv-leo&label=Profile%20Views&color=3B82F6&style=for-the-badge",
];

const README_IMAGE_URLS = [
  ...DEVICON_URLS,
  ...GIF_URLS,
  ...SHIELDS_PATHS.map((path) => `https://img.shields.io/${path}`),
  ...README_OTHER_IMAGE_URLS,
];

const PAGE_IMAGE_URLS = [
  "/github-contribution-grid-snake-dark.svg",
  ...DEVICON_URLS,
  "https://streak-stats.demolab.com/?user=lcv-leo&theme=tokyonight&hide_border=true&background=1a1b26",
  "https://github-readme-activity-graph.vercel.app/graph?username=lcv-leo&theme=tokyo-night&hide_border=true&area=true&custom_title=Leonardo%27s%20Contribution%20Graph",
  "https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=lcv-leo&theme=tokyonight",
  "https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=lcv-leo&theme=tokyonight",
  "https://github-profile-summary-cards.vercel.app/api/cards/stats?username=lcv-leo&theme=tokyonight",
];

function extractImageSources(content, surfaceName) {
  const normalized = content.toLowerCase();
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
    const canonicalMatches = [
      ...tag.matchAll(/\sdata-canonical-src="([^"]*)"|\sdata-canonical-src='([^']*)'/giu),
    ];
    assert.ok(canonicalMatches.length <= 1, `${surfaceName} image has duplicate canonical src`);
    const rawSource = (
      canonicalMatches[0]?.[1] ??
      canonicalMatches[0]?.[2] ??
      matches[0][1] ??
      matches[0][2]
    ).trim();
    assert.notEqual(rawSource, "", `${surfaceName} has an empty image src`);
    assert.doesNotMatch(
      rawSource,
      /&#(?:\d+|x[0-9a-f]+);?/iu,
      `${surfaceName} image src must not contain numeric HTML references`,
    );
    const namedReferences = [...rawSource.matchAll(/&([a-z][a-z0-9]+);/giu)];
    assert.equal(
      namedReferences.every((match) => match[1].toLowerCase() === "amp"),
      true,
      `${surfaceName} image src must use its canonical literal URL`,
    );
    const source = rawSource.replaceAll(/&amp;/giu, "&");
    sources.push(source);
    const srcsetMatches = [...tag.matchAll(/\ssrcset="([^"]*)"|\ssrcset='([^']*)'/giu)];
    assert.ok(srcsetMatches.length <= 1, `${surfaceName} image has duplicate srcset`);
    if (srcsetMatches.length === 1) {
      for (const candidate of (srcsetMatches[0][1] ?? srcsetMatches[0][2]).split(",")) {
        const srcsetSource = candidate.trim().split(/\s+/u)[0]?.replaceAll(/&amp;/giu, "&");
        assert.ok(srcsetSource, `${surfaceName} image has an empty srcset candidate`);
        sources.push(srcsetSource);
      }
    }
    cursor = end + 1;
  }

  cursor = 0;
  while (true) {
    const start = normalized.indexOf("<source", cursor);
    if (start === -1) break;
    assert.ok([" ", "\n", "\r", "\t", "\f", "/", ">"].includes(normalized[start + 7]));
    const end = normalized.indexOf(">", start + 7);
    assert.notEqual(end, -1, `${surfaceName} has an unterminated <source> tag`);
    const tag = content.slice(start, end + 1);
    const matches = [...tag.matchAll(/\ssrcset="([^"]*)"|\ssrcset='([^']*)'/giu)];
    assert.equal(matches.length, 1, `${surfaceName} <source> needs one quoted srcset`);
    for (const candidate of (matches[0][1] ?? matches[0][2]).split(",")) {
      const source = candidate.trim().split(/\s+/u)[0]?.replaceAll(/&amp;/giu, "&");
      assert.ok(source, `${surfaceName} <source> has an empty srcset candidate`);
      sources.push(source);
    }
    cursor = end + 1;
  }
  return sources;
}

async function renderReadmeWithGitHub(content) {
  const cached = renderReadmeWithGitHub.cache.get(content);
  if (cached) return cached;
  const headers = {
    Accept: "text/html",
    "Content-Type": "application/json",
    "User-Agent": "lcv-leo-provenance-gate",
    "X-GitHub-Api-Version": "2026-03-10",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const rendered = (async () => {
    const response = await fetch("https://api.github.com/markdown", {
      body: JSON.stringify({ context: "lcv-leo/lcv-leo", mode: "gfm", text: content }),
      headers,
      method: "POST",
    });
    assert.equal(
      response.status,
      200,
      `GitHub GFM renderer failed closed with HTTP ${response.status}`,
    );
    return response.text();
  })();
  renderReadmeWithGitHub.cache.set(content, rendered);
  return rendered;
}
renderReadmeWithGitHub.cache = new Map();

async function extractSurfaceImageSources(content, surface) {
  if (surface === "README") {
    const rendered = await renderReadmeWithGitHub(content);
    return extractImageSources(rendered, "GitHub-rendered README");
  }
  assert.equal(content.toLowerCase().includes("url("), false, `${surface} uses CSS images`);
  return extractImageSources(content, surface);
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right, "en"));
}

async function assertImageCatalog(content, surface, predicate, expected) {
  const actual = (await extractSurfaceImageSources(content, surface)).filter(predicate);
  assert.deepEqual(sorted(actual), sorted(expected), `${surface} image catalog drifted`);
}

async function assertImmutableDeviconInventory(readmeSource, pageSource) {
  const isDevicon = (source) => source.toLowerCase().includes("devicon");
  await assertImageCatalog(readmeSource, "README", isDevicon, DEVICON_URLS);
  await assertImageCatalog(pageSource, "Pages", isDevicon, DEVICON_URLS);
}

function isGifSource(source) {
  if (source.toLowerCase().startsWith("data:image/gif")) return true;
  const pathname = new URL(source, "https://repository.invalid/").pathname;
  return decodeURIComponent(pathname).toLowerCase().endsWith(".gif");
}

async function assertCataloguedGifInventory(readmeSource, pageSource) {
  await assertImageCatalog(readmeSource, "README", isGifSource, GIF_URLS);
  await assertImageCatalog(pageSource, "Pages", isGifSource, []);
}

async function assertCompleteImageInventory(readmeSource, pageSource) {
  await assertImageCatalog(readmeSource, "README", () => true, README_IMAGE_URLS);
  await assertImageCatalog(pageSource, "Pages", () => true, PAGE_IMAGE_URLS);
}

// These regular expressions parse isolated machine syntax, never prose.
function actionIdentityParts(identity, sourceName) {
  const match = /^([^/@]+\/[^/@]+)@([0-9a-f]{40})$/u.exec(identity);
  assert.ok(match, `${sourceName} has an invalid Action identity: ${identity}`);
  return { commit: match[2], repository: match[1] };
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
  const direct = new Set(
    workflowRows.map((line) => {
      const match = /^ {8}- '([^']+)'$/u.exec(line);
      assert.ok(match, "actions.lock has a non-canonical workflow dependency");
      actionIdentityParts(match[1], "actions.lock workflows");
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
      actionIdentityParts(key[1], "actions.lock dependencies");
      assert.equal(dependencies.has(key[1]), false, "Duplicate actions.lock dependency");
      current = { identity: key[1], parents: [], ref: undefined, uses: [] };
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
    if (line === "        uses:") {
      assert.equal(readingUses, false, `Duplicate actions.lock uses: ${current.identity}`);
      readingUses = true;
      continue;
    }
    const usedIdentity = /^ {12}- '([^']+)'$/u.exec(line);
    if (usedIdentity) {
      assert.equal(readingUses, true, "actions.lock uses item is outside a uses list");
      actionIdentityParts(usedIdentity[1], "actions.lock transitive dependency");
      current.uses.push(usedIdentity[1]);
      continue;
    }
    assert.match(
      line,
      /^ {8}(?:commit: 'sha1-[0-9a-f]{40}'|owner_id: \d+|repo_id: \d+)$/u,
      `Non-canonical actions.lock dependency metadata: ${line}`,
    );
    readingUses = false;
  }
  assert.ok(dependencies.size > 0);
  for (const identity of direct) assert.ok(dependencies.has(identity));
  for (const dependency of dependencies.values()) {
    assert.ok(dependency.ref, `actions.lock dependency has no ref: ${dependency.identity}`);
    assert.equal(new Set(dependency.uses).size, dependency.uses.length);
    for (const childIdentity of dependency.uses) {
      const child = dependencies.get(childIdentity);
      assert.ok(child, `actions.lock transitive dependency is missing: ${childIdentity}`);
      child.parents.push(actionIdentityParts(dependency.identity, "actions.lock").repository);
    }
  }
  const directVersions = parseWorkflowVersions(workflowSources);
  for (const identity of direct) {
    const dependency = dependencies.get(identity);
    const workflowVersion = directVersions.get(identity);
    assert.ok(workflowVersion, `Workflow version comment is missing: ${identity}`);
    if (!/^[0-9a-f]{40}$/u.test(dependency.ref)) {
      assert.equal(workflowVersion, dependency.ref, `Workflow version drifted: ${identity}`);
    }
    dependency.version = workflowVersion;
  }
  for (const dependency of dependencies.values()) {
    dependency.parents = sorted(new Set(dependency.parents));
    dependency.version ??= dependency.ref;
  }
  const transitive = [...dependencies.values()].filter(
    (dependency) => !direct.has(dependency.identity),
  );
  for (const dependency of transitive) {
    assert.ok(
      dependency.parents.length > 0,
      `actions.lock contains an orphan transitive dependency: ${dependency.identity}`,
    );
  }
  return {
    direct: sorted(direct).map((identity) => dependencies.get(identity)),
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
  ["actions/create-github-app-token", "MIT"],
  ["actions/checkout", "MIT"],
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
  ["actions/create-github-app-token", "Create the least-privilege trusted-validator status token"],
  ["actions/checkout", "Read trusted repository snapshots"],
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
      const documentedParents = [...cells[4].matchAll(/`([^`]+)`/gu)].map(
        (match) => match[1],
      );
      assert.deepEqual(sorted(documentedParents), dependency.parents, message);
    } else {
      assert.equal(cells[4], DIRECT_ACTION_PURPOSES.get(repository), message);
    }
  }
}

function assertActionInventoryReconciled(actionsLockSource, thirdPartySource) {
  const workflowSources = [
    actionsLockValidatorWorkflow,
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

test("profile and Pages use the immutable Devicon inventory", async () => {
  await assertImmutableDeviconInventory(readme, page);
});

test("Devicon inventory rejects an image from another ref", async () => {
  const mutableUrl =
    "https://raw.githubusercontent.com/devicons/devicon/main/icons/go/go-original.svg";
  const approvedUrl = `${DEVICON_PREFIX}${DEVICON_PATHS[0]}`;
  const approvedLine = readme.split("\n").find((line) => line.includes(approvedUrl));
  assert.ok(approvedLine);
  for (const [scenario, driftedReadme] of [
    ["active HTML image", `${readme}\n<img src="${mutableUrl}">`],
    ["active Markdown image", `${readme}\n![unapproved Devicon](${mutableUrl})`],
    ["commented approved image", readme.replace(approvedLine, `<!-- ${approvedLine} -->`)],
    [
      "unquoted source",
      readme.replace(
        approvedLine,
        `<img src=${mutableUrl} alt='ignored src="${approvedUrl}"'>`,
      ),
    ],
  ]) {
    await assert.rejects(
      () => assertImmutableDeviconInventory(driftedReadme, page),
      scenario,
    );
  }
});

test("profile and Pages use exactly the five catalogued GIFs", async () => {
  await assertCataloguedGifInventory(readme, page);
});

test("GIF inventory rejects an image from another host", async () => {
  const gif = "https://example.com/untracked.GIF?cache=1";
  const approvedLine = readme.split("\n").find((line) => line.includes(GIF_URLS[0]));
  assert.ok(approvedLine);
  for (const [readmeSource, pageSource] of [
    [readme, `${page}\n<img src="${gif}">`],
    [`${readme}\n![untracked GIF](${gif})`, page],
    [readme, `${page}\n<img src="/safe.svg" srcset="${gif}">`],
    [readme.replace(approvedLine, `<!-- ${approvedLine} -->`), page],
  ]) {
    await assert.rejects(() => assertCataloguedGifInventory(readmeSource, pageSource));
  }
});

test("image inventory rejects HTML character references in src", () => {
  for (const source of [
    "https://example.com/untracked&#46;gif",
    "https://example.com/untracked&period;gif",
    "https://raw.githubusercontent.com/devicons/devic&#111;n/main/icons/go/go-original.svg",
  ]) {
    assert.throws(() =>
      extractImageSources(`${readme}\n<img src="${source}">`, "README"),
    );
  }
});

test("image inventory rejects every uncatalogued external image", async () => {
  for (const source of [
    "https://example.com/untracked.png",
    "https://img.shields.io/badge/Uncatalogued-000000?style=flat-square",
  ]) {
    await assert.rejects(() =>
      assertCompleteImageInventory(`${readme}\n<img src="${source}">`, page),
    );
  }
});

test("non-rendered Markdown examples do not enter the image inventory", async () => {
  const examples = [
    "<!-- ![commented image](https://example.com/comment.png) -->",
    "`![inline example](https://example.com/inline.png)`",
    "```css\n.example { background-image: url(https://example.com/code.png); }\n```",
    "~~~html\n<source srcset=\"https://example.com/fenced.png\">\n~~~",
    "    ![indented example](https://example.com/indented.png)",
  ].join("\n\n");
  await assert.doesNotReject(() =>
    assertCompleteImageInventory(`${readme}\n${examples}`, page),
  );
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

function assertRuntimeToolInventory(thirdPartySource) {
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

  const actualRows = extractRuntimeToolRows(thirdPartySource);
  assert.equal(actualRows.length, RUNTIME_TOOL_ROWS.length, "Runtime inventory row count drifted");
  for (const expected of RUNTIME_TOOL_ROWS) {
    const matches = actualRows.filter((row) => row[0] === expected[0]);
    assert.equal(matches.length, 1, `Runtime inventory component drifted: ${expected[0]}`);
    assert.deepEqual(matches[0], expected, `Runtime inventory row drifted: ${expected[0]}`);
  }

  for (const evidence of [
    "github/gh-actions-lock/releases/tag/v0.1.6",
    "047fddf38163b304f1e6ef5649f5ac1646edc6a3",
    "github/gh-actions-lock/blob/047fddf38163b304f1e6ef5649f5ac1646edc6a3/LICENSE",
    "4181ec1da5408b34b9a542a7ee5c6ce3a4d6ac815c7d0206a00ceca8a817f4e3",
  ]) {
    assert.ok(
      thirdPartySource.includes(evidence),
      `Missing runtime provenance: ${evidence}`,
    );
  }
}

test("runtime tool versions and immutable origins stay inventoried", () => {
  assertRuntimeToolInventory(thirdParty);
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
    "Read trusted repository snapshots",
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
