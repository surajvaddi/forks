import { expect, type Page, test } from "@playwright/test";

async function expectPromptInViewport(page: Page) {
  const prompt = page.getByLabel("Chat prompt");
  await expect(prompt).toBeVisible();
  const box = await prompt.boundingBox();
  const viewport = page.viewportSize();

  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
}

test("Forks learning flow renders", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Forks", exact: true })).toBeVisible();
  await expectPromptInViewport(page);
});

test("creates a project and opens its first thread", async ({ page }, testInfo) => {
  const title = `Modal Systems ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/");
  await page.getByLabel("New project").fill(title);
  await page.getByRole("button", { name: "Create project" }).click();

  await expect(page.getByRole("link", { name: title }).first()).toBeVisible();
  await expect(page).toHaveURL(/project=/);
  await expect(page).toHaveURL(/thread=/);
  await expect(page.getByTestId("project-item").filter({ has: page.getByRole("link", { name: title }) }).getByRole("link", { name: "First learning thread" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "First learning thread" })).toBeVisible();
  await expectPromptInViewport(page);
});

test("deletes projects and threads from the sidebar", async ({ page }, testInfo) => {
  const projectTitle = `Delete Project ${testInfo.project.name} ${Date.now()}`;
  const threadTitle = `Delete Thread ${testInfo.project.name} ${Date.now()}`;

  await page.goto("/");
  await page.getByLabel("New project").fill(projectTitle);
  await page.getByRole("button", { name: "Create project" }).click();
  await expect(page.getByRole("link", { name: projectTitle }).first()).toBeVisible();

  await page.getByLabel("New thread").fill(threadTitle);
  await page.getByRole("button", { name: "Create thread" }).click();
  const projectItem = page.getByTestId("project-item").filter({ has: page.getByRole("link", { name: projectTitle }) });
  await expect(projectItem.getByRole("link", { name: threadTitle })).toBeVisible();

  await page.getByRole("button", { name: `Delete thread ${threadTitle}` }).click();
  await expect(page.getByRole("link", { name: threadTitle })).toHaveCount(0);

  await page.getByRole("button", { name: `Delete project ${projectTitle}` }).click();
  await expect(page.getByRole("link", { name: projectTitle })).toHaveCount(0);
  await expectPromptInViewport(page);
});

test("submits a typed prompt with Enter", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Chat prompt").fill("hi");
  await page.getByLabel("Chat prompt").press("Enter");

  await expect(page.getByRole("heading", { name: "Learning Answer" }).last()).toBeVisible();
  await expectPromptInViewport(page);
  await expect(page).toHaveURL(/project=/);
  await expect(page).toHaveURL(/thread=/);
});

test("complete chat branch pin merge export flow", async ({ page, browserName }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "The full branch workspace is desktop-first in the MVP.");

  await page.goto("/");
  await page.getByLabel("Chat prompt").fill("Explain distributed job queues");
  await page.getByRole("button", { name: "Send prompt" }).click();

  await expect(page.getByRole("heading", { name: "Distributed Job Queues" }).last()).toBeVisible();
  await expectPromptInViewport(page);
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
