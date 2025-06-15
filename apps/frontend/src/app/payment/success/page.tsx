"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const formatCurrency = (value: number) => {
	return `Rp ${value.toLocaleString("id-ID")}`;
};

function PaymentSuccessContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [verificationError, setVerificationError] = useState<string | null>(
		null
	);
	const [subscriptionActivated, setSubscriptionActivated] = useState(false);

	// Get parameters from URL (these would typically be provided by Midtrans)
	const transactionId = searchParams.get("transaction_id");
	const orderId = searchParams.get("order_id");
	const amount = searchParams.get("gross_amount");
	const paymentType = searchParams.get("payment_type");

	// Get checkout session parameters for verification
	const planId = searchParams.get("planId");
	const seatPlanId = searchParams.get("seatPlanId");
	const isMonthly = searchParams.get("isMonthly");

	useEffect(() => {
		const verifyPaymentAndActivateSubscription = async () => {
			try {
				// If we have checkout session parameters, verify the payment completion
				// This is important because webhooks might be delayed
				if (planId && seatPlanId && transactionId) {
					// Call backend to verify payment status and ensure subscription is activated
					const response = await fetch(
						"/api/subscription/verify-payment",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								// Add authorization header if needed
							},
							body: JSON.stringify({
								transaction_id: transactionId,
								order_id: orderId,
								plan_id: planId,
								seat_plan_id: seatPlanId,
								is_monthly: isMonthly === "true",
							}),
						}
					);

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(
							errorData.message || "Failed to verify payment"
						);
					}

					const result = await response.json();
					setSubscriptionActivated(
						result.data?.subscription_activated || false
					);
				} else {
					// No checkout parameters, assume payment is successful
					setSubscriptionActivated(true);
				}
			} catch (error) {
				console.error("Payment verification error:", error);
				setVerificationError(
					error instanceof Error
						? error.message
						: "Failed to verify payment status"
				);
			} finally {
				// Add a delay to show loading state
				setTimeout(() => {
					setIsLoading(false);
				}, 1500);
			}
		};

		verifyPaymentAndActivateSubscription();
	}, [transactionId, orderId, planId, seatPlanId, isMonthly]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
				<div className="max-w-3xl mx-auto flex items-center justify-center min-h-96">
					<div className="text-center">
						<Loader2 className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-4" />
						<p className="text-slate-600 dark:text-slate-400">
							Verifying your payment and activating
							subscription...
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Show error if verification failed
	if (verificationError && !subscriptionActivated) {
		return (
			<div className="bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
				<div className="max-w-3xl mx-auto">
					<div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
						<div className="text-center mb-8">
							<AlertCircle className="h-16 w-16 text-orange-600 dark:text-orange-500 mx-auto mb-4" />
							<h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
								Payment Verification Issue
							</h1>
							<p className="text-slate-600 dark:text-slate-400">
								Your payment was processed, but we&apos;re still
								verifying the subscription activation
							</p>
						</div>

						<div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800 mb-6">
							<h3 className="font-semibold text-orange-800 dark:text-orange-400 mb-2">
								What&apos;s happening?
							</h3>
							<p className="text-sm text-orange-700 dark:text-orange-400 mb-4">
								{verificationError}
							</p>
							<ul className="space-y-2 text-sm text-orange-700 dark:text-orange-400">
								<li className="flex items-start space-x-2">
									<div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
									<span>
										Your payment has been processed
										successfully
									</span>
								</li>
								<li className="flex items-start space-x-2">
									<div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
									<span>
										We&apos;re working to activate your
										subscription
									</span>
								</li>
								<li className="flex items-start space-x-2">
									<div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
									<span>
										This usually takes a few minutes
									</span>
								</li>
							</ul>
						</div>

						<div className="space-y-4">
							<Button
								size="lg"
								className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white text-base py-3"
								onClick={() => window.location.reload()}
							>
								Check Again
							</Button>

							<Button
								variant="outline"
								size="lg"
								className="w-full dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-800"
								asChild
							>
								<Link href="/subscription">
									View Subscription Status
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
			<div className="max-w-3xl mx-auto">
				<div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
					<div className="text-center mb-8">
						<CheckCircle className="h-16 w-16 text-green-600 dark:text-green-500 mx-auto mb-4" />
						<h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
							Payment Successful!
						</h1>
						<p className="text-slate-600 dark:text-slate-400">
							{subscriptionActivated
								? "Your subscription has been activated successfully"
								: "Your payment was processed and subscription is being activated"}
						</p>
					</div>

					{/* Payment Details */}
					<div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border mb-6">
						<h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">
							Payment Details
						</h2>
						<div className="space-y-3">
							{transactionId && (
								<div className="flex justify-between text-sm">
									<span className="text-slate-600 dark:text-slate-400">
										Transaction ID:
									</span>
									<span className="font-medium text-slate-700 dark:text-slate-200 font-mono">
										{transactionId}
									</span>
								</div>
							)}
							{orderId && (
								<div className="flex justify-between text-sm">
									<span className="text-slate-600 dark:text-slate-400">
										Order ID:
									</span>
									<span className="font-medium text-slate-700 dark:text-slate-200 font-mono">
										{orderId}
									</span>
								</div>
							)}
							{paymentType && (
								<div className="flex justify-between text-sm">
									<span className="text-slate-600 dark:text-slate-400">
										Payment Method:
									</span>
									<span className="font-medium text-slate-700 dark:text-slate-200 capitalize">
										{paymentType.replace("_", " ")}
									</span>
								</div>
							)}
							{amount && (
								<div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-slate-700 pt-3">
									<span className="text-slate-800 dark:text-slate-100">
										Amount Paid:
									</span>
									<span className="text-green-600 dark:text-green-500">
										{formatCurrency(parseInt(amount))}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Success Message */}
					<div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800 mb-6">
						<h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
							What happens next?
						</h3>
						<ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
							<li className="flex items-start space-x-2">
								<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
								<span>
									{subscriptionActivated
										? "Your subscription is now active"
										: "Your subscription will be activated shortly"}
								</span>
							</li>
							<li className="flex items-start space-x-2">
								<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
								<span>
									You can access all premium features
									{subscriptionActivated
										? " immediately"
										: " once activation is complete"}
								</span>
							</li>
							<li className="flex items-start space-x-2">
								<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
								<span>
									A receipt has been sent to your email
								</span>
							</li>
						</ul>
					</div>

					{/* Action Buttons */}
					<div className="space-y-4">
						<Button
							size="lg"
							className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white text-base py-3"
							asChild
						>
							<Link href="/dashboard">
								Go to Dashboard
								<ArrowRight className="h-4 w-4 ml-2" />
							</Link>
						</Button>

						<Button
							variant="outline"
							size="lg"
							className="w-full dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-800"
							asChild
						>
							<Link href="/subscription">
								View Subscription Details
							</Link>
						</Button>
					</div>

					{/* Support Notice */}
					<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
						<p className="text-sm text-blue-800 dark:text-blue-400">
							<span className="font-medium">Need help?</span> If
							you have any questions about your subscription or
							need assistance, please contact our support team.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function PaymentSuccessPage() {
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
			<PaymentSuccessContent />
		</Suspense>
	);
}
