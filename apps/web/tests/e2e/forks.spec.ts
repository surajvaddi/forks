import { expect, test } from "@playwright/test";

test("Forks learning flow renders", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Forks" })).toBeVisible();
  await expect(page.getByLabel("Chat prompt")).toBeVisible();
});

test("creates a project and opens its first thread", async ({ page }, testInfo) => {
  const title = `Modal Systems ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/");
  await page.getByLabel("New project").fill(title);
  await page.getByRole("button", { name: "Create project" }).click();

  await expect(page.getByRole("link", { name: title }).first()).toBeVisible();
  await expect(page).toHaveURL(/project=/);
  await expect(page).toHaveURL(/thread=/);
  await expect(page.getByRole("heading", { name: "First learning thread" })).toBeVisible();
  await expect(page.getByLabel("Chat prompt")).toBeVisible();
});

test("complete chat branch pin merge export flow", async ({ page, browserName }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "The full branch workspace is desktop-first in the MVP.");

  await page.goto("/");
  await page.getByLabel("Chat prompt").fill("Explain distributed job queues");
  await page.getByRole("button", { name: "Send prompt" }).click();

  await expect(page.getByRole("heading", { name: "Distributed Job Queues" }).last()).toBeVisible();
  await expect(page.getByTestId("branch-panel").getByText("Define idempotent handlers").first()).toBeVisible();

  const firstBranch = page.getByTestId("branch-card").filter({ has: page.getByRole("heading", { name: "Define idempotent handlers" }) }).first();
  await firstBranch.getByRole("button", { name: /Expand/ }).click();
  await expect(page.getByTestId("branch-panel").getByText(/interface stays calm/)).toBeVisible();

  const pinButton = firstBranch.getByRole("button", { name: /^Pin$/ });
  if ((await pinButton.count()) > 0) {
    await pinButton.click();
  }
  await expect(page.getByTestId("memory-panel").getByText("Define idempotent handlers")).toBeVisible();

  await page.getByRole("button", { name: "Merge pinned" }).click();
  await expect(page.getByTestId("notes-panel").getByRole("heading", { name: /Study Note/ }).first()).toBeVisible();

  await page.getByRole("button", { name: "Export Markdown" }).first().click();
  await page.getByRole("button", { name: "Export PDF" }).first().click();
  await expect(page.getByTestId("exports-panel").getByText(/Study Note/).first()).toBeVisible();
  expect(browserName).toBe("chromium");
});
