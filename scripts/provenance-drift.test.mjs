import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [
  readme,
  page,
  thirdParty,
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

function countOccurrences(content, value) {
  return content.split(value).length - 1;
}

test("profile and Pages use the immutable Devicon inventory", () => {
  assert.equal(`${readme}\n${page}`.includes("devicons/devicon/master"), false);
  assert.equal(countOccurrences(readme, DEVICON_PREFIX), DEVICON_PATHS.length);
  assert.equal(countOccurrences(page, DEVICON_PREFIX), DEVICON_PATHS.length);

  for (const path of DEVICON_PATHS) {
    const url = `${DEVICON_PREFIX}${path}`;
    assert.equal(countOccurrences(readme, url), 1, `README drifted for ${path}`);
    assert.equal(countOccurrences(page, url), 1, `Pages drifted for ${path}`);
  }
});

test("profile uses exactly the five catalogued GIFs", () => {
  assert.equal(
    countOccurrences(readme, "https://user-images.githubusercontent.com/74038190/"),
    GIF_URLS.length,
  );
  for (const url of GIF_URLS) {
    assert.equal(countOccurrences(readme, url), 1, `README drifted for ${url}`);
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
    assert.ok(thirdParty.includes(evidence), `Missing runtime provenance: ${evidence}`);
  }
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
