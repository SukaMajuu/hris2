import { test, expect } from "@playwright/test";

test.describe("Sign Up", () => {
	test("Register via input form", async ({ page }) => {
		await page.goto("/register");
		await page.fill('input[name="name"]', "New User");
		await page.fill('input[name="email"]', "newuser@example.com");
		await page.fill('input[name="password"]', "securepassword");
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL("onboarding");
	});

	test("Register via Google OAuth", async ({ page }) => {
		await page.goto("/register");
		await page.click("button.google-signup");
		await page.waitForURL(/accounts.google.com/);
		// TODO: Simulate Google OAuth flow here
		await expect(page).toHaveURL("onboarding");
	});
});
