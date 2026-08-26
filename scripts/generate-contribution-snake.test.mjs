import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  fetchContributionCalendar,
  renderContributionSnake,
  validateCalendar,
  writeContributionSnakeOutputs,
} from "./generate-contribution-snake.mjs";

const CALENDAR = {
  totalContributions: 8,
  weeks: [
    {
      firstDay: "2026-08-16",
      contributionDays: [
        { contributionCount: 0, date: "2026-08-16", weekday: 0 },
        { contributionCount: 1, date: "2026-08-17", weekday: 1 },
        { contributionCount: 3, date: "2026-08-18", weekday: 2 },
      ],
    },
    {
      firstDay: "2026-08-23",
      contributionDays: [
        { contributionCount: 4, date: "2026-08-23", weekday: 0 },
        { contributionCount: 0, date: "2026-08-24", weekday: 1 },
      ],
    },
  ],
};

test("renders deterministic light and dark SVGs with motion and reduced-motion support", () => {
  const light = renderContributionSnake(CALENDAR, { theme: "light", user: "lcv-leo" });
  const dark = renderContributionSnake(CALENDAR, { theme: "dark", user: "lcv-leo" });

  assert.match(light, /^<\?xml version="1\.0"/);
  assert.match(light, /<animateMotion dur="16s"/);
  assert.match(light, /prefers-reduced-motion/);
  assert.match(light, /2026-08-18: 3 contributions/);
  assert.match(light, /#ffffff/);
  assert.match(dark, /#0d1117/);
  assert.notEqual(light, dark);
  assert.equal(light, renderContributionSnake(CALENDAR, { theme: "light", user: "lcv-leo" }));
});

test("rejects malformed or duplicated contribution data", () => {
  assert.throws(() => validateCalendar({ totalContributions: 0, weeks: [] }), /week count/);
  assert.throws(
    () =>
      validateCalendar({
        totalContributions: 1,
        weeks: [
          {
            firstDay: "2026-02-29",
            contributionDays: [{ contributionCount: 1, date: "2026-02-29", weekday: 0 }],
          },
        ],
      }),
    /invalid/,
  );
  assert.throws(
    () =>
      validateCalendar({
        totalContributions: 1,
        weeks: [
          {
            firstDay: "2026-08-16",
            contributionDays: [{ contributionCount: 1, date: "2026-08-17", weekday: 2 }],
          },
        ],
      }),
    /inconsistent weekday/,
  );
  assert.throws(
    () =>
      validateCalendar({
        totalContributions: 2,
        weeks: [
          {
            firstDay: "2026-08-16",
            contributionDays: [
              { contributionCount: 1, date: "2026-08-16", weekday: 0 },
              { contributionCount: 1, date: "2026-08-16", weekday: 1 },
            ],
          },
        ],
      }),
    /duplicated/,
  );
});

test("rejects an invalid GitHub login before making a request", async () => {
  let called = false;
  await assert.rejects(
    fetchContributionCalendar({
      token: "test-token",
      user: "invalid/login",
      fetchImpl: async () => {
        called = true;
      },
    }),
    /valid GitHub login/,
  );
  assert.equal(called, false);
});

test("fails closed on HTTP and GraphQL errors", async () => {
  await assert.rejects(
    fetchContributionCalendar({
      token: "test-token",
      user: "lcv-leo",
      fetchImpl: async () => ({ ok: false, status: 401 }),
    }),
    /HTTP 401/,
  );

  await assert.rejects(
    fetchContributionCalendar({
      token: "test-token",
      user: "lcv-leo",
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ errors: [{ message: "rate limited" }] }),
      }),
    }),
    /rate limited/,
  );
});

test("fails closed when the GitHub request times out", async () => {
  await assert.rejects(
    fetchContributionCalendar({
      token: "test-token",
      user: "lcv-leo",
      timeoutMs: 10,
      fetchImpl: async (_url, { signal }) =>
        await new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), { once: true });
        }),
    }),
    /timed out/,
  );
});

test("writes both outputs and leaves no temporary files", async () => {
  const directory = await mkdtemp(join(tmpdir(), "lcv-snake-"));
  const lightOutput = join(directory, "light.svg");
  const darkOutput = join(directory, "dark.svg");
  try {
    await writeContributionSnakeOutputs({
      calendar: CALENDAR,
      user: "lcv-leo",
      lightOutput,
      darkOutput,
    });
    assert.match(await readFile(lightOutput, "utf8"), /#ffffff/);
    assert.match(await readFile(darkOutput, "utf8"), /#0d1117/);
    assert.deepEqual((await readdir(directory)).sort(), ["dark.svg", "light.svg"]);

    await writeFile(lightOutput, "stale", "utf8");
    await writeContributionSnakeOutputs({
      calendar: CALENDAR,
      user: "lcv-leo",
      lightOutput,
      darkOutput,
    });
    assert.doesNotMatch(await readFile(lightOutput, "utf8"), /^stale$/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
