import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

import {
  BRAND_LOGO_URL,
  DEVICON_PATHS,
  DEVICON_PREFIX,
  DEVICON_URLS,
  GIF_URLS,
  PAGE_BRAND_LOGO_PATH,
  PAGE_CONTENT_SECURITY_POLICY,
  PAGE_DOCUMENT_URL,
  PAGE_IMAGE_URLS,
  PAGE_STYLESHEET_URLS,
  README_IMAGE_URLS,
} from "./pages-provenance-contract.mjs";

const [readmeSource, pageSource, scriptSource, stylesheetSource] = await Promise.all([
  readFile(new URL("../README.md", import.meta.url), "utf8"),
  readFile(new URL("../site/index.html", import.meta.url), "utf8"),
  readFile(new URL("../site/app.js", import.meta.url), "utf8"),
  readFile(new URL("../site/styles.css", import.meta.url), "utf8"),
]);

const FIXED_TIME = "2026-08-30T13:15:00.000Z";
const CACHE_BUSTER = "2026083013";
const APP_URL = new URL("app.js", PAGE_DOCUMENT_URL).href;
const LOCAL_STYLESHEET_URL = new URL("styles.css", PAGE_DOCUMENT_URL).href;
const PROFILE_API_URL = "https://api.github.com/users/lcv-leo";
const REPOSITORIES_API_URL =
  "https://api.github.com/users/lcv-leo/repos?per_page=100";
const README_DOCUMENT_URL = "https://github.com/lcv-leo/lcv-leo";
const CSP_PROBE_URL = "https://example.com/provenance-csp-probe.png";
const IMAGE_BODY = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64",
);

const resolvedPageImages = PAGE_IMAGE_URLS.map(
  (source) => new URL(source, PAGE_DOCUMENT_URL).href,
);
const resolvedImageElements = resolvedPageImages.slice(2);
const analyticsStart = resolvedImageElements.length - 5;
const runtimePageImages = resolvedImageElements.map((source, index) => {
  if (index < analyticsStart) return source;
  return `${source}${source.includes("?") ? "&" : "?"}cb=${CACHE_BUSTER}`;
});
const runtimeAnalyticsImages = runtimePageImages.slice(analyticsStart);
const retryAnalyticsImages = resolvedImageElements
  .slice(analyticsStart)
  .map(
    (source) =>
      `${source}${source.includes("?") ? "&" : "?"}cb=${CACHE_BUSTER}r`,
  );
const resolvedStylesheets = PAGE_STYLESHEET_URLS.map(
  (source) => new URL(source, PAGE_DOCUMENT_URL).href,
);
const allowedImageRequests = new Set([
  ...resolvedPageImages,
  ...runtimePageImages,
]);
const allowedRequests = new Set([
  PAGE_DOCUMENT_URL,
  APP_URL,
  LOCAL_STYLESHEET_URL,
  PROFILE_API_URL,
  REPOSITORIES_API_URL,
  ...resolvedStylesheets,
  ...allowedImageRequests,
]);

function count(values, expected) {
  return values.filter((value) => value === expected).length;
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right, "en"));
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

  renderReadmeWithGitHub.requestCount += 1;
  const rendered = (async () => {
    const response = await fetch("https://api.github.com/markdown", {
      body: JSON.stringify({
        context: "lcv-leo/lcv-leo",
        mode: "gfm",
        text: content,
      }),
      headers,
      method: "POST",
    });
    expect(response.status, "GitHub GFM renderer must fail closed").toBe(200);
    return response.text();
  })();
  renderReadmeWithGitHub.cache.set(content, rendered);
  return rendered;
}
renderReadmeWithGitHub.cache = new Map();
renderReadmeWithGitHub.requestCount = 0;

test.afterAll(() => {
  expect(renderReadmeWithGitHub.requestCount).toBeLessThanOrEqual(2);
});

async function readRenderedImageCatalog(browser, renderedHtml) {
  const context = await browser.newContext({ serviceWorkers: "block" });
  const page = await context.newPage();
  const unexpectedRequests = [];
  await context.route("**/*", async (route) => {
    if (route.request().url() === README_DOCUMENT_URL) {
      await route.fulfill({
        body: `<!doctype html><html><head></head><body>${renderedHtml}</body></html>`,
        contentType: "text/html; charset=utf-8",
      });
      return;
    }
    unexpectedRequests.push(route.request().url());
    await route.abort("blockedbyclient");
  });

  try {
    await page.goto(README_DOCUMENT_URL, { waitUntil: "domcontentloaded" });
    const catalog = await page.evaluate(() => ({
      imageSources: [...document.images].map(
        (image) => image.getAttribute("data-canonical-src") ?? image.src,
      ),
      everyImageIsConnectedHtml: [...document.images].every(
        (image) =>
          image.isConnected && image.namespaceURI === "http://www.w3.org/1999/xhtml",
      ),
      sourceElementCount: document.querySelectorAll("source").length,
      srcsetElementCount: document.querySelectorAll("img[srcset], source[srcset]").length,
    }));
    expect(catalog.everyImageIsConnectedHtml).toBe(true);
    expect(catalog.sourceElementCount).toBe(0);
    expect(catalog.srcsetElementCount).toBe(0);
    expect(unexpectedRequests.every((url) => url !== README_DOCUMENT_URL)).toBe(true);
    return catalog.imageSources;
  } finally {
    await context.close();
  }
}

async function assertReadmeSemantics(browser, renderedHtml) {
  expect(sorted(await readRenderedImageCatalog(browser, renderedHtml))).toEqual(
    sorted(README_IMAGE_URLS),
  );
}

async function assertParserCspSemantics(browser, html) {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  await context.route("**/*", async (route) => {
    if (route.request().url() === PAGE_DOCUMENT_URL) {
      await route.fulfill({ body: html, contentType: "text/html; charset=utf-8" });
      return;
    }
    await route.abort("blockedbyclient");
  });

  try {
    await page.goto(PAGE_DOCUMENT_URL, { waitUntil: "domcontentloaded" });
    const parserPolicy = await page.evaluate(() => {
      const policies = [...document.querySelectorAll("meta[http-equiv]")].filter(
        (element) => element.httpEquiv.toLowerCase() === "content-security-policy",
      );
      const policy = policies[0];
      const resources = [
        ...document.querySelectorAll(
          "audio[src], embed[src], iframe[src], img[src], input[type=image][src], link[href], object[data], script[src], source[src], source[srcset], style, track[src], video[src]",
        ),
      ];
      return {
        count: policies.length,
        policy: policy
          ? {
              beforeEveryResource: resources.every(
                (element) =>
                  Boolean(
                    policy.compareDocumentPosition(element) &
                      Node.DOCUMENT_POSITION_FOLLOWING,
                  ),
              ),
              connected: policy.isConnected,
              content: policy.content,
              directChildOfHead: policy.parentElement === document.head,
              htmlNamespace: policy.namespaceURI === "http://www.w3.org/1999/xhtml",
            }
          : undefined,
      };
    });
    expect(parserPolicy).toEqual({
      count: 1,
      policy: {
        beforeEveryResource: true,
        connected: true,
        content: PAGE_CONTENT_SECURITY_POLICY,
        directChildOfHead: true,
        htmlNamespace: true,
      },
    });
  } finally {
    await context.close();
  }
}

async function assertPagesSemantics(
  browser,
  {
    html = pageSource,
    script = scriptSource,
    stylesheet = stylesheetSource,
  } = {},
) {
  await assertParserCspSemantics(browser, html);
  const context = await browser.newContext({
    bypassCSP: false,
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  const requests = [];
  const unknownRequests = [];
  const requestFailures = [];
  const pageErrors = [];

  page.on("request", (request) => requests.push(request.url()));
  page.on("requestfailed", (request) => {
    requestFailures.push(`${request.url()}: ${request.failure()?.errorText ?? "unknown"}`);
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.addInitScript(() => {
    globalThis.__provenanceCspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      globalThis.__provenanceCspViolations.push({
        blockedURI: event.blockedURI,
        effectiveDirective: event.effectiveDirective,
      });
    });
  });
  await page.clock.setFixedTime(FIXED_TIME);

  await context.route("**/*", async (route) => {
    const url = route.request().url();
    if (url === PAGE_DOCUMENT_URL) {
      await route.fulfill({ body: html, contentType: "text/html; charset=utf-8" });
      return;
    }
    if (url === APP_URL) {
      await route.fulfill({
        body: script,
        contentType: "text/javascript; charset=utf-8",
      });
      return;
    }
    if (url === LOCAL_STYLESHEET_URL) {
      await route.fulfill({ body: stylesheet, contentType: "text/css; charset=utf-8" });
      return;
    }
    if (url === resolvedStylesheets[0]) {
      await route.fulfill({
        body: "",
        contentType: "text/css; charset=utf-8",
        headers: { "access-control-allow-origin": "*" },
      });
      return;
    }
    if (url === PROFILE_API_URL) {
      await route.fulfill({
        body: JSON.stringify({
          created_at: "2026-03-01T00:00:00.000Z",
          followers: 7,
          public_repos: 3,
        }),
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
      });
      return;
    }
    if (url === REPOSITORIES_API_URL) {
      await route.fulfill({
        body: JSON.stringify([
          { stargazers_count: 2 },
          { stargazers_count: 5 },
        ]),
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
      });
      return;
    }
    if (allowedImageRequests.has(url)) {
      await route.fulfill({ body: IMAGE_BODY, contentType: "image/gif" });
      return;
    }
    unknownRequests.push(url);
    await route.fulfill({ status: 418, body: "untracked request" });
  });

  try {
    await page.goto(PAGE_DOCUMENT_URL, { waitUntil: "load" });

    const dom = await page.evaluate(() => {
      const policyElements = [...document.querySelectorAll("meta[http-equiv]")].filter(
        (element) => element.httpEquiv.toLowerCase() === "content-security-policy",
      );
      const policy = policyElements[0];
      const resourceElements = [
        ...document.querySelectorAll(
          "audio[src], embed[src], iframe[src], img[src], input[type=image][src], link[href], object[data], script[src], source[src], source[srcset], style, track[src], video[src]",
        ),
      ];
      const scripts = [...document.scripts].map((element) => ({
        attributes: [...element.attributes]
          .map((attribute) => [attribute.name, attribute.value])
          .sort(([left], [right]) => left.localeCompare(right, "en")),
        bodyIsEmpty: element.textContent === "",
        connected: element.isConnected,
        htmlNamespace: element.namespaceURI === "http://www.w3.org/1999/xhtml",
        lastElementInBody:
          element.parentElement === document.body && element.nextElementSibling === null,
        src: element.src,
      }));

      return {
        forbiddenResourceElementCount: document.querySelectorAll(
          "audio[src], embed[src], iframe[src], input[type=image][src], object[data], source, style, track[src], video[src]",
        ).length,
        htmlNamespace:
          document.documentElement.namespaceURI === "http://www.w3.org/1999/xhtml",
        images: [...document.images].map((element) => ({
          source: element.src,
          srcset: element.getAttribute("srcset"),
        })),
        links: [...document.querySelectorAll("link")].map((element) => ({
          crossorigin: element.getAttribute("crossorigin"),
          href: element.href,
          rel: element.rel,
        })),
        ogImages: [...document.querySelectorAll("meta[property]")]
          .filter((element) => element.getAttribute("property")?.toLowerCase() === "og:image")
          .map((element) => element.content),
        policy: policy
          ? {
              beforeEveryResource: resourceElements.every(
                (element) =>
                  policy === element ||
                  Boolean(
                    policy.compareDocumentPosition(element) &
                      Node.DOCUMENT_POSITION_FOLLOWING,
                  ),
              ),
              connected: policy.isConnected,
              content: policy.content,
              directChildOfHead: policy.parentElement === document.head,
              htmlNamespace: policy.namespaceURI === "http://www.w3.org/1999/xhtml",
            }
          : undefined,
        policyCount: policyElements.length,
        runtime: {
          editorProgress: document.querySelector("#editor-progress")?.textContent,
          editorSkipCount: document.querySelectorAll("#editor-skip").length,
          followers: document.querySelector("#stat-followers")?.textContent,
          repositories: document.querySelector("#stat-repos")?.textContent,
          stars: document.querySelector("#stat-stars")?.textContent,
          year: document.querySelector("#year")?.textContent,
        },
        scripts,
        violations: globalThis.__provenanceCspViolations,
      };
    });

    expect(dom.htmlNamespace).toBe(true);
    expect(dom.policyCount).toBe(1);
    expect(dom.policy).toEqual({
      beforeEveryResource: true,
      connected: true,
      content: PAGE_CONTENT_SECURITY_POLICY,
      directChildOfHead: true,
      htmlNamespace: true,
    });
    expect(dom.scripts).toEqual([
      {
        attributes: [
          ["defer", ""],
          ["src", "app.js"],
        ],
        bodyIsEmpty: true,
        connected: true,
        htmlNamespace: true,
        lastElementInBody: true,
        src: APP_URL,
      },
    ]);
    expect(dom.links).toEqual([
      { crossorigin: null, href: BRAND_LOGO_URL, rel: "icon" },
      { crossorigin: null, href: "https://fonts.googleapis.com/", rel: "preconnect" },
      { crossorigin: "", href: "https://fonts.gstatic.com/", rel: "preconnect" },
      { crossorigin: null, href: resolvedStylesheets[0], rel: "stylesheet" },
      { crossorigin: null, href: LOCAL_STYLESHEET_URL, rel: "stylesheet" },
    ]);
    expect(dom.ogImages).toEqual([BRAND_LOGO_URL]);
    expect(dom.images).toEqual(
      runtimePageImages.map((source) => ({ source, srcset: null })),
    );
    expect(dom.forbiddenResourceElementCount).toBe(0);
    expect(dom.violations).toEqual([]);

    await expect
      .poll(
        async () =>
          page.evaluate(() => ({
            editorProgress: document.querySelector("#editor-progress")?.textContent,
            editorSkipCount: document.querySelectorAll("#editor-skip").length,
            followers: document.querySelector("#stat-followers")?.textContent,
            repositories: document.querySelector("#stat-repos")?.textContent,
            stars: document.querySelector("#stat-stars")?.textContent,
            year: document.querySelector("#year")?.textContent,
          })),
        { timeout: 2_000 },
      )
      .toEqual({
        editorProgress: "100%",
        editorSkipCount: 0,
        followers: "7",
        repositories: "3",
        stars: "7",
        year: "2026",
      });

    for (const expected of [
      PAGE_DOCUMENT_URL,
      APP_URL,
      LOCAL_STYLESHEET_URL,
      resolvedStylesheets[0],
      PROFILE_API_URL,
      REPOSITORIES_API_URL,
    ]) {
      expect(count(requests, expected), `${expected} request count`).toBe(1);
    }
    expect(requests.every((url) => allowedRequests.has(url))).toBe(true);
    expect(unknownRequests).toEqual([]);
    expect(requestFailures).toEqual([]);
    expect(pageErrors).toEqual([]);

  } finally {
    await context.close();
  }
}

async function assertCspEnforcement(browser) {
  const context = await browser.newContext({
    bypassCSP: false,
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  const routedRequests = [];
  const failedRequests = [];
  const responses = [];

  page.on("requestfailed", (request) => {
    failedRequests.push({
      errorText: request.failure()?.errorText ?? "",
      url: request.url(),
    });
  });
  page.on("response", (response) => responses.push(response.url()));
  await page.addInitScript(() => {
    globalThis.__provenanceCspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      globalThis.__provenanceCspViolations.push({
        blockedURI: event.blockedURI,
        effectiveDirective: event.effectiveDirective,
      });
    });
  });
  await page.clock.setFixedTime(FIXED_TIME);
  await context.route("**/*", async (route) => {
    const url = route.request().url();
    routedRequests.push(url);
    if (url === PAGE_DOCUMENT_URL) {
      await route.fulfill({ body: pageSource, contentType: "text/html; charset=utf-8" });
      return;
    }
    if (url === APP_URL) {
      await route.fulfill({ body: scriptSource, contentType: "text/javascript; charset=utf-8" });
      return;
    }
    if (url === LOCAL_STYLESHEET_URL || url === resolvedStylesheets[0]) {
      await route.fulfill({ body: "", contentType: "text/css; charset=utf-8" });
      return;
    }
    if (url === PROFILE_API_URL) {
      await route.fulfill({
        body: JSON.stringify({ followers: 7, public_repos: 3 }),
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
      });
      return;
    }
    if (url === REPOSITORIES_API_URL) {
      await route.fulfill({
        body: "[]",
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
      });
      return;
    }
    if (allowedImageRequests.has(url)) {
      await route.fulfill({ body: IMAGE_BODY, contentType: "image/gif" });
      return;
    }
    await route.fulfill({ status: 418, body: "untracked request" });
  });

  try {
    await page.goto(PAGE_DOCUMENT_URL, { waitUntil: "load" });
    await page.evaluate((probeUrl) => {
      const probe = document.createElement("img");
      probe.id = "provenance-csp-probe";
      probe.src = probeUrl;
      document.body.append(probe);
    }, CSP_PROBE_URL);
    await expect
      .poll(
        async () =>
          page.evaluate(
            () =>
              globalThis.__provenanceCspViolations.filter(
                (violation) =>
                  violation.blockedURI === "https://example.com/provenance-csp-probe.png" &&
                  violation.effectiveDirective === "img-src",
              ).length,
          ),
        { timeout: 2_000 },
      )
      .toBe(1);
    await expect
      .poll(
        () => failedRequests.filter((request) => request.url === CSP_PROBE_URL),
        { timeout: 2_000 },
      )
      .toHaveLength(1);
    expect(
      failedRequests.find((request) => request.url === CSP_PROBE_URL)?.errorText,
    ).toMatch(/csp/iu);
    expect(routedRequests).not.toContain(CSP_PROBE_URL);
    expect(responses).not.toContain(CSP_PROBE_URL);
  } finally {
    await context.close();
  }
}

async function assertAnalyticsRetrySemantics(browser) {
  const context = await browser.newContext({
    bypassCSP: false,
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  const normalUrl = runtimeAnalyticsImages[0];
  const retryUrl = retryAnalyticsImages[0];
  const requests = [];
  const failedRequests = [];
  const unknownRequests = [];
  const pageErrors = [];
  const allowedRetryRequests = new Set([...allowedRequests, retryUrl]);

  page.on("request", (request) => requests.push(request.url()));
  page.on("requestfailed", (request) => failedRequests.push(request.url()));
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.clock.install({ time: FIXED_TIME });

  await context.route("**/*", async (route) => {
    const url = route.request().url();
    if (url === PAGE_DOCUMENT_URL) {
      await route.fulfill({ body: pageSource, contentType: "text/html; charset=utf-8" });
      return;
    }
    if (url === APP_URL) {
      await route.fulfill({
        body: scriptSource,
        contentType: "text/javascript; charset=utf-8",
      });
      return;
    }
    if (url === LOCAL_STYLESHEET_URL || url === resolvedStylesheets[0]) {
      await route.fulfill({
        body: "",
        contentType: "text/css; charset=utf-8",
        headers: { "access-control-allow-origin": "*" },
      });
      return;
    }
    if (url === PROFILE_API_URL) {
      await route.fulfill({
        body: JSON.stringify({
          created_at: "2026-03-01T00:00:00.000Z",
          followers: 7,
          public_repos: 3,
        }),
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
      });
      return;
    }
    if (url === REPOSITORIES_API_URL) {
      await route.fulfill({
        body: "[]",
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
      });
      return;
    }
    if (url === normalUrl || url === retryUrl) {
      await route.abort("failed");
      return;
    }
    if (allowedImageRequests.has(url)) {
      await route.fulfill({ body: IMAGE_BODY, contentType: "image/gif" });
      return;
    }
    unknownRequests.push(url);
    await route.fulfill({ status: 418, body: "untracked request" });
  });

  try {
    await page.goto(PAGE_DOCUMENT_URL, { waitUntil: "load" });
    const target = page.locator(".analytics img").first();
    await target.scrollIntoViewIfNeeded();
    await expect.poll(() => count(requests, normalUrl)).toBe(1);
    await expect.poll(() => count(failedRequests, normalUrl)).toBe(1);

    await page.clock.fastForward(2_499);
    expect(count(requests, retryUrl)).toBe(0);
    await page.clock.fastForward(1);
    await expect.poll(() => count(requests, retryUrl)).toBe(1);
    await expect.poll(() => count(failedRequests, retryUrl)).toBe(1);
    await expect(target).toHaveJSProperty("src", retryUrl);
    await expect(target).toHaveCSS("display", "none");

    await page.clock.fastForward(10_000);
    expect(count(requests, normalUrl)).toBe(1);
    expect(count(requests, retryUrl)).toBe(1);
    expect(requests.every((url) => allowedRetryRequests.has(url))).toBe(true);
    expect(unknownRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
  } finally {
    await context.close();
  }
}

test("GitHub-rendered profile image provenance is enforced by the browser DOM", async ({
  browser,
}) => {
  await assertReadmeSemantics(browser, await renderReadmeWithGitHub(readmeSource));
});

test("browser semantics reject rendered profile image inventory drift", async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const rendered = await renderReadmeWithGitHub(readmeSource);
  const mutableDevicon =
    "https://raw.githubusercontent.com/devicons/devicon/main/icons/go/go-original.svg";
  const untrackedGif = "https://example.com/untracked.GIF?cache=1";
  const untrackedBadge =
    "https://img.shields.io/badge/Uncatalogued-000000?style=flat-square";
  const mutants = new Map([
    ["mutable Devicon", `${rendered}\n<img src="${mutableDevicon}">`],
    ["missing Devicon", rendered.replaceAll(DEVICON_URLS[0], "")],
    ["uncatalogued GIF", `${rendered}\n<img src="${untrackedGif}">`],
    ["uncatalogued badge", `${rendered}\n<img src="${untrackedBadge}">`],
    [
      "quoted greater-than source",
      `${rendered}\n<img src="https://example.com/untracked>image.png">`,
    ],
    [
      "srcset candidate",
      `${rendered}\n<img src="${DEVICON_URLS[0]}" srcset="https://example.com/untracked.png 2x">`,
    ],
    [
      "picture source",
      `${rendered}\n<picture><source srcset="https://example.com/untracked.png"><img src="${DEVICON_URLS[0]}"></picture>`,
    ],
    ["missing catalogued GIF", rendered.replaceAll(GIF_URLS[0], "")],
  ]);

  for (const [name, mutant] of mutants) {
    expect(mutant, `${name} must change the rendered fragment`).not.toBe(rendered);
    let rejected = false;
    try {
      await assertReadmeSemantics(browser, mutant);
    } catch {
      rejected = true;
    }
    expect(rejected, `${name} must be rejected`).toBe(true);
  }
});

test("GitHub rendering excludes Markdown examples from the browser inventory", async ({
  browser,
}) => {
  const activeUrls = [DEVICON_URLS[0], DEVICON_URLS[1]];
  const fixture = [
    `![active Markdown image](${activeUrls[0]})`,
    `<img src="${activeUrls[1]}" alt="active HTML image">`,
    "<!-- ![commented image](https://example.com/comment.png) -->",
    "`![inline example](https://example.com/inline.png)`",
    "```css\n.example { background-image: url(https://example.com/code.png); }\n```",
    "~~~html\n<source srcset=\"https://example.com/fenced.png\">\n~~~",
    "    ![indented example](https://example.com/indented.png)",
  ].join("\n\n");
  const rendered = await renderReadmeWithGitHub(fixture);
  expect(sorted(await readRenderedImageCatalog(browser, rendered))).toEqual(
    sorted(activeUrls),
  );
});

test("Pages provenance is enforced by the browser DOM, CSP, runtime, and network", async ({
  browser,
}) => {
  await assertPagesSemantics(browser);
});

test("the native browser enforces the declared Pages CSP before network routing", async ({
  browser,
}) => {
  await assertCspEnforcement(browser);
});

test("analytics retry uses the exact delayed query once and hides on hard failure", async ({
  browser,
}) => {
  await assertAnalyticsRetrySemantics(browser);
});

test("browser semantics reject inert policy, inert script, and quoted-tag-boundary mutants", async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const policyTag =
    `<meta http-equiv="Content-Security-Policy" content="${PAGE_CONTENT_SECURITY_POLICY}">`;
  const canonicalScript = '<script src="app.js" defer></script>';
  const headContentStart = pageSource.indexOf("<head>") + "<head>".length;
  const headContentEnd = pageSource.indexOf("</head>");
  const bodyContentStart = pageSource.indexOf("<body>") + "<body>".length;
  const policyAndResourcesInBody =
    pageSource.slice(0, headContentStart) +
    pageSource.slice(headContentEnd, bodyContentStart) +
    pageSource.slice(headContentStart, headContentEnd) +
    pageSource.slice(bodyContentStart);
  const pageWithoutPolicy = pageSource.replace(policyTag, "");
  const pageMutants = new Map([
    ["missing policy", pageWithoutPolicy],
    ["commented policy", pageSource.replace(policyTag, `<!-- ${policyTag} -->`)],
    ["bogus-comment policy", pageSource.replace(policyTag, `<!x ${policyTag}`)],
    ["template policy", pageSource.replace(policyTag, `<template>${policyTag}</template>`)],
    [
      "policy after a resource",
      pageWithoutPolicy.replace(
        `<link rel="icon" href="${PAGE_BRAND_LOGO_PATH}">`,
        `<link rel="icon" href="${PAGE_BRAND_LOGO_PATH}">\n  ${policyTag}`,
      ),
    ],
    ["duplicate policy", pageSource.replace(policyTag, `${policyTag}\n  ${policyTag}`)],
    ["policy and resources in body", policyAndResourcesInBody],
    [
      "external script",
      pageSource.replace(
        canonicalScript,
        '<script src="https://example.com/app.js" defer></script>',
      ),
    ],
    [
      "template script",
      pageSource.replace(canonicalScript, `<template>${canonicalScript}</template>`),
    ],
    [
      "noscript script",
      pageSource.replace(canonicalScript, `<noscript>${canonicalScript}</noscript>`),
    ],
    [
      "quoted greater-than in stylesheet URL",
      pageSource.replace(
        '<link rel="stylesheet" href="styles.css">',
        '<link rel="stylesheet" href="styles.css>https://example.com/untracked.css">',
      ),
    ],
    [
      "untracked image",
      pageSource.replace(
        "</main>",
        '<img src="https://example.com/untracked.png" alt="">\n</main>',
      ),
    ],
  ]);

  for (const [name, html] of pageMutants) {
    expect(html, `${name} must change the document`).not.toBe(pageSource);
    let rejected = false;
    try {
      await assertPagesSemantics(browser, { html });
    } catch {
      rejected = true;
    }
    expect(rejected, `${name} must be rejected`).toBe(true);
  }
});

test("browser network inventory rejects dynamic query and CSS resource drift", async ({
  browser,
}) => {
  const cacheMutationTarget =
    'img.src += (img.src.includes("?") ? "&" : "?") + "cb=" + cb;';
  const queryDriftScript = scriptSource.replace(
    cacheMutationTarget,
    `${cacheMutationTarget.slice(0, -1)} + "&uncatalogued=1";`,
  );
  const hiddenRequestScript = scriptSource.replace(
    '"use strict";',
    `"use strict";\n  const untrackedImage = new Image();\n  untrackedImage.src = "${DEVICON_PREFIX}${DEVICON_PATHS[0]}?uncatalogued=1";`,
  );
  const stylesheetDrift =
    `${stylesheetSource}\nbody { background-image: url("${DEVICON_PREFIX}${DEVICON_PATHS[0]}?uncatalogued=1"); }`;

  for (const [name, mutation] of [
    ["analytics query", { script: queryDriftScript }],
    ["detached image request", { script: hiddenRequestScript }],
    ["stylesheet request", { stylesheet: stylesheetDrift }],
  ]) {
    let rejected = false;
    try {
      await assertPagesSemantics(browser, mutation);
    } catch {
      rejected = true;
    }
    expect(rejected, `${name} drift must be rejected`).toBe(true);
  }
});
