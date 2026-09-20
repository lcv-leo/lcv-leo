import assert from "node:assert/strict";
import test from "node:test";

import { probeAll, probeUrl } from "./check-readme-media-liveness.mjs";

function respond({ status = 200, contentType = "image/svg+xml" } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => (name.toLowerCase() === "content-type" ? contentType : null) },
  };
}

test("accepts a host that still serves an image", async () => {
  const result = await probeUrl("https://example.test/card.svg", {
    fetchImpl: async () => respond(),
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
});

test("rejects the exact failure that broke the contribution graph", async () => {
  const result = await probeUrl("https://example.test/graph", {
    fetchImpl: async () => respond({ status: 402, contentType: "text/plain; charset=utf-8" }),
  });
  assert.equal(result.ok, false);
  assert.match(result.failure, /HTTP 402/);
});

test("rejects a 200 that is not an image", async () => {
  const result = await probeUrl("https://example.test/graph", {
    fetchImpl: async () => respond({ contentType: "text/html" }),
  });
  assert.equal(result.ok, false);
  assert.match(result.failure, /content-type text\/html/);
});

test("rejects a host that never answers", async () => {
  const result = await probeUrl("https://example.test/card.svg", {
    fetchImpl: async () => {
      throw new Error("connect ECONNREFUSED");
    },
  });
  assert.equal(result.ok, false);
  assert.match(result.failure, /ECONNREFUSED/);
});

test("retries once before condemning a flaky host", async () => {
  let calls = 0;
  const result = await probeUrl("https://example.test/card.svg", {
    fetchImpl: async () => {
      calls += 1;
      return calls === 1 ? respond({ status: 503, contentType: "text/plain" }) : respond();
    },
  });
  assert.equal(calls, 2);
  assert.equal(result.ok, true);
});

test("probes every distinct URL and reports them sorted", async () => {
  const seen = [];
  const results = await probeAll(
    [
      "https://example.test/b.svg",
      "https://example.test/a.svg",
      "https://example.test/a.svg",
      "https://example.test/dead.svg",
    ],
    {
      concurrency: 2,
      fetchImpl: async (url) => {
        seen.push(url);
        return url.endsWith("dead.svg") ? respond({ status: 402, contentType: "text/plain" }) : respond();
      },
    },
  );

  assert.deepEqual(
    results.map((result) => result.url),
    ["https://example.test/a.svg", "https://example.test/b.svg", "https://example.test/dead.svg"],
  );
  assert.equal(results.filter((result) => !result.ok).length, 1);
  assert.equal(seen.filter((url) => url.endsWith("a.svg")).length, 1, "duplicates must be collapsed");
});
