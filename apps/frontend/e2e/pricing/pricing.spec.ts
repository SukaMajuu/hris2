import { test, expect } from "@playwright/test";
import { format, addDays } from "date-fns";
import { testCompany as testAccount } from "../fixtures/accounts";

test.describe("Pricing and Payment Flow", () => {
	let trialStartDate: Date;
	let trialEndDate: Date;
	let nextBillingDate: Date;

	test.beforeEach(async () => {
		trialStartDate = new Date();
		trialEndDate = addDays(trialStartDate, 14);

		nextBillingDate = new Date();
		nextBillingDate.setDate(28);
		if (nextBillingDate.getDate() < 28) {
			nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
		}
	});

	test("New user gets 14-day free trial", async ({ page }) => {
		await page.goto("/register");
		await page.fill('input[name="companyName"]', testAccount.companyName);
		await page.fill('input[name="email"]', testAccount.email);
		await page.fill('input[name="password"]', testAccount.password);
		await page.click('button[type="submit"]');

		await expect(page).toHaveURL(/dashboard/);

		await expect(page.locator(".trial-banner")).toBeVisible();
		await expect(page.locator(".trial-banner")).toContainText("14 hari");

		const expectedEndDateText = format(trialEndDate, "dd MMM yyyy");
		await expect(page.locator(".trial-expiry-date")).toContainText(
			expectedEndDateText
		);
	});

	test("Dashboard shows employee-based pricing calculation", async ({
		page,
	}) => {
		await page.goto("/login");
		await page.fill('input[name="email"]', testAccount.email);
		await page.fill('input[name="password"]', testAccount.password);
		await page.click('button[type="submit"]');

		await page.click("nav >> text=Billing");

		await expect(page.locator(".pricing-summary")).toBeVisible();

		await page.click("nav >> text=Employees");

		await page.click("nav >> text=Billing");
		await expect(page.locator(".employee-count")).toContainText("25");

		const expectedTotal = (testAccount.employees * 50000).toLocaleString(
			"id-ID"
		);
		await expect(page.locator(".total-amount")).toContainText(
			expectedTotal
		);
	});

	test("Shows correct billing date on the 28th", async ({ page }) => {
		await page.goto("/login");
		await page.fill('input[name="email"]', testAccount.email);
		await page.fill('input[name="password"]', testAccount.password);
		await page.click('button[type="submit"]');

		await page.click("nav >> text=Billing");

		const expectedDateText = format(nextBillingDate, "dd MMM yyyy");
		await expect(page.locator(".next-billing-date")).toContainText(
			expectedDateText
		);
		await expect(page.locator(".next-billing-date")).toContainText("28");
	});

	test("Xendit payment flow integration", async ({ page }) => {
		await page.goto("/login");
		await page.fill('input[name="email"]', testAccount.email);
		await page.fill('input[name="password"]', testAccount.password);
		await page.click('button[type="submit"]');

		await page.click("nav >> text=Billing");

		await page.click("button >> text=Bayar Sekarang");

		await page.waitForURL(/xendit|invoice/i);

		const expectedTotal = (testAccount.employees * 50000).toLocaleString(
			"id-ID"
		);
		await expect(page.locator(".invoice-amount")).toContainText(
			expectedTotal
		);

		await expect(page.locator("text=Bank Transfer")).toBeVisible();
		await expect(page.locator("text=Credit Card")).toBeVisible();
		await expect(page.locator("text=E-Wallet")).toBeVisible();

		await page.click("text=Bank Transfer");
		await page.click("button >> text=Bayar");

		await page.waitForURL(/success|thank-you/);
		await expect(page.locator(".payment-success")).toBeVisible();
	});

	test("Trial expiry leads to payment requirement", async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem(
				"trial_expiry",
				new Date(Date.now() - 86400000).toISOString()
			);
		});

		await page.goto("/login");
		await page.fill('input[name="email"]', testAccount.email);
		await page.fill('input[name="password"]', testAccount.password);
		await page.click('button[type="submit"]');

		await expect(page).toHaveURL(/payment|billing/);
		await expect(page.locator(".trial-expired-message")).toBeVisible();

		await page.goto("/dashboard");
		await expect(page).toHaveURL(/payment|billing/);
	});
});
