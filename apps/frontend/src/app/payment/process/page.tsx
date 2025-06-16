"use client";

import { AlertCircle, Loader2, CreditCard } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";
import React, { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { useInitiatePaidCheckout } from "@/api/mutations/subscription.mutation";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency";

// Define proper types for Midtrans
interface MidtransResult {
	transaction_id?: string;
	order_id?: string;
	gross_amount?: string;
	payment_type?: string;
	va_number?: string;
	bank?: string;
	status_code?: string;
	status_message?: string;
}

interface MidtransCallbacks {
	onSuccess?: (result: MidtransResult) => void;
	onPending?: (result: MidtransResult) => void;
	onError?: (result: MidtransResult) => void;
	onClose?: () => void;
}

interface CheckoutResponse {
	invoice?: {
		id: string;
	};
}

// Declare Midtrans Snap interface
declare global {
	interface Window {
		snap: {
			pay: (token: string, callbacks: MidtransCallbacks) => void;
		};
	}
}

const PaymentProcessContent = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	const [paymentError, setPaymentError] = useState<string | null>(null);
	const [snapScriptLoaded, setSnapScriptLoaded] = useState(false);
	const [
		checkoutResponse,
		setCheckoutResponse,
	] = useState<CheckoutResponse | null>(null);
	const [initializationAttempted, setInitializationAttempted] = useState(
		false
	);

	// Get parameters from URL
	const planId = searchParams.get("planId");
	const seatPlanId = searchParams.get("seatPlanId");
	const isMonthly = searchParams.get("isMonthly") === "true";
	const amount = searchParams.get("amount");
	const isUpgrade = searchParams.get("upgrade") === "true";
	const isTrialConversion = searchParams.get("trial_conversion") === "true";

	const initiatePaidCheckoutMutation = useInitiatePaidCheckout();

	// Initialize payment checkout on component mount
	useEffect(() => {
		// Only run if we have valid parameters
		if (!planId || !seatPlanId || !amount) return;

		const initializePayment = async () => {
			if (checkoutResponse) return; // Already initialized

			try {
				setIsProcessingPayment(true);
				setPaymentError(null);

				const response = await initiatePaidCheckoutMutation.mutateAsync(
					{
						subscription_plan_id: parseInt(planId, 10),
						seat_plan_id: parseInt(seatPlanId, 10),
						is_monthly: isMonthly,
					}
				);

				setCheckoutResponse(response);
			} catch (error) {
				console.error("Payment initialization error:", error);
				setPaymentError(
					error && typeof error === "object" && "response" in error
						? (error as {
								response?: { data?: { message?: string } };
						  }).response?.data?.message ||
								"Failed to initialize payment. Please try again."
						: "Failed to initialize payment. Please try again."
				);
			} finally {
				setIsProcessingPayment(false);
			}
		};

		if (!checkoutResponse && !initializationAttempted) {
			setInitializationAttempted(true);
			initializePayment();
		}
	}, [
		planId,
		seatPlanId,
		isMonthly,
		amount,
		checkoutResponse,
		initializationAttempted,
		initiatePaidCheckoutMutation,
	]);

	// Validation - now after all hooks
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

		if (!checkoutResponse?.invoice?.id) {
			toast.error(
				"Payment token not available. Please refresh and try again."
			);
			return;
		}

		setIsProcessingPayment(true);
		setPaymentError(null);

		try {
			const snapToken = checkoutResponse.invoice.id;

			// Construct success URL with all necessary parameters
			const successParams = new URLSearchParams({
				planId,
				seatPlanId,
				isMonthly: isMonthly.toString(),
				amount,
			});

			if (isUpgrade) successParams.set("upgrade", "true");
			if (isTrialConversion)
				successParams.set("trial_conversion", "true");

			// Initialize Midtrans Snap payment
			window.snap.pay(snapToken, {
				onSuccess: (result: MidtransResult) => {
					toast.success("Payment successful!");

					// Redirect with all payment details and checkout context
					const finalParams = new URLSearchParams(successParams);
					finalParams.set(
						"transaction_id",
						result.transaction_id || ""
					);
					finalParams.set("order_id", result.order_id || "");
					finalParams.set(
						"gross_amount",
						result.gross_amount || amount
					);
					finalParams.set("payment_type", result.payment_type || "");

					router.push(`/payment/success?${finalParams.toString()}`);
				},
				onPending: (result: MidtransResult) => {
					toast.info("Payment is being processed...");

					// Redirect with payment details and checkout context
					const finalParams = new URLSearchParams(successParams);
					finalParams.set(
						"transaction_id",
						result.transaction_id || ""
					);
					finalParams.set("order_id", result.order_id || "");
					finalParams.set(
						"gross_amount",
						result.gross_amount || amount
					);
					finalParams.set("payment_type", result.payment_type || "");
					finalParams.set("va_number", result.va_number || "");
					finalParams.set("bank", result.bank || "");

					router.push(`/payment/pending?${finalParams.toString()}`);
				},
				onError: (result: MidtransResult) => {
					toast.error("Payment failed. Please try again.");

					// Redirect with error details and checkout context for retry
					const finalParams = new URLSearchParams(successParams);
					finalParams.set(
						"transaction_id",
						result.transaction_id || ""
					);
					finalParams.set("order_id", result.order_id || "");
					finalParams.set("status_code", result.status_code || "");
					finalParams.set(
						"status_message",
						result.status_message || ""
					);

					router.push(`/payment/failed?${finalParams.toString()}`);
				},
				onClose: () => {
					setIsProcessingPayment(false);
				},
			});
		} catch (error) {
			console.error("Payment popup error:", error);
			setPaymentError("Failed to open payment popup. Please try again.");
			toast.error("Payment popup failed to open");
			setIsProcessingPayment(false);
		}
	};

	const getPageTitle = () => {
		if (isTrialConversion) return "Complete Trial Conversion Payment";
		if (isUpgrade) return "Complete Subscription Change Payment";
		return "Complete Your Payment";
	};

	const getPageDescription = () => {
		if (isTrialConversion)
			return "Complete payment to convert your trial to a paid subscription";
		if (isUpgrade)
			return "Complete payment to apply your subscription changes";
		return "You're about to complete your subscription payment";
	};

	const getPaymentButtonText = () => {
		if (isProcessingPayment) {
			return (
				<>
					<Loader2 className="h-4 w-4 animate-spin mr-2" />
					Processing Payment...
				</>
			);
		}
		if (!snapScriptLoaded) {
			return "Loading Payment System...";
		}
		return "Pay with Midtrans";
	};

	return (
		<>
			{/* Load Midtrans Snap Script only if using Midtrans */}
			<Script
				src="https://app.sandbox.midtrans.com/snap/snap.js"
				data-client-key={
					process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
					"SB-Mid-client-YOUR_CLIENT_KEY"
				}
				onLoad={() => {
					setSnapScriptLoaded(true);
				}}
				onError={(e) => {
					console.error("Failed to load Midtrans Snap script:", e);
					setPaymentError(
						"Failed to load payment system. Please refresh the page."
					);
					toast.error("Failed to load payment system");
				}}
			/>

			<div className="bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
				<div className="max-w-3xl mx-auto">
					<div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
						<div className="text-center mb-8">
							<CreditCard className="h-12 w-12 text-green-600 dark:text-green-500 mx-auto mb-4" />
							<h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
								{getPageTitle()}
							</h1>
							<p className="text-slate-600 dark:text-slate-400">
								{getPageDescription()}
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
								{(isUpgrade || isTrialConversion) && (
									<div className="flex justify-between text-sm">
										<span className="text-slate-600 dark:text-slate-400">
											Type:
										</span>
										<span className="font-medium text-slate-700 dark:text-slate-200">
											{isTrialConversion
												? "Trial Conversion"
												: "Subscription Change"}
										</span>
									</div>
								)}
								<div className="flex justify-between text-lg font-bold">
									<span className="text-slate-800 dark:text-slate-100">
										Total Amount:
									</span>
									<span className="text-slate-800 dark:text-slate-100">
										{formatCurrency(parseInt(amount, 10))}
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

						{/* Initialization Loading */}
						{!checkoutResponse && isProcessingPayment && (
							<div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
								<div className="flex items-center space-x-2">
									<Loader2 className="h-4 w-4 animate-spin text-blue-600" />
									<p className="text-sm text-blue-800 dark:text-blue-400">
										Initializing payment system...
									</p>
								</div>
							</div>
						)}

						{/* Loading Snap Script for Midtrans */}
						{!snapScriptLoaded && (
							<div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
								<div className="flex items-center space-x-2">
									<Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
									<p className="text-sm text-yellow-800 dark:text-yellow-400">
										Loading Midtrans payment system...
									</p>
								</div>
							</div>
						)}

						{/* Payment Actions */}
						<div className="space-y-4">
							{checkoutResponse && (
								<Button
									size="lg"
									className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white text-base py-3"
									onClick={handleInitiatePayment}
									disabled={
										!snapScriptLoaded || isProcessingPayment
									}
								>
									{getPaymentButtonText()}
								</Button>
							)}

							<Button
								variant="outline"
								size="lg"
								className="w-full dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-800"
								asChild
							>
								<Link
									href={`/subscription/checkout?planId=${planId}&seatPlanId=${seatPlanId}${
										isUpgrade ? "&upgrade=true" : ""
									}${
										isTrialConversion
											? "&trial_conversion=true"
											: ""
									}`}
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
};

const PaymentProcessPage = () => (
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

export default PaymentProcessPage;
