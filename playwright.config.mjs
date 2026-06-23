import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30_000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4174",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "npm run build && node scripts/serve.mjs",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: false,
    timeout: 30_000
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1678, height: 944 } } },
    { name: "mobile", use: { ...devices["Pixel 5"] } }
  ]
})
