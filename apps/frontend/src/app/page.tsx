"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/landing-page/header";
import Hero from "../components/landing-page/hero";
import Features from "../components/landing-page/features";
import Benefits from "../components/landing-page/benefits";
// import Testimonials from './_component/testimoni';
import Pricing from "../components/landing-page/pricing";
import Contact from "../components/landing-page/contact";
import Footer from "../components/landing-page/footer";

const LandingPageContent: React.FC = () => {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		document.title = "HRIS";

		// Handle Midtrans callback parameters
		const orderId = searchParams.get("order_id");
		const transactionStatus = searchParams.get("transaction_status");
		const statusCode = searchParams.get("status_code");

		if (orderId && transactionStatus) {
			// Extract planId, seatPlanId, and other details from order_id if needed
			// Assuming your order_id contains this information or you can get it from your backend

			if (
				transactionStatus === "settlement" ||
				transactionStatus === "capture"
			) {
				// Payment successful
				router.push(
					`/payment/success?transaction_id=${orderId}&order_id=${orderId}&gross_amount=${
						searchParams.get("gross_amount") || ""
					}&payment_type=${searchParams.get("payment_type") || ""}`
				);
				return;
			} else if (transactionStatus === "pending") {
				// Payment pending
				router.push(
					`/payment/pending?transaction_id=${orderId}&order_id=${orderId}&gross_amount=${
						searchParams.get("gross_amount") || ""
					}&payment_type=${searchParams.get("payment_type") || ""}`
				);
				return;
			} else if (
				transactionStatus === "deny" ||
				transactionStatus === "cancel" ||
				transactionStatus === "expire" ||
				transactionStatus === "failure"
			) {
				// Payment failed
				router.push(
					`/payment/failed?transaction_id=${orderId}&order_id=${orderId}&status_code=${statusCode}&status_message=${transactionStatus}`
				);
				return;
			}
		}

		// Original smooth scroll handler
		const handler = (e: Event) => {
			e.preventDefault();
			const anchor = e.currentTarget as HTMLAnchorElement;
			const target = document.querySelector(
				anchor.getAttribute("href") || ""
			);
			if (target) {
				window.scrollTo({
					top:
						target.getBoundingClientRect().top +
						window.scrollY -
						80,
					behavior: "smooth",
				});
			}
		};
		const anchors = document.querySelectorAll('a[href^="#"]');
		anchors.forEach((anchor) => anchor.addEventListener("click", handler));
		return () => {
			anchors.forEach((anchor) =>
				anchor.removeEventListener("click", handler)
			);
		};
	}, [router, searchParams]);

	return (
		<div className="min-h-screen bg-white font-sans">
			<Header />
			<main>
				<Hero />
				<Features />
				<Benefits />
				{/* <Testimonials /> */}
				<Pricing />
				<Contact />
			</main>
			<Footer />
		</div>
	);
};

const LandingPage: React.FC = () => {
	return (
		<Suspense
			fallback={<div className="min-h-screen bg-white">Loading...</div>}
		>
			<LandingPageContent />
		</Suspense>
	);
};

export default LandingPage;
