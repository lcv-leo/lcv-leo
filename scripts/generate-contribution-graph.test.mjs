import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  renderContributionGraph,
  selectRecentDays,
  writeContributionGraphOutput,
} from "./generate-contribution-graph.mjs";

function buildCalendar(dayCount, countFor = (index) => index) {
  const weeks = [];
  const start = new Date("2026-08-02T00:00:00Z"); // a Sunday
  for (let index = 0; index < dayCount; index += 1) {
    const date = new Date(start.valueOf() + index * 86_400_000);
    const iso = date.toISOString().slice(0, 10);
    const weekday = date.getUTCDay();
    if (weekday === 0) weeks.push({ firstDay: iso, contributionDays: [] });
    weeks.at(-1).contributionDays.push({
      contributionCount: countFor(index),
      date: iso,
      weekday,
    });
  }
  return {
    totalContributions: weeks.flatMap((week) => week.contributionDays).reduce((sum, day) => sum + day.contributionCount, 0),
    weeks,
  };
}

test("selects the most recent days in chronological order", () => {
  const days = selectRecentDays(buildCalendar(70), 31);
  assert.equal(days.length, 31);
  assert.equal(days.at(-1).date, "2026-10-10");
  assert.equal(days.at(0).date, "2026-09-10");
  for (let index = 1; index < days.length; index += 1) {
    assert.ok(days[index].date > days[index - 1].date, "days must ascend");
  }
});

test("keeps every available day when the calendar is shorter than the window", () => {
  const days = selectRecentDays(buildCalendar(9), 31);
  assert.equal(days.length, 9);
});

test("rejects an invalid window", () => {
  assert.throws(() => selectRecentDays(buildCalendar(9), 0), /window/);
  assert.throws(() => selectRecentDays(buildCalendar(9), 1.5), /window/);
});

test("renders the tokyo-night card with the measured visual contract", () => {
  const svg = renderContributionGraph(buildCalendar(40), {
    title: "Leonardo's Contribution Graph",
  });

  assert.match(svg, /^<\?xml version="1\.0"/);
  assert.match(svg, /width="1200" height="420"/);
  assert.match(svg, /fill="#1a1b27"/); // card background
  assert.match(svg, /#70a5fd/); // line, area, labels and title
  assert.match(svg, /#a9b1d6/); // point stroke
  assert.match(svg, /<path class="graph-line" d="M /);
  assert.match(svg, /<path class="graph-area" d="M /);
  assert.match(svg, / C /, "the series must be smoothed like the upstream card");
  assert.match(svg, /Leonardo&apos;s Contribution Graph/);
  assert.match(svg, />Days</);
  assert.match(svg, />Contributions</);
  assert.match(svg, /prefers-reduced-motion/);
  assert.equal(
    svg,
    renderContributionGraph(buildCalendar(40), { title: "Leonardo's Contribution Graph" }),
    "rendering must be deterministic",
  );
});

test("escapes hostile titles instead of emitting raw markup", () => {
  const svg = renderContributionGraph(buildCalendar(40), {
    title: '</text><script>alert(1)</script>',
  });
  assert.equal(svg.includes("<script>"), false);
  assert.match(svg, /&lt;script&gt;/);
});

test("scales the vertical axis above the busiest day", () => {
  const svg = renderContributionGraph(buildCalendar(40, (index) => (index === 39 ? 37 : 1)), {
    title: "Graph",
  });
  const ticks = [...svg.matchAll(/class="axis-label axis-label--y"[^>]*>(\d+)</gu)].map((match) =>
    Number(match[1]),
  );
  assert.ok(ticks.length >= 2, "the vertical axis must carry ticks");
  assert.equal(Math.min(...ticks), 0);
  assert.ok(Math.max(...ticks) >= 37, "the top tick must cover the busiest day");
});

test("renders a flat baseline when there is no activity", () => {
  const svg = renderContributionGraph(buildCalendar(40, () => 0), { title: "Graph" });
  assert.match(svg, /<path class="graph-line" d="M /);
  assert.equal(svg.includes("NaN"), false);
});

test("writes the SVG atomically to the requested path", async () => {
  const directory = await mkdtemp(join(tmpdir(), "graph-"));
  try {
    const output = join(directory, "github-contribution-graph.svg");
    await writeContributionGraphOutput({
      calendar: buildCalendar(40),
      title: "Leonardo's Contribution Graph",
      output,
    });
    const written = await readFile(output, "utf8");
    assert.match(written, /^<\?xml version="1\.0"/);
    assert.match(written, /Leonardo&apos;s Contribution Graph/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
