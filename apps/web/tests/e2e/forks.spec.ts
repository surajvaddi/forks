import { expect, test } from "@playwright/test";

test("Forks learning flow renders", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Forks" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ask into the project." })).toBeVisible();
});
