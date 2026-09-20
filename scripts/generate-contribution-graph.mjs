#!/usr/bin/env node

// Renders the profile contribution activity graph from the same official GitHub
// GraphQL calendar the contribution snake already consumes, so the README card
// no longer depends on a third-party rendering host.

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { fetchContributionCalendar, validateCalendar } from "./generate-contribution-snake.mjs";

const DEFAULT_WINDOW_DAYS = 31;
const DEFAULT_TITLE = "Leonardo's Contribution Graph";

// Measured from the upstream tokyo-night card the README used before its host
// was disabled: background, series, label and point colors, and the geometry of
// the plotting area.
const CARD = {
  width: 1200,
  height: 420,
  background: "#1a1b27",
  series: "#70a5fd",
  point: "#a9b1d6",
  plot: { left: 90, right: 1180, top: 80, bottom: 350 },
};

const TICK_STEPS = [1, 2, 2.5, 5, 10];
const TARGET_TICK_COUNT = 9;

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function selectRecentDays(calendarInput, windowDays = DEFAULT_WINDOW_DAYS) {
  invariant(
    Number.isSafeInteger(windowDays) && windowDays > 0,
    "The graph window must be a positive whole number of days",
  );
  const calendar = validateCalendar(calendarInput);
  const days = calendar.weeks
    .flatMap((week) => week.contributionDays)
    .sort((left, right) => left.date.localeCompare(right.date));
  return days.slice(-windowDays);
}

export function buildVerticalAxis(days) {
  const busiest = Math.max(0, ...days.map((day) => day.contributionCount));
  const target = Math.max(1, busiest);
  let step = 0;
  for (let magnitude = 0; step === 0; magnitude += 1) {
    for (const base of TICK_STEPS) {
      const candidate = base * 10 ** magnitude;
      if (target / candidate <= TARGET_TICK_COUNT) {
        step = candidate;
        break;
      }
    }
  }
  const top = Math.ceil(target / step) * step;
  const ticks = [];
  for (let value = 0; value <= top + step / 2; value += step) {
    ticks.push(Number(value.toFixed(4)));
  }
  return { top, ticks };
}

// Catmull-Rom control points expressed as cubic Beziers, clamped to the plotting
// area so an overshoot between a spike and a quiet day cannot leave the card.
function smoothSegments(points, { top, bottom, round }) {
  let path = "";
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index];
    const start = points[index];
    const end = points[index + 1];
    const next = points[index + 2] ?? end;
    const clamp = (value) => Math.min(bottom, Math.max(top, value));
    const firstX = round(start.x + (end.x - previous.x) / 6);
    const firstY = round(clamp(start.y + (end.y - previous.y) / 6));
    const secondX = round(end.x - (next.x - start.x) / 6);
    const secondY = round(clamp(end.y - (next.y - start.y) / 6));
    path += ` C ${firstX} ${firstY}, ${secondX} ${secondY}, ${end.x} ${end.y}`;
  }
  return path;
}

export function renderContributionGraph(calendarInput, options = {}) {
  const { title = DEFAULT_TITLE, windowDays = DEFAULT_WINDOW_DAYS } = options;
  const days = selectRecentDays(calendarInput, windowDays);
  invariant(days.length > 0, "The contribution calendar has no days to plot");

  const { left, right, top, bottom } = CARD.plot;
  const { top: axisTop, ticks } = buildVerticalAxis(days);
  const span = days.length > 1 ? right - left : 0;
  const xFor = (index) =>
    days.length > 1 ? left + (index * span) / (days.length - 1) : (left + right) / 2;
  const yFor = (count) => bottom - (count / axisTop) * (bottom - top);
  const round = (value) => Number(value.toFixed(2));

  const points = days.map((day, index) => ({
    ...day,
    x: round(xFor(index)),
    y: round(yFor(day.contributionCount)),
  }));
  // The upstream card smoothed the series; keep that shape so the README card
  // does not visibly change when it stops coming from the disabled host.
  const curve = smoothSegments(points, { top, bottom, round });
  const line = `M ${points[0].x} ${points[0].y}${curve}`;
  const area = `M ${points[0].x} ${bottom} L ${points[0].x} ${points[0].y}${curve} L ${points.at(-1).x} ${bottom} Z`;

  const horizontalGrid = ticks.map(
    (tick) =>
      `  <line class="grid" x1="${left}" x2="${right}" y1="${round(yFor(tick))}" y2="${round(yFor(tick))}" />`,
  );
  const verticalGrid = points.map(
    (point) => `  <line class="grid" x1="${point.x}" x2="${point.x}" y1="${top}" y2="${bottom}" />`,
  );
  const verticalLabels = ticks.map(
    (tick) =>
      `  <text class="axis-label axis-label--y" x="${left - 10}" y="${round(yFor(tick) + 4)}" text-anchor="end">${tick}</text>`,
  );
  const horizontalLabels = points.map(
    (point) =>
      `  <text class="axis-label" x="${point.x}" y="${bottom + 22}" text-anchor="middle">${Number(point.date.slice(8, 10))}</text>`,
  );
  const markers = points.map(
    (point) =>
      `  <circle class="graph-point" cx="${point.x}" cy="${point.y}" r="5">` +
      `<title>${escapeXml(point.date)}: ${point.contributionCount} contribution${point.contributionCount === 1 ? "" : "s"}</title></circle>`,
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title description" viewBox="0 0 ${CARD.width} ${CARD.height}" width="${CARD.width}" height="${CARD.height}">`,
    `  <title id="title">${escapeXml(title)}</title>`,
    `  <desc id="description">Daily GitHub contributions over the latest ${days.length} days, from ${escapeXml(days[0].date)} to ${escapeXml(days.at(-1).date)}.</desc>`,
    `  <style>`,
    `    .card-title { font: 600 20px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${CARD.series}; }`,
    `    .axis-label { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${CARD.series}; }`,
    `    .axis-title { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${CARD.series}; }`,
    `    .grid { stroke: ${CARD.series}; stroke-width: 1; stroke-opacity: 0.3; stroke-dasharray: 2; }`,
    `    .graph-area { fill: ${CARD.series}; fill-opacity: 0.1; stroke: none; }`,
    `    .graph-line { fill: none; stroke: ${CARD.series}; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round;`,
    `      stroke-dasharray: 5000; stroke-dashoffset: 5000; animation: dash 5s ease-in-out forwards; }`,
    `    .graph-point { fill: ${CARD.point}; }`,
    `    @keyframes dash { to { stroke-dashoffset: 0; } }`,
    `    @media (prefers-reduced-motion: reduce) { .graph-line { animation: none; stroke-dashoffset: 0; } }`,
    `  </style>`,
    `  <rect width="100%" height="100%" fill="${CARD.background}" />`,
    `  <text class="card-title" x="${CARD.width / 2}" y="36" text-anchor="middle">${escapeXml(title)}</text>`,
    ...horizontalGrid,
    ...verticalGrid,
    `  <path class="graph-area" d="${area}" />`,
    `  <path class="graph-line" d="${line}" />`,
    ...markers,
    ...verticalLabels,
    ...horizontalLabels,
    `  <text class="axis-title" x="${(left + right) / 2}" y="${CARD.height - 20}" text-anchor="middle">Days</text>`,
    `  <text class="axis-title" x="20" y="${(top + bottom) / 2}" text-anchor="middle" transform="rotate(-90, 20, ${(top + bottom) / 2})">Contributions</text>`,
    `</svg>`,
    "",
  ].join("\n");
}

async function atomicWrite(targetPath, content) {
  const absoluteTarget = resolve(targetPath);
  const targetDirectory = dirname(absoluteTarget);
  const temporaryPath = resolve(
    targetDirectory,
    `.${basename(absoluteTarget)}.${process.pid}.${randomUUID()}.tmp`,
  );
  await mkdir(targetDirectory, { recursive: true });
  try {
    await writeFile(temporaryPath, content, { encoding: "utf8", flag: "wx" });
    await rename(temporaryPath, absoluteTarget);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

export async function writeContributionGraphOutput({ calendar, title, output, windowDays }) {
  invariant(typeof output === "string" && output.length > 0, "An output path is required");
  await atomicWrite(output, renderContributionGraph(calendar, { title, windowDays }));
}

function parseArguments(argv) {
  const options = {
    user: process.env.GITHUB_USER,
    token: process.env.GITHUB_TOKEN,
    title: DEFAULT_TITLE,
    output: "site/github-contribution-graph.svg",
    fixture: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    invariant(value && !value.startsWith("--"), `Missing value for ${flag}`);
    if (flag === "--user") options.user = value;
    else if (flag === "--title") options.title = value;
    else if (flag === "--output") options.output = value;
    else if (flag === "--fixture") options.fixture = value;
    else throw new Error(`Unknown argument: ${flag}`);
    index += 1;
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const calendar = options.fixture
    ? validateCalendar(JSON.parse(await readFile(resolve(options.fixture), "utf8")))
    : await fetchContributionCalendar({ token: options.token, user: options.user });
  await writeContributionGraphOutput({
    calendar,
    title: options.title,
    output: options.output,
  });
  process.stdout.write(`Generated contribution graph SVG at ${options.output}.\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
