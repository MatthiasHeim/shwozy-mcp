import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display hero section", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Your voice, Claude's memory");
    await expect(page.locator(".hero p")).toContainText("Connect your Shwozy voice notes");
    await expect(page.locator(".cta-button")).toBeVisible();
  });

  test("should display all 4 feature cards", async ({ page }) => {
    const features = page.locator(".feature-card");
    await expect(features).toHaveCount(4);

    await expect(features.nth(0)).toContainText("List Pending Actions");
    await expect(features.nth(1)).toContainText("Get Full Details");
    await expect(features.nth(2)).toContainText("Mark Complete");
    await expect(features.nth(3)).toContainText("Search Recordings");
  });

  test("should display how it works steps", async ({ page }) => {
    const steps = page.locator(".step");
    await expect(steps).toHaveCount(3);

    await expect(steps.nth(0)).toContainText("Record in Shwozy");
    await expect(steps.nth(1)).toContainText("AI Extracts Actions");
    await expect(steps.nth(2)).toContainText("Claude Executes");
  });

  test("should have config generator", async ({ page }) => {
    await expect(page.locator("#apiKey")).toBeVisible();
    await expect(page.locator("#configOutput")).toBeVisible();
    await expect(page.locator(".copy-button")).toBeVisible();
  });

  test("config generator should update when API key is entered", async ({ page }) => {
    const apiKeyInput = page.locator("#apiKey");
    const configOutput = page.locator("#configOutput");

    // Initial state should have placeholder
    await expect(configOutput).toContainText("YOUR_API_KEY_HERE");

    // Type an API key
    await apiKeyInput.fill("sk_test_12345");

    // Config should update with the entered key
    await expect(configOutput).toContainText("sk_test_12345");
    await expect(configOutput).toContainText('"Authorization": "Bearer sk_test_12345"');
  });

  test("copy button should copy config to clipboard", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    // Enter an API key
    await page.locator("#apiKey").fill("sk_test_copy");

    // Click copy button
    await page.locator(".copy-button").click();

    // Button should show "Copied!"
    await expect(page.locator(".copy-button")).toHaveText("Copied!");

    // Button should revert after 2 seconds
    await page.waitForTimeout(2500);
    await expect(page.locator(".copy-button")).toHaveText("Copy");
  });

  test("should display store badges", async ({ page }) => {
    const badges = page.locator(".store-badge");
    await expect(badges).toHaveCount(2);

    await expect(badges.nth(0)).toContainText("App Store");
    await expect(badges.nth(1)).toContainText("Play Store");
  });

  test("should have footer with links", async ({ page }) => {
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator("footer")).toContainText("GitHub");
    await expect(page.locator("footer")).toContainText("Privacy Policy");
    await expect(page.locator("footer")).toContainText("Contact");
  });
});

test.describe("Landing Page - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should be responsive on mobile", async ({ page }) => {
    await page.goto("/");

    // Hero should still be visible
    await expect(page.locator("h1")).toBeVisible();

    // Features should stack vertically
    const features = page.locator(".feature-card");
    await expect(features).toHaveCount(4);

    // Config generator should be usable
    await expect(page.locator("#apiKey")).toBeVisible();
  });
});

test.describe("Health Endpoint", () => {
  test("should return OK status", async ({ request }) => {
    const response = await request.get("/health");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
    expect(typeof body.sessions).toBe("number");
  });
});
