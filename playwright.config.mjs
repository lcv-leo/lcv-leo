import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./scripts",
  testMatch: "pages-provenance.spec.mjs",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: "line",
  use: {
    ...devices["Desktop Chrome"],
    bypassCSP: false,
    headless: true,
    reducedMotion: "reduce",
    serviceWorkers: "block",
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
