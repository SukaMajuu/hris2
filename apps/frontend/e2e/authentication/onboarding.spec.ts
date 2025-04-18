import { test, expect } from "@playwright/test";

test.describe("Onboarding", () => {
	test("Displays welcoming page", async ({ page }) => {
		await page.goto("/onboarding");
		// TODO: Change the text to match the actual welcome message
		await expect(page.locator("h1")).toHaveText("Welcome to HRIS!");
	});

	test("Displays tutorial", async ({ page }) => {
		await page.goto("/onboarding");
		await expect(page.locator(".tutorial-section")).toBeVisible();
	});

	test("User completes app tour", async ({ page }) => {
		await page.goto("/onboarding");
		await page.click("button.start-tour");
		await page.click("button.next");
		await page.click("button.finish");
		await expect(page).toHaveURL("/dashboard");
	});
});
