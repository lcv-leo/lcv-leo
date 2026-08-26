#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const GRAPHQL_URL = "https://api.github.com/graphql";
const CONTRIBUTIONS_QUERY = `
  query ContributionCalendar($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            firstDay
            contributionDays {
              contributionCount
              date
              weekday
            }
          }
        }
      }
    }
  }
`;

const THEMES = {
  light: {
    background: "#ffffff",
    levels: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    snake: ["#8250df", "#a475f9", "#bf8cff", "#d2a8ff", "#e2c5ff"],
  },
  dark: {
    background: "#0d1117",
    levels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
    snake: ["#a371f7", "#bc8cff", "#d2a8ff", "#e2c5ff", "#eddeff"],
  },
};

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

function validateLogin(login) {
  invariant(
    typeof login === "string" &&
      /^[A-Za-z0-9-]{1,39}$/.test(login) &&
      !login.startsWith("-") &&
      !login.endsWith("-"),
    "GITHUB_USER must be a valid GitHub login",
  );
  return login;
}

function parseIsoDate(value, label) {
  invariant(typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value), `${label} is invalid`);
  const parsed = new Date(`${value}T00:00:00Z`);
  invariant(!Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value, `${label} is invalid`);
  return parsed;
}

export function validateCalendar(rawCalendar) {
  invariant(rawCalendar && typeof rawCalendar === "object", "Contribution calendar is missing");
  invariant(
    Number.isSafeInteger(rawCalendar.totalContributions) && rawCalendar.totalContributions >= 0,
    "Contribution total is invalid",
  );
  invariant(Array.isArray(rawCalendar.weeks), "Contribution weeks are missing");
  invariant(rawCalendar.weeks.length >= 1 && rawCalendar.weeks.length <= 54, "Contribution week count is invalid");

  const seenDates = new Set();
  let previousFirstDay = null;
  const weeks = rawCalendar.weeks.map((week, weekIndex) => {
    invariant(week && typeof week === "object", `Contribution week ${weekIndex} is invalid`);
    const firstDay = parseIsoDate(week.firstDay, `Contribution week ${weekIndex} firstDay`);
    invariant(firstDay.getUTCDay() === 0, `Contribution week ${weekIndex} must start on Sunday`);
    if (previousFirstDay) {
      invariant(
        firstDay.valueOf() - previousFirstDay.valueOf() === 7 * 24 * 60 * 60 * 1_000,
        `Contribution week ${weekIndex} is not contiguous`,
      );
    }
    previousFirstDay = firstDay;
    invariant(Array.isArray(week.contributionDays), `Contribution week ${weekIndex} has no days`);
    invariant(week.contributionDays.length >= 1 && week.contributionDays.length <= 7, `Contribution week ${weekIndex} has an invalid day count`);

    const contributionDays = week.contributionDays.map((day, dayIndex) => {
      invariant(day && typeof day === "object", `Contribution day ${weekIndex}:${dayIndex} is invalid`);
      const date = parseIsoDate(day.date, `Contribution day ${weekIndex}:${dayIndex} date`);
      invariant(!seenDates.has(day.date), `Contribution date ${day.date} is duplicated`);
      invariant(Number.isSafeInteger(day.weekday) && day.weekday >= 0 && day.weekday <= 6, `Contribution day ${day.date} has an invalid weekday`);
      invariant(date.getUTCDay() === day.weekday, `Contribution day ${day.date} has an inconsistent weekday`);
      invariant(
        date.valueOf() - firstDay.valueOf() === day.weekday * 24 * 60 * 60 * 1_000,
        `Contribution day ${day.date} is outside its week`,
      );
      invariant(
        Number.isSafeInteger(day.contributionCount) && day.contributionCount >= 0,
        `Contribution day ${day.date} has an invalid count`,
      );
      seenDates.add(day.date);
      return {
        contributionCount: day.contributionCount,
        date: day.date,
        weekday: day.weekday,
      };
    });

    return { firstDay: week.firstDay, contributionDays };
  });

  return { totalContributions: rawCalendar.totalContributions, weeks };
}

export async function fetchContributionCalendar({ token, user, fetchImpl = globalThis.fetch, timeoutMs = 15_000 }) {
  invariant(typeof token === "string" && token.length > 0, "GITHUB_TOKEN is required");
  validateLogin(user);
  invariant(typeof fetchImpl === "function", "A Fetch-compatible implementation is required");
  invariant(Number.isSafeInteger(timeoutMs) && timeoutMs > 0, "timeoutMs must be a positive integer");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("GitHub GraphQL request timed out")), timeoutMs);

  try {
    let response;
    try {
      response = await fetchImpl(GRAPHQL_URL, {
        method: "POST",
        headers: {
          accept: "application/vnd.github+json",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
          "user-agent": "lcv-leo-contribution-snake",
          "x-github-api-version": "2022-11-28",
        },
        body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login: user } }),
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) throw new Error("GitHub GraphQL request timed out", { cause: error });
      throw error;
    }

    invariant(response && typeof response.ok === "boolean", "GitHub GraphQL returned an invalid response");
    if (!response.ok) throw new Error(`GitHub GraphQL returned HTTP ${response.status}`);

    let payload;
    try {
      payload = await response.json();
    } catch (error) {
      throw new Error("GitHub GraphQL returned invalid JSON", { cause: error });
    }

    if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
      const messages = payload.errors.map((entry) => entry?.message).filter((value) => typeof value === "string");
      throw new Error(`GitHub GraphQL returned errors: ${messages.join("; ") || "unspecified error"}`);
    }

    invariant(payload?.data?.user, `GitHub user ${user} was not found`);
    return validateCalendar(payload.data.user.contributionsCollection?.contributionCalendar);
  } finally {
    clearTimeout(timer);
  }
}

function contributionLevel(count, maximum) {
  if (count === 0 || maximum === 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((count / maximum) * 4)));
}

function snakePath(weekCount, margin, pitch, cellSize) {
  const points = [];
  for (let weekday = 0; weekday < 7; weekday += 1) {
    const indices = Array.from({ length: weekCount }, (_, index) => index);
    if (weekday % 2 === 1) indices.reverse();
    for (const weekIndex of indices) {
      points.push(`${margin + weekIndex * pitch + cellSize / 2} ${margin + weekday * pitch + cellSize / 2}`);
    }
  }
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point}`).join(" ");
}

export function renderContributionSnake(calendarInput, { theme = "light", user = "lcv-leo" } = {}) {
  const calendar = validateCalendar(calendarInput);
  validateLogin(user);
  invariant(Object.hasOwn(THEMES, theme), `Unknown theme: ${theme}`);

  const palette = THEMES[theme];
  const cellSize = 10;
  const gap = 3;
  const pitch = cellSize + gap;
  const margin = 8;
  const width = margin * 2 + calendar.weeks.length * pitch - gap;
  const height = margin * 2 + 7 * pitch - gap;
  const maximum = Math.max(0, ...calendar.weeks.flatMap((week) => week.contributionDays.map((day) => day.contributionCount)));
  const cells = [];

  for (const [weekIndex, week] of calendar.weeks.entries()) {
    for (const day of week.contributionDays) {
      const level = contributionLevel(day.contributionCount, maximum);
      const x = margin + weekIndex * pitch;
      const y = margin + day.weekday * pitch;
      cells.push(
        `  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${palette.levels[level]}">` +
          `<title>${escapeXml(day.date)}: ${day.contributionCount} contribution${day.contributionCount === 1 ? "" : "s"}</title></rect>`,
      );
    }
  }

  const path = snakePath(calendar.weeks.length, margin, pitch, cellSize);
  const segments = palette.snake.map(
    (color, index) =>
      `  <circle class="snake-segment" r="${Math.max(2.8, 4.8 - index * 0.4)}" fill="${color}">` +
      `<animateMotion dur="16s" begin="-${(index * 0.16).toFixed(2)}s" repeatCount="indefinite" calcMode="linear" path="${path}" />` +
      `</circle>`,
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title description" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    `  <title id="title">${escapeXml(user)} contribution snake</title>`,
    `  <desc id="description">Animated path over ${calendar.totalContributions} contributions in the latest ${calendar.weeks.length} weeks.</desc>`,
    `  <style>@media (prefers-reduced-motion: reduce) { .snake-segment { display: none; } }</style>`,
    `  <rect width="100%" height="100%" rx="6" fill="${palette.background}" />`,
    ...cells,
    ...segments,
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

export async function writeContributionSnakeOutputs({ calendar, user, lightOutput, darkOutput }) {
  invariant(typeof lightOutput === "string" && lightOutput.length > 0, "A light output path is required");
  invariant(typeof darkOutput === "string" && darkOutput.length > 0, "A dark output path is required");
  invariant(resolve(lightOutput) !== resolve(darkOutput), "Light and dark outputs must be different files");

  const light = renderContributionSnake(calendar, { theme: "light", user });
  const dark = renderContributionSnake(calendar, { theme: "dark", user });
  await atomicWrite(lightOutput, light);
  await atomicWrite(darkOutput, dark);
}

function parseArguments(argv) {
  const options = {
    user: process.env.GITHUB_USER,
    token: process.env.GITHUB_TOKEN,
    lightOutput: "site/github-contribution-grid-snake.svg",
    darkOutput: "site/github-contribution-grid-snake-dark.svg",
    fixture: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    invariant(value && !value.startsWith("--"), `Missing value for ${flag}`);
    if (flag === "--user") options.user = value;
    else if (flag === "--light-output") options.lightOutput = value;
    else if (flag === "--dark-output") options.darkOutput = value;
    else if (flag === "--fixture") options.fixture = value;
    else throw new Error(`Unknown argument: ${flag}`);
    index += 1;
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const user = validateLogin(options.user);
  const calendar = options.fixture
    ? validateCalendar(JSON.parse(await readFile(resolve(options.fixture), "utf8")))
    : await fetchContributionCalendar({ token: options.token, user });
  await writeContributionSnakeOutputs({
    calendar,
    user,
    lightOutput: options.lightOutput,
    darkOutput: options.darkOutput,
  });
  process.stdout.write(`Generated contribution snake SVGs for ${user}.\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
