import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  DEVICON_COMMIT,
  GIF_CATALOG_COMMIT,
  GIF_URLS,
} from "./pages-provenance-contract.mjs";

const [thirdParty, brandLogo] = await Promise.all([
  readFile(new URL("../THIRDPARTY.md", import.meta.url), "utf8"),
  readFile(new URL("../site/assets/lcv-ideas-software-logo.svg", import.meta.url)),
]);

const BRAND_LOGO_SOURCE_COMMIT = "1b6eed828fd72c8ddc382ab271825015e4f14d10";
const BRAND_LOGO_SHA256 =
  "70631f32e8b4c01d794a3af5016484dd09d51beb0c26abf3a80a9355db179f27";
const BRAND_LOGO_SOURCE_URL =
  `https://github.com/LCV-Ideas-Software/.github/blob/${BRAND_LOGO_SOURCE_COMMIT}/profile/assets/lcv-ideas-software-logo.svg`;

function extractSection(content, heading, nextHeading) {
  const start = content.indexOf(heading);
  const end = content.indexOf(nextHeading, start + heading.length);
  assert.ok(start !== -1 && end > start, `THIRDPARTY section drifted: ${heading}`);
  return content.slice(start, end);
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
