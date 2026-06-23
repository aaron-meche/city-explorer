import { expect, test } from "@playwright/test"

test("explorer controls support search layers traversal and persistence", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible()
  await expect(page.locator("#routeName")).toHaveText("New Orleans — French Quarter Loop")

  await page.getByRole("button", { name: "Toggle map type selector" }).click()
  await expect(page.locator("#mapTypeSelector")).toHaveClass(/hidden/)
  await page.getByRole("button", { name: "Toggle map type selector" }).click()
  await page.getByRole("button", { name: "Satellite" }).click()
  await expect(page.locator("#demoMap")).toHaveAttribute("data-map-type", "satellite")

  await page.getByRole("searchbox", { name: "Search the map" }).fill("lombard")
  await page.getByRole("button", { name: /Lombard Street/ }).click()
  await expect(page.locator("#currentRoad")).toHaveText("Lombard Street")

  await page.getByRole("button", { name: /Next Turn/ }).click()
  await expect(page.locator("#stepMetric")).toContainText("Step")

  await page.locator("#discoveryNote").fill("grade and switchback clues")
  await page.getByRole("button", { name: "Save View" }).click()
  await expect(page.locator("#savedDiscoveries")).toContainText("grade and switchback clues")
})

test("guesser flow starts places scores and reveals", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Guesser" }).click()
  await expect(page.locator("#guesserWorkspace")).toBeVisible()
  await page.getByRole("button", { name: "Start Round" }).click()
  await page.locator("#guessMap").click({ position: { x: 160, y: 110 } })
  await page.getByRole("button", { name: "Submit Guess" }).click()
  await expect(page.locator("#guesserScore")).toContainText("Score")
  await expect(page.locator("#roundSummary")).toBeVisible()
})
