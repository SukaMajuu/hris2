import { Page } from "@playwright/test";

export async function mockXenditPayment(page: Page) {
	await page.route("**/xendit*.js", (route) => {
		route.fulfill({
			status: 200,
			body:
				'window.Xendit = { setPublishableKey: () => {}, card: { createToken: (card, callback) => callback(null, { id: "mock_token" }) } };',
			headers: { "Content-Type": "application/javascript" },
		});
	});

	await page.route("**/api/payments/create", (route) => {
		route.fulfill({
			status: 200,
			body: JSON.stringify({
				success: true,
				invoice_url: "https://mock-xendit.example/invoice/mock-id",
				invoice_id: "mock-invoice-id",
			}),
			headers: { "Content-Type": "application/json" },
		});
	});

	await page.route("**/api/payments/callback", (route) => {
		route.fulfill({
			status: 200,
			body: JSON.stringify({
				success: true,
				status: "PAID",
				payment_id: "mock-payment-id",
			}),
			headers: { "Content-Type": "application/json" },
		});
	});
}
