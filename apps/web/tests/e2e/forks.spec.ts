import { expect, type Page, test } from "@playwright/test";

async function expectPromptInViewport(page: Page) {
  const prompt = page.getByLabel("Chat prompt");
  await expect(prompt).toBeVisible();
  await expect(prompt).toHaveAttribute("data-hydrated", "true");
  const box = await prompt.boundingBox();
  const viewport = page.viewportSize();

  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
}

async function openSeedThread(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: "How Forks helps you learn" }).click();
  await expectPromptInViewport(page);
}

test.beforeEach(async ({ page }) => {
  await page.request.post("/api/test/reset");
});

test("Forks learning flow renders", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Forks", exact: true })).toBeVisible();
  await expect(page.getByTestId("project-home")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Learning With Forks" })).toBeVisible();
  await expect(page.getByTestId("project-flow-tree").getByRole("link", { name: /How Forks helps you learn/ })).toBeVisible();
});

test("clicking a project opens project home without selecting a thread", async ({ page }) => {
  await page.goto("/?project=project_seed&thread=thread_seed");
  await expectPromptInViewport(page);

  await page.getByRole("link", { name: "Learning With Forks" }).click();
  await expect(page).toHaveURL(/project=project_seed/);
  await expect(page).not.toHaveURL(/thread=/);
  await expect(page.getByTestId("project-home")).toBeVisible();
  await expect(page.getByLabel("Chat prompt")).toHaveCount(0);
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
  await openSeedThread(page);
  await page.getByLabel("Chat prompt").fill("hi");
  await page.getByLabel("Chat prompt").press("Enter");
  await expect(page.getByLabel("Chat prompt")).toHaveValue("");

  await expect(page.getByRole("heading", { name: "Learning Answer" }).last()).toBeVisible();
  const userBubble = page.getByTestId("user-turn").filter({ hasText: "hi" }).last();
  await expect(userBubble).toBeVisible();
  const bubbleBox = await userBubble.boundingBox();
  const chatBox = await page.getByLabel("Learning chat").boundingBox();
  expect(bubbleBox).not.toBeNull();
  expect(chatBox).not.toBeNull();
  expect(bubbleBox!.x + bubbleBox!.width).toBeGreaterThan(chatBox!.x + chatBox!.width * 0.8);
  await expectPromptInViewport(page);
  await expect(page).toHaveURL(/project=/);
  await expect(page).toHaveURL(/thread=/);
});

test("resizes the chat composer and keeps the transcript usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Manual composer resizing is disabled on mobile.");

  await page.setViewportSize({ width: 1280, height: 700 });
  await openSeedThread(page);
  const composer = page.getByTestId("chat-composer");
  const handle = page.getByTestId("composer-resize-handle");
  const transcript = page.getByTestId("chat-transcript");
  const initialComposerBox = await composer.boundingBox();
  const initialTranscriptBox = await transcript.boundingBox();
  expect(initialComposerBox).not.toBeNull();
  expect(initialTranscriptBox).not.toBeNull();
  expect(Math.round(initialComposerBox!.height)).toBeGreaterThanOrEqual(120);

  const handleBox = await handle.boundingBox();
  expect(handleBox).not.toBeNull();
  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y - 130);
  await page.mouse.up();

  const enlargedComposerBox = await composer.boundingBox();
  const shrunkenTranscriptBox = await transcript.boundingBox();
  expect(enlargedComposerBox).not.toBeNull();
  expect(shrunkenTranscriptBox).not.toBeNull();
  expect(enlargedComposerBox!.height).toBeGreaterThan(initialComposerBox!.height + 40);
  expect(shrunkenTranscriptBox!.height).toBeLessThan(initialTranscriptBox!.height);
  await expect.poll(async () => transcript.evaluate((element) => getComputedStyle(element).overflowY)).toBe("auto");

  const enlargedHandleBox = await handle.boundingBox();
  expect(enlargedHandleBox).not.toBeNull();
  await page.mouse.move(enlargedHandleBox!.x + enlargedHandleBox!.width / 2, enlargedHandleBox!.y + enlargedHandleBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(enlargedHandleBox!.x + enlargedHandleBox!.width / 2, enlargedHandleBox!.y + 500);
  await page.mouse.up();

  const clampedComposerBox = await composer.boundingBox();
  expect(clampedComposerBox).not.toBeNull();
  expect(Math.round(clampedComposerBox!.height)).toBe(96);

  await page.getByLabel("Chat prompt").fill("hi after resize");
  await page.getByLabel("Chat prompt").press("Enter");
  await expect(page.getByLabel("Chat prompt")).toHaveValue("");
  await expect(page.getByTestId("user-turn").filter({ hasText: "hi after resize" }).last()).toBeVisible();
  const sendButtonBox = await page.getByRole("button", { name: "Send prompt" }).boundingBox();
  expect(sendButtonBox).not.toBeNull();
  expect(sendButtonBox!.height).toBeGreaterThan(40);
});

test("expands and condenses hover definitions inline", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Hover definition editing is tested on pointer devices.");

  await openSeedThread(page);
  await page.getByText("core concept").first().hover();
  await page.getByRole("button", { name: "Add definition for core concept to text" }).click();

  await expect(page.getByText("The main idea a learner should understand before branching into details.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Condense definition for core concept" })).not.toBeVisible();
  await page.getByTestId("expanded-definition").hover();
  await expect(page.getByRole("button", { name: "Condense definition for core concept" })).toBeVisible();

  await page.getByRole("button", { name: "Condense definition for core concept" }).click();
  await expect(page.getByRole("button", { name: "Condense definition for core concept" })).toHaveCount(0);
  await expect(page.getByText("core concept").first()).toBeVisible();
});

test("powers up selected answer text as draggable context", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Powered text selection is tested on pointer devices.");

  await openSeedThread(page);
  await page.evaluate(() => {
    const paragraph = document.querySelector('[data-testid="answer-text"]');
    if (!paragraph) throw new Error("Answer text not found.");

    const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current && !current.textContent?.includes("core concept")) {
      current = walker.nextNode();
    }
    if (!current || !current.textContent) throw new Error("Selection text not found.");

    const start = current.textContent.indexOf("core concept");
    const range = document.createRange();
    range.setStart(current, start);
    range.setEnd(current, start + "core concept".length);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    paragraph.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  });

  const poweredSelection = page.getByTestId("powered-selection");
  await expect(poweredSelection).toContainText("core concept");
  await expect(poweredSelection).toHaveAttribute("draggable", "true");
  await expect(page.getByRole("button", { name: "Spin off core concept" })).toBeVisible();
  await expect(page.getByText(/Powered context:/)).toHaveCount(0);
});

test("spins off powered text with an inline action", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Powered text actions are tested on pointer devices.");

  await openSeedThread(page);
  await page.evaluate(() => {
    const answer = document.querySelector('[data-testid="answer-text"]');
    if (!answer) throw new Error("Answer text not found.");
    const walker = document.createTreeWalker(answer, NodeFilter.SHOW_TEXT);
    let current = walker.nextNode();
    while (current && !current.textContent?.includes("hidden prerequisite")) {
      current = walker.nextNode();
    }
    if (!current || !current.textContent) throw new Error("Selection text not found.");
    const start = current.textContent.indexOf("hidden prerequisite");
    const range = document.createRange();
    range.setStart(current, start);
    range.setEnd(current, start + "hidden prerequisite".length);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    answer.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  });

  await page.getByRole("button", { name: "Spin off hidden prerequisite" }).click();
  await expect(page.getByRole("heading", { name: "Flow: hidden prerequisite" })).toBeVisible();
  await expect(page.getByTestId("source-thread-chip")).toContainText("Spun off from:");
  await expect(page.getByTestId("source-thread-chip")).toContainText("How Forks helps you learn");
  await expect(page.getByTestId("source-thread-chip")).toContainText("hidden prerequisite");
  await expect(page.getByTestId("sidebar-spin-off-thread").getByRole("link", { name: /Flow: hidden prerequisite/ })).toBeVisible();
  await page.getByRole("button", { name: "Merge back" }).click();
  await expect(page.getByRole("heading", { name: "How Forks helps you learn" })).toBeVisible();
  await expect(page.getByTestId("merged-insight")).toContainText("Merged insight");
  await expect(page.getByTestId("merged-insight")).toContainText("Merged back: Flow: hidden prerequisite");
  await expect(page.getByTestId("thread-spin-off-count")).toContainText("1");
});

test("drops powered context on the workspace to create a new thread", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Powered context drops are tested on pointer devices.");

  await openSeedThread(page);
  const sourceHref = await page.getByRole("link", { name: "How Forks helps you learn" }).getAttribute("href");
  expect(sourceHref).not.toBeNull();
  const sourceIds = new URL(sourceHref!, "http://127.0.0.1").searchParams;
  const projectId = sourceIds.get("project");
  const threadId = sourceIds.get("thread");
  expect(projectId).not.toBeNull();
  expect(threadId).not.toBeNull();

  await page.evaluate(({ projectId, threadId }) => {
    if (!projectId || !threadId) throw new Error("Project and thread query params are required.");

    const surface = document.querySelector('[data-testid="flow-drop-surface"]');
    if (!surface) throw new Error("Flow drop surface not found.");

    const payload = {
      projectId,
      sourceThreadId: threadId,
      selectedText: "core concept",
      contextualText: "core concept",
      operation: "EXTRACTION"
    };
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("application/x-forks-context", JSON.stringify(payload));
    dataTransfer.setData("text/plain", payload.selectedText);
    surface.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer }));
    surface.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }));
  }, { projectId, threadId });

  await expect(page.getByRole("link", { name: "Flow: core concept" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Flow: core concept" })).toBeVisible();
  await expect(page.getByText("Start a new learning flow from this highlighted context:")).toBeVisible();
});

test("previews powered context thread drops only over the workspace", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Powered context previews are tested on pointer devices.");

  await openSeedThread(page);
  const sourceHref = await page.getByRole("link", { name: "How Forks helps you learn" }).getAttribute("href");
  expect(sourceHref).not.toBeNull();
  const sourceIds = new URL(sourceHref!, "http://127.0.0.1").searchParams;
  const projectId = sourceIds.get("project");
  const threadId = sourceIds.get("thread");
  expect(projectId).not.toBeNull();
  expect(threadId).not.toBeNull();

  await page.evaluate(({ projectId, threadId }) => {
    if (!projectId || !threadId) throw new Error("Project and thread query params are required.");
    const surface = document.querySelector('[data-testid="flow-drop-surface"]');
    if (!surface) throw new Error("Flow drop surface not found.");

    const dataTransfer = new DataTransfer();
    dataTransfer.setData(
      "application/x-forks-context",
      JSON.stringify({
        projectId,
        sourceThreadId: threadId,
        selectedText: "core concept",
        contextualText: "core concept",
        operation: "EXTRACTION"
      })
    );
    surface.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer }));
  }, { projectId, threadId });

  await expect(page.getByTestId("thread-drop-preview")).toBeVisible();
  await expect(page.getByTestId("thread-drop-preview")).toContainText("Flow: core concept");

  await page.evaluate(({ projectId, threadId }) => {
    if (!projectId || !threadId) throw new Error("Project and thread query params are required.");
    const prompt = document.querySelector('[aria-label="Chat prompt"]');
    if (!prompt) throw new Error("Prompt not found.");

    const dataTransfer = new DataTransfer();
    dataTransfer.setData(
      "application/x-forks-context",
      JSON.stringify({
        projectId,
        sourceThreadId: threadId,
        selectedText: "core concept",
        contextualText: "core concept",
        operation: "EXTRACTION"
      })
    );
    prompt.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer }));
  }, { projectId, threadId });

  await expect(page.getByTestId("thread-drop-preview")).toHaveCount(0);
});

test("drops powered context into the composer without creating a thread", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Powered context composer drops are tested on pointer devices.");

  await openSeedThread(page);
  const sourceHref = await page.getByRole("link", { name: "How Forks helps you learn" }).getAttribute("href");
  expect(sourceHref).not.toBeNull();
  const sourceIds = new URL(sourceHref!, "http://127.0.0.1").searchParams;
  const projectId = sourceIds.get("project");
  const threadId = sourceIds.get("thread");
  expect(projectId).not.toBeNull();
  expect(threadId).not.toBeNull();
  const prompt = page.getByLabel("Chat prompt");
  await prompt.fill("Explain  next");
  await prompt.evaluate((element) => {
    const textarea = element as HTMLTextAreaElement;
    textarea.setSelectionRange("Explain ".length, "Explain ".length);
  });

  await page.evaluate(({ projectId, threadId }) => {
    if (!projectId || !threadId) throw new Error("Project and thread query params are required.");
    const prompt = document.querySelector('[aria-label="Chat prompt"]');
    if (!prompt) throw new Error("Prompt not found.");

    const dataTransfer = new DataTransfer();
    dataTransfer.setData(
      "application/x-forks-context",
      JSON.stringify({
        projectId,
        sourceThreadId: threadId,
        selectedText: "core concept",
        contextualText: "core concept",
        operation: "EXTRACTION"
      })
    );
    prompt.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }));
  }, { projectId, threadId });

  await expect(prompt).toHaveValue("Explain core concept next");
  await expect(page.getByTestId("composer-context-row")).toContainText("core concept");
  await page.getByRole("button", { name: "Remove context core concept" }).click();
  await expect(page.getByTestId("composer-context-row")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Flow: core concept" })).toHaveCount(0);
});

test("invalid powered context drops do not create threads", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Powered context drops are tested on pointer devices.");

  await page.goto("/");
  await page.evaluate(() => {
    const surface = document.querySelector('[data-testid="flow-drop-surface"]');
    if (!surface) throw new Error("Flow drop surface not found.");

    const dataTransfer = new DataTransfer();
    dataTransfer.setData("application/x-forks-context", "{nope");
    surface.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }));
  });

  await expect(page.getByRole("link", { name: "Flow: core concept" })).toHaveCount(0);
});

test("complete chat spin-off save synthesize export flow", async ({ page, browserName }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "The full branch workspace is desktop-first in the MVP.");

  await page.setViewportSize({ width: 1280, height: 560 });
  await openSeedThread(page);
  await page.getByLabel("Chat prompt").fill("Explain distributed job queues");
  await page.getByRole("button", { name: "Send prompt" }).click();

  await expect(page.getByRole("heading", { name: "Distributed Job Queues" }).last()).toBeVisible();
  await expectPromptInViewport(page);
  await expect(page.getByTestId("branch-panel").getByRole("heading", { name: "Suggested spin-offs" })).toBeVisible();
  await expect(page.getByTestId("branch-panel").getByText("Define idempotent handlers").first()).toBeVisible();

  const firstBranch = page.getByTestId("branch-card").filter({ has: page.getByRole("heading", { name: "Define idempotent handlers" }) }).first();
  await firstBranch.getByRole("button", { name: /Explore/ }).click();
  await expect(page.getByTestId("branch-panel").getByText(/interface stays calm/)).toBeVisible();

  const pinButton = firstBranch.getByRole("button", { name: /^Save$/ });
  if ((await pinButton.count()) > 0) {
    await pinButton.click();
  }
  await expect(page.getByTestId("memory-panel").getByText("Define idempotent handlers")).toBeVisible();

  await page.getByRole("button", { name: "Synthesize saved context" }).click();
  await expect(page.getByTestId("notes-panel").getByRole("heading", { name: /Study Note/ }).first()).toBeVisible();

  await page.getByRole("button", { name: "Export Markdown" }).first().click();
  await page.getByRole("button", { name: "Export PDF" }).first().click();
  await expect(page.getByTestId("exports-panel").getByText(/Study Note/).first()).toBeVisible();
  await expect(page.getByTestId("exports-panel").getByText("%PDF-1.4")).toHaveCount(0);
  await page.getByTestId("exports-panel").getByText(/\.pdf$/).first().click();
  await expect(page.getByTestId("exports-panel").getByText("PDF artifact recorded.")).toBeVisible();
  const rightPanel = page.getByTestId("right-panel-scroll");
  await expect.poll(async () => rightPanel.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await rightPanel.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect.poll(async () => rightPanel.evaluate((element) => element.scrollTop > 0)).toBe(true);
  expect(browserName).toBe("chromium");
});
