"use client";

import { Clock, Loader2, Copy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency";

const PaymentPendingContent = () => {
	const searchParams = useSearchParams();
	const [copiedField, setCopiedField] = useState<string | null>(null);

	// Get parameters from URL (these would typically be provided by Midtrans)
	const transactionId = searchParams.get("transaction_id");
	const amount = searchParams.get("gross_amount");
	const paymentType = searchParams.get("payment_type");
	const vaNumber = searchParams.get("va_number");
	const bank = searchParams.get("bank");

	// Get payment parameters for retry functionality
	const planId = searchParams.get("planId");
	const seatPlanId = searchParams.get("seatPlanId");
	const isMonthly = searchParams.get("isMonthly");
	const retryAmount = searchParams.get("amount") || amount; // Use amount from payment params or gross_amount

	// Construct retry URL if we have the necessary parameters
	const getRetryUrl = () => {
		if (planId && seatPlanId && retryAmount) {
			return `/payment/process?planId=${planId}&seatPlanId=${seatPlanId}&isMonthly=${isMonthly}&amount=${retryAmount}`;
		}
		return "/subscription/checkout";
	};

	const copyToClipboard = async (text: string, fieldName: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedField(fieldName);
			toast.success(`${fieldName} copied to clipboard`);
			setTimeout(() => setCopiedField(null), 2000);
		} catch (error) {
			toast.error(`Failed to copy to clipboard: ${error}`);
		}
	};

	const getPaymentInstructions = (type: string | null) => {
		switch (type?.toLowerCase()) {
			case "bank_transfer":
			case "bca_va":
			case "bni_va":
			case "bri_va":
			case "permata_va":
				return {
					title: "Bank Transfer Instructions",
					steps: [
						"Log in to your mobile banking or visit the nearest ATM",
						"Select 'Transfer to Other Bank' or 'Virtual Account'",
						"Enter the virtual account number provided above",
						"Enter the exact amount to be paid",
						"Confirm the transaction details",
						"Complete the payment",
					],
				};
			case "indomaret":
				return {
					title: "Indomaret Payment Instructions",
					steps: [
						"Visit the nearest Indomaret store",
						"Tell the cashier you want to pay using the payment code",
						"Provide the payment code above",
						"Pay the exact amount",
						"Keep your receipt as proof of payment",
					],
				};
			case "alfamart":
				return {
					title: "Alfamart Payment Instructions",
					steps: [
						"Visit the nearest Alfamart store",
						"Tell the cashier you want to pay using the payment code",
						"Provide the payment code above",
						"Pay the exact amount",
						"Keep your receipt as proof of payment",
					],
				};
			default:
				return {
					title: "Payment Instructions",
					steps: [
						"Complete your payment using the provided details",
						"Keep your transaction receipt",
						"Your subscription will be activated after payment verification",
					],
				};
		}
	};

	const instructions = getPaymentInstructions(paymentType);

	return (
		<div className="bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
			<div className="max-w-3xl mx-auto">
				<div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
					<div className="text-center mb-8">
						<Clock className="h-16 w-16 text-orange-600 dark:text-orange-500 mx-auto mb-4" />
						<h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
							Payment Pending
						</h1>
						<p className="text-slate-600 dark:text-slate-400">
							Please complete your payment using the details below
						</p>
					</div>

					{/* Payment Details */}
					<div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800 mb-6">
						<h2 className="text-xl font-semibold text-orange-800 dark:text-orange-400 mb-4">
							Payment Details
						</h2>
						<div className="space-y-3">
							{amount && (
								<div className="flex justify-between text-lg font-bold">
									<span className="text-orange-800 dark:text-orange-300">
										Amount to Pay:
									</span>
									<span className="text-orange-800 dark:text-orange-300">
										{formatCurrency(parseInt(amount, 10))}
									</span>
								</div>
							)}
							{bank && (
								<div className="flex justify-between items-center text-sm">
									<span className="text-orange-700 dark:text-orange-400">
										Bank:
									</span>
									<span className="font-medium text-orange-800 dark:text-orange-300 uppercase">
										{bank}
									</span>
								</div>
							)}
							{vaNumber && (
								<div className="flex justify-between items-center text-sm">
									<span className="text-orange-700 dark:text-orange-400">
										Virtual Account:
									</span>
									<div className="flex items-center space-x-2">
										<span className="font-medium text-orange-800 dark:text-orange-300 font-mono">
											{vaNumber}
										</span>
										<button
											type="button"
											onClick={() =>
												copyToClipboard(
													vaNumber,
													"Virtual Account Number"
												)
											}
											className="p-1 hover:bg-orange-200 dark:hover:bg-orange-800 rounded transition-colors"
										>
											{copiedField ===
											"Virtual Account Number" ? (
												<CheckCircle2 className="h-4 w-4 text-green-600" />
											) : (
												<Copy className="h-4 w-4 text-orange-600" />
											)}
										</button>
									</div>
								</div>
							)}
							{paymentType && (
								<div className="flex justify-between text-sm">
									<span className="text-orange-700 dark:text-orange-400">
										Payment Method:
									</span>
									<span className="font-medium text-orange-800 dark:text-orange-300 capitalize">
										{paymentType.replace("_", " ")}
									</span>
								</div>
							)}
							{transactionId && (
								<div className="flex justify-between items-center text-sm border-t border-orange-200 dark:border-orange-700 pt-3">
									<span className="text-orange-700 dark:text-orange-400">
										Transaction ID:
									</span>
									<div className="flex items-center space-x-2">
										<span className="font-medium text-orange-800 dark:text-orange-300 font-mono">
											{transactionId}
										</span>
										<button
											type="button"
											onClick={() =>
												copyToClipboard(
													transactionId,
													"Transaction ID"
												)
											}
											className="p-1 hover:bg-orange-200 dark:hover:bg-orange-800 rounded transition-colors"
										>
											{copiedField ===
											"Transaction ID" ? (
												<CheckCircle2 className="h-4 w-4 text-green-600" />
											) : (
												<Copy className="h-4 w-4 text-orange-600" />
											)}
										</button>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Payment Instructions */}
					<div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border mb-6">
						<h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">
							{instructions.title}
						</h3>
						<ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
							{instructions.steps.map((step, index) => (
								<li
									key={`step-${index + 1}-${step
										.slice(0, 20)
										.replace(/\s+/g, "-")
										.toLowerCase()}`}
									className="flex items-start space-x-3"
								>
									<span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
										{index + 1}
									</span>
									<span>{step}</span>
								</li>
							))}
						</ol>
					</div>

					{/* Important Notice */}
					<div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
						<h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
							Important Information
						</h3>
						<ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
							<li className="flex items-start space-x-2">
								<div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
								<span>
									Payment must be completed within 24 hours
								</span>
							</li>
							<li className="flex items-start space-x-2">
								<div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
								<span>
									Your subscription will be activated
									automatically after payment verification
								</span>
							</li>
							<li className="flex items-start space-x-2">
								<div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
								<span>
									You will receive a confirmation email once
									payment is processed
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
								I&apos;ve Completed Payment
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
									View Subscription
								</Link>
							</Button>

							<Button
								variant="outline"
								size="lg"
								className="dark:text-slate-400 dark:border-slate-600 dark:hover:bg-slate-800"
								asChild
							>
								<Link href={getRetryUrl()}>
									Try Different Method
								</Link>
							</Button>
						</div>
					</div>

					{/* Support Notice */}
					<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
						<p className="text-sm text-blue-800 dark:text-blue-400">
							<span className="font-medium">Need help?</span> If
							you have any questions about the payment process or
							need assistance, please contact our support team.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

const PaymentPendingPage = () => (
	<Suspense
		fallback={
			<div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
				<div className="max-w-3xl mx-auto flex items-center justify-center min-h-96">
					<Loader2 className="h-8 w-8 animate-spin text-slate-600" />
				</div>
			</div>
		}
	>
		<PaymentPendingContent />
	</Suspense>
);

export default PaymentPendingPage;
