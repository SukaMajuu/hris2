import { test, expect } from "@playwright/test";

test.describe("Sign In", () => {
	test("Login with email and password", async ({ page }) => {
		await page.goto("/login");
		await page.fill('input[name="email"]', "user@example.com");
		await page.fill('input[name="password"]', "securepassword");
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL("/dashboard");
	});

	test("Shows validation errors for invalid inputs", async ({ page }) => {
		await page.goto("/register");
		await page.fill('input[name="email"]', "invalid-email");
		await page.click('button[type="submit"]');
		await expect(
			page.locator('input[name="email"] + .error')
		).toContainText("valid email");
	});

	test("Shows error with invalid credentials", async ({ page }) => {
		await page.goto("/login");
		await page.fill('input[name="email"]', "nonexistent@example.com");
		await page.fill('input[name="password"]', "wrongpassword");
		await page.click('button[type="submit"]');
		await expect(page.locator(".error-message")).toBeVisible();
		await expect(page.locator(".error-message")).toContainText(
			"Invalid credentials"
		);
	});

	test("Login via Google OAuth", async ({ page }) => {
		await page.goto("/login");
		await page.click("button.google-login");
		await page.waitForURL(/accounts.google.com/);
		// TODO: Simulate Google OAuth flow here
		await expect(page).toHaveURL("/dashboard");
	});

	test("Login via phone number", async ({ page }) => {
		await page.goto("/login");
		await page.fill('input[name="phone"]', "+621234567890");
		await page.click('button[type="submit"]');
		await page.fill('input[name="otp"]', "123456");
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL("/dashboard");
	});

	test("Login via Employee ID", async ({ page }) => {
		await page.goto("/login");
		await page.fill('input[name="employee_id"]', "EMP12345");
		await page.fill('input[name="password"]', "securepassword");
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL("/dashboard");
	});
});
