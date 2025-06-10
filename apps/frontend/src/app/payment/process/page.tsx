"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, Loader2, CreditCard } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useInitiatePaidCheckout } from "@/api/mutations/subscription.mutation";
import { toast } from "sonner";

const formatCurrency = (value: number) => {
	return `Rp ${value.toLocaleString("id-ID")}`;
};

function PaymentProcessContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	const [paymentError, setPaymentError] = useState<string | null>(null);

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
		setIsProcessingPayment(true);
		setPaymentError(null);

		try {
			const checkoutSession = await initiatePaidCheckoutMutation.mutateAsync(
				{
					subscription_plan_id: parseInt(planId),
					seat_plan_id: parseInt(seatPlanId),
					is_monthly: isMonthly,
				}
			);

			// Here you would integrate with Midtrans Snap
			// For now, we'll show a placeholder
			toast.success("Payment initiated! Redirecting to Midtrans...");

			// TODO: Replace with actual Midtrans Snap integration
			// window.snap.pay(checkoutSession.snap_token, {
			//   onSuccess: (result) => router.push('/payment/success'),
			//   onPending: (result) => router.push('/payment/pending'),
			//   onError: (result) => router.push('/payment/failed'),
			//   onClose: () => setIsProcessingPayment(false)
			// });
		} catch (error) {
			console.error("Payment initiation error:", error);
			setPaymentError(
				(error as any)?.response?.data?.message ||
					"Failed to initiate payment. Please try again."
			);
			toast.error("Payment initiation failed");
		} finally {
			setIsProcessingPayment(false);
		}
	};

	return (
		<div className="bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
			<div className="max-w-3xl mx-auto">
				<div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
					<div className="text-center mb-8">
						<CreditCard className="h-12 w-12 text-green-600 dark:text-green-500 mx-auto mb-4" />
						<h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
							Complete Your Payment
						</h1>
						<p className="text-slate-600 dark:text-slate-400">
							You're about to complete your subscription payment
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

					{/* Payment Actions */}
					<div className="space-y-4">
						<Button
							size="lg"
							className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white text-base py-3"
							onClick={handleInitiatePayment}
							disabled={
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
							) : (
								"Pay Now"
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
							<span className="font-medium">Secure Payment:</span>{" "}
							Your payment is processed securely through Midtrans.
							We never store your payment information.
						</p>
					</div>
				</div>
			</div>
		</div>
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
