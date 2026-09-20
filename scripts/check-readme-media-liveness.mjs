#!/usr/bin/env node

// Fails when a remote image the profile depends on stops serving an image.
// The provenance gate deliberately blocks every external request, so nothing in
// this repository ever touched these hosts: a card could die upstream and every
// check stayed green. This gate is the one place that does reach them.

import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

import { README_IMAGE_URLS } from "./pages-provenance-contract.mjs";

const CONCURRENCY = 6;
const ATTEMPTS = 2;
const TIMEOUT_MS = 20_000;

export async function probeUrl(url, { fetchImpl = globalThis.fetch, attempts = ATTEMPTS, timeoutMs = TIMEOUT_MS } = {}) {
  let lastFailure = "unknown failure";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, {
        headers: { accept: "image/*,*/*;q=0.8", "user-agent": "lcv-leo-media-liveness" },
        redirect: "follow",
        signal: controller.signal,
      });
      const contentType = response.headers?.get?.("content-type") ?? "";
      if (!response.ok) {
        lastFailure = `HTTP ${response.status}`;
      } else if (!contentType.toLowerCase().startsWith("image/")) {
        lastFailure = `content-type ${contentType || "(absent)"}`;
      } else {
        return { url, ok: true, status: response.status, contentType };
      }
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
    } finally {
      clearTimeout(timer);
    }
  }
  return { url, ok: false, failure: lastFailure };
}

export async function probeAll(urls, options = {}) {
  const { concurrency = CONCURRENCY, ...probeOptions } = options;
  const queue = [...new Set(urls)];
  const results = [];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
      results.push(await probeUrl(next, probeOptions));
    }
  });
  await Promise.all(workers);
  return results.sort((left, right) => left.url.localeCompare(right.url, "en"));
}

async function main() {
  const results = await probeAll(README_IMAGE_URLS);
  const dead = results.filter((result) => !result.ok);
  process.stdout.write(`Checked ${results.length} profile media URLs; ${dead.length} unavailable.\n`);
  if (dead.length > 0) {
    for (const result of dead) {
      process.stderr.write(`UNAVAILABLE ${result.url} — ${result.failure}\n`);
    }
    throw new Error(`${dead.length} profile media URL(s) no longer serve an image`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
