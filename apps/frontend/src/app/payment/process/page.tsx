"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, Loader2, CreditCard } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useInitiatePaidCheckout } from "@/api/mutations/subscription.mutation";
import { toast } from "sonner";
import Script from "next/script";

// Declare Midtrans Snap interface
declare global {
	interface Window {
		snap: {
			pay: (
				token: string,
				callbacks: {
					onSuccess?: (result: any) => void;
					onPending?: (result: any) => void;
					onError?: (result: any) => void;
					onClose?: () => void;
				}
			) => void;
		};
	}
}

const formatCurrency = (value: number) => {
	return `Rp ${value.toLocaleString("id-ID")}`;
};

function PaymentProcessContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	const [paymentError, setPaymentError] = useState<string | null>(null);
	const [snapScriptLoaded, setSnapScriptLoaded] = useState(false);

	// Get parameters from URL
	const planId = searchParams.get("planId");
	const seatPlanId = searchParams.get("seatPlanId");
	const isMonthly = searchParams.get("isMonthly") === "true";
	const amount = searchParams.get("amount");

	const initiatePaidCheckoutMutation = useInitiatePaidCheckout();

	// Validation
	if (!planId || !seatPlanId || !amount) {
		return (
			<div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
				<div className="max-w-3xl mx-auto flex items-center justify-center min-h-96">
					<div className="text-center">
						<AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
						<p className="text-red-600 dark:text-red-400 mb-4">
							Invalid payment parameters. Please start from the
							checkout page.
						</p>
						<div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
							Missing: {!planId && "planId "}
							{!seatPlanId && "seatPlanId "}
							{!amount && "amount"}
						</div>
						<Link
							href="/subscription/checkout"
							className="text-blue-500 hover:underline"
						>
							Go to checkout page
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const handleInitiatePayment = async () => {
		if (!snapScriptLoaded) {
			toast.error("Payment system is loading. Please wait...");
			return;
		}

		setIsProcessingPayment(true);
		setPaymentError(null);

		try {
			const response = await initiatePaidCheckoutMutation.mutateAsync({
				subscription_plan_id: parseInt(planId),
				seat_plan_id: parseInt(seatPlanId),
				is_monthly: isMonthly,
			});

			const snapToken = response.invoice?.id; // This should be the Snap token from Midtrans

			if (!snapToken) {
				throw new Error("No payment token received from server");
			}

			// Initialize Midtrans Snap payment
			window.snap.pay(snapToken, {
				onSuccess: (result: any) => {
					console.log("Payment success:", result);
					toast.success("Payment successful!");
					router.push(
						`/payment/success?transaction_id=${result.transaction_id}&order_id=${result.order_id}&gross_amount=${result.gross_amount}&planId=${planId}&seatPlanId=${seatPlanId}&isMonthly=${isMonthly}&amount=${amount}`
					);
				},
				onPending: (result: any) => {
					console.log("Payment pending:", result);
					toast.info("Payment is being processed...");
					router.push(
						`/payment/pending?transaction_id=${result.transaction_id}&order_id=${result.order_id}&gross_amount=${result.gross_amount}&payment_type=${result.payment_type}&planId=${planId}&seatPlanId=${seatPlanId}&isMonthly=${isMonthly}&amount=${amount}`
					);
				},
				onError: (result: any) => {
					console.error("Payment error:", result);
					toast.error("Payment failed. Please try again.");
					router.push(
						`/payment/failed?transaction_id=${result.transaction_id}&order_id=${result.order_id}&status_code=${result.status_code}&status_message=${result.status_message}&planId=${planId}&seatPlanId=${seatPlanId}&isMonthly=${isMonthly}&amount=${amount}`
					);
				},
				onClose: () => {
					console.log("Payment popup closed");
					setIsProcessingPayment(false);
				},
			});
		} catch (error) {
			console.error("Payment initiation error:", error);
			setPaymentError(
				(error as any)?.response?.data?.message ||
					"Failed to initiate payment. Please try again."
			);
			toast.error("Payment initiation failed");
			setIsProcessingPayment(false);
		}
	};

	return (
		<>
			{/* Load Midtrans Snap Script */}
			<Script
				src="https://app.sandbox.midtrans.com/snap/snap.js"
				data-client-key={
					process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
					"SB-Mid-client-YOUR_CLIENT_KEY"
				}
				onLoad={() => {
					setSnapScriptLoaded(true);
					console.log("Midtrans Snap script loaded");
				}}
				onError={() => {
					console.error("Failed to load Midtrans Snap script");
					toast.error("Failed to load payment system");
				}}
			/>

			<div className="bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
				<div className="max-w-3xl mx-auto">
					<div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
						<div className="text-center mb-8">
							<CreditCard className="h-12 w-12 text-green-600 dark:text-green-500 mx-auto mb-4" />
							<h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
								Complete Your Payment
							</h1>
							<p className="text-slate-600 dark:text-slate-400">
								You're about to complete your subscription
								payment
							</p>
						</div>

						{/* Payment Summary */}
						<div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border mb-6">
							<h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">
								Payment Summary
							</h2>
							<div className="space-y-3">
								<div className="flex justify-between text-sm">
									<span className="text-slate-600 dark:text-slate-400">
										Billing Period:
									</span>
									<span className="font-medium text-slate-700 dark:text-slate-200">
										{isMonthly ? "Monthly" : "Yearly"}
									</span>
								</div>
								<div className="flex justify-between text-lg font-bold">
									<span className="text-slate-800 dark:text-slate-100">
										Total Amount:
									</span>
									<span className="text-slate-800 dark:text-slate-100">
										{formatCurrency(parseInt(amount))}
									</span>
								</div>
							</div>
						</div>

						{/* Payment Error */}
						{paymentError && (
							<div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
								<div className="flex items-start space-x-2">
									<AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
									<div>
										<h3 className="font-medium text-red-800 dark:text-red-400">
											Payment Error
										</h3>
										<p className="text-sm text-red-600 dark:text-red-400 mt-1">
											{paymentError}
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Loading Snap Script */}
						{!snapScriptLoaded && (
							<div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
								<div className="flex items-center space-x-2">
									<Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
									<p className="text-sm text-yellow-800 dark:text-yellow-400">
										Loading payment system...
									</p>
								</div>
							</div>
						)}

						{/* Payment Actions */}
						<div className="space-y-4">
							<Button
								size="lg"
								className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white text-base py-3"
								onClick={handleInitiatePayment}
								disabled={
									!snapScriptLoaded ||
									isProcessingPayment ||
									initiatePaidCheckoutMutation.isPending
								}
							>
								{isProcessingPayment ||
								initiatePaidCheckoutMutation.isPending ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Processing Payment...
									</>
								) : !snapScriptLoaded ? (
									"Loading Payment System..."
								) : (
									"Pay with Midtrans"
								)}
							</Button>

							<Button
								variant="outline"
								size="lg"
								className="w-full dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-800"
								asChild
							>
								<Link
									href={`/subscription/checkout?planId=${planId}&seatPlanId=${seatPlanId}`}
								>
									Back to Checkout
								</Link>
							</Button>
						</div>

						{/* Security Notice */}
						<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
							<p className="text-sm text-blue-800 dark:text-blue-400">
								<span className="font-medium">
									Secure Payment:
								</span>{" "}
								Your payment is processed securely through
								Midtrans. We never store your payment
								information.
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default function PaymentProcessPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
					<div className="max-w-3xl mx-auto flex items-center justify-center min-h-96">
						<Loader2 className="h-8 w-8 animate-spin text-slate-600" />
					</div>
				</div>
			}
		>
			<PaymentProcessContent />
		</Suspense>
	);
}
