"use client";

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { XCircle, Loader2, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

const formatCurrency = (value: number) => {
	return `Rp ${value.toLocaleString("id-ID")}`;
};

function PaymentFailedContent() {
	const searchParams = useSearchParams();

	// Get parameters from URL (these would typically be provided by Midtrans)
	const transactionId = searchParams.get("transaction_id");
	const orderId = searchParams.get("order_id");
	const amount = searchParams.get("gross_amount");
	const statusCode = searchParams.get("status_code");
	const statusMessage = searchParams.get("status_message");

	// Get payment parameters for retry functionality
	const planId = searchParams.get("planId");
	const seatPlanId = searchParams.get("seatPlanId");
	const isMonthly = searchParams.get("isMonthly");
	const retryAmount = searchParams.get("amount") || amount; // Use amount from payment params or gross_amount

	// Common failure reasons
	const getFailureReason = (code: string | null) => {
		const reasons: { [key: string]: string } = {
			"200": "Transaction successful", // Should not happen in failed page
			"201": "Transaction pending",
			"202": "Transaction denied by bank",
			"400": "Invalid transaction request",
			"401": "Access denied - invalid credentials",
			"404": "Transaction not found",
			"407": "Transaction expired",
			"408": "Transaction cancelled by user",
		};
		return reasons[code || ""] || "Payment processing failed";
	};

	// Construct retry URL if we have the necessary parameters
	const getRetryUrl = () => {
		if (planId && seatPlanId && retryAmount) {
			return `/payment/process?planId=${planId}&seatPlanId=${seatPlanId}&isMonthly=${isMonthly}&amount=${retryAmount}`;
		}
		return "/subscription/checkout";
	};

	return (
		<div className="bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
			<div className="max-w-3xl mx-auto">
				<div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
					<div className="text-center mb-8">
						<XCircle className="h-16 w-16 text-red-600 dark:text-red-500 mx-auto mb-4" />
						<h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
							Payment Failed
						</h1>
						<p className="text-slate-600 dark:text-slate-400">
							We couldn&apos;t process your payment at this time
						</p>
					</div>

					{/* Error Details */}
					<div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 mb-6">
						<h2 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-4">
							Error Details
						</h2>
						<div className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-red-700 dark:text-red-400">
									Reason:
								</span>
								<span className="font-medium text-red-800 dark:text-red-300">
									{statusMessage ||
										getFailureReason(statusCode)}
								</span>
							</div>
							{transactionId && (
								<div className="flex justify-between text-sm">
									<span className="text-red-700 dark:text-red-400">
										Transaction ID:
									</span>
									<span className="font-medium text-red-800 dark:text-red-300 font-mono">
										{transactionId}
									</span>
								</div>
							)}
							{orderId && (
								<div className="flex justify-between text-sm">
									<span className="text-red-700 dark:text-red-400">
										Order ID:
									</span>
									<span className="font-medium text-red-800 dark:text-red-300 font-mono">
										{orderId}
									</span>
								</div>
							)}
							{statusCode && (
								<div className="flex justify-between text-sm">
									<span className="text-red-700 dark:text-red-400">
										Status Code:
									</span>
									<span className="font-medium text-red-800 dark:text-red-300">
										{statusCode}
									</span>
								</div>
							)}
							{amount && (
								<div className="flex justify-between text-lg font-bold border-t border-red-200 dark:border-red-700 pt-3">
									<span className="text-red-800 dark:text-red-300">
										Amount:
									</span>
									<span className="text-red-800 dark:text-red-300">
										{formatCurrency(parseInt(amount))}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Troubleshooting Tips */}
					<div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border mb-6">
						<h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
							What you can do:
						</h3>
						<ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
							<li className="flex items-start space-x-2">
								<div className="w-2 h-2 bg-slate-500 rounded-full mt-2 flex-shrink-0"></div>
								<span>
									Check your internet connection and try again
								</span>
							</li>
							<li className="flex items-start space-x-2">
								<div className="w-2 h-2 bg-slate-500 rounded-full mt-2 flex-shrink-0"></div>
								<span>
									Verify your payment method details are
									correct
								</span>
							</li>
							<li className="flex items-start space-x-2">
								<div className="w-2 h-2 bg-slate-500 rounded-full mt-2 flex-shrink-0"></div>
								<span>
									Ensure you have sufficient funds in your
									account
								</span>
							</li>
							<li className="flex items-start space-x-2">
								<div className="w-2 h-2 bg-slate-500 rounded-full mt-2 flex-shrink-0"></div>
								<span>
									Contact your bank if the issue persists
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
							<Link href={getRetryUrl()}>
								<RefreshCw className="h-4 w-4 mr-2" />
								Try Again
							</Link>
						</Button>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Button
								variant="outline"
								size="lg"
								className="dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-800"
								asChild
							>
								<Link href="/subscription">
									Choose Different Plan
								</Link>
							</Button>

							<Button
								variant="outline"
								size="lg"
								className="dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-800"
								asChild
							>
								<Link href="/dashboard">Back to Dashboard</Link>
							</Button>
						</div>
					</div>

					{/* Support Notice */}
					<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
						<p className="text-sm text-blue-800 dark:text-blue-400">
							<span className="font-medium">Need help?</span> If
							you continue to experience issues, please contact
							our support team with the transaction details above.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function PaymentFailedPage() {
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
			<PaymentFailedContent />
		</Suspense>
	);
}
