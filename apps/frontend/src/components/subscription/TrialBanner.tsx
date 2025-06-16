"use client";

import { Clock, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

import { useUserSubscription } from "@/api/queries/subscription.queries";
import { Button } from "@/components/ui/button";


export const TrialBanner = () => {
	const { data: userSubscription } = useUserSubscription();

	// Only show banner for trial users
	if (!userSubscription || userSubscription.status !== "trial") {
		return null;
	}

	const remainingDays = userSubscription.remaining_trial_days || 0;
	const planName = userSubscription.subscription_plan?.name || "Premium";

	// Determine banner style based on remaining days
	const getBannerStyle = () => {
		if (remainingDays <= 3) {
			return {
				bg:
					"bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950",
				border: "border-red-200 dark:border-red-800",
				icon: "text-red-500",
				text: "text-red-800 dark:text-red-200",
				button: "bg-red-600 hover:bg-red-700",
			};
		} if (remainingDays <= 7) {
			return {
				bg:
					"bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950",
				border: "border-orange-200 dark:border-orange-800",
				icon: "text-orange-500",
				text: "text-orange-800 dark:text-orange-200",
				button: "bg-orange-600 hover:bg-orange-700",
			};
		} 
			return {
				bg:
					"bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950",
				border: "border-blue-200 dark:border-blue-800",
				icon: "text-blue-500",
				text: "text-blue-800 dark:text-blue-200",
				button: "bg-blue-600 hover:bg-blue-700",
			};
		
	};

	const style = getBannerStyle();

	const getUrgencyMessage = () => {
		if (remainingDays <= 1) {
			return "Your trial expires today! Upgrade now to continue using premium features.";
		} if (remainingDays <= 3) {
			return `Only ${remainingDays} days left in your trial. Upgrade now to avoid interruption.`;
		} if (remainingDays <= 7) {
			return `${remainingDays} days remaining in your trial. Upgrade anytime to continue.`;
		} 
			return `You're currently on a ${remainingDays}-day free trial of ${planName}. Enjoy full access!`;
		
	};

	return (
		<div
			className={`trial-banner relative overflow-hidden rounded-lg border ${style.bg} ${style.border} p-4 shadow-sm`}
		>
			{/* Background decoration */}
			<div className="absolute top-0 right-0 opacity-10">
				<Zap className="h-24 w-24" />
			</div>

			<div className="relative flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<div className={`flex-shrink-0 ${style.icon}`}>
						<Clock className="h-6 w-6" />
					</div>
					<div>
						<div className="flex items-center space-x-2 mb-1">
							<h3 className={`font-semibold ${style.text}`}>
								{remainingDays <= 3
									? "⚡ Trial Ending Soon!"
									: "🚀 Free Trial Active"}
							</h3>
							<span
								className={`px-2 py-1 text-xs font-medium rounded-full bg-white/50 ${style.text}`}
							>
								{remainingDays}{" "}
								{remainingDays === 1 ? "day" : "days"} left
							</span>
						</div>
						<p className={`text-sm ${style.text}`}>
							{getUrgencyMessage()}
						</p>
						{remainingDays > 7 && (
							<p
								className={`text-xs mt-1 ${style.text} opacity-75`}
							>
								🎉 All premium features included • No credit
								card required yet
							</p>
						)}
					</div>
				</div>

				<div className="flex items-center space-x-3">
					{remainingDays <= 7 && (
						<Link href="/subscription">
							<Button
								size="sm"
								className={`${style.button} text-white shadow-md hover:shadow-lg transition-all duration-200`}
							>
								<Zap className="h-4 w-4 mr-1" />
								Upgrade Now
								<ArrowRight className="h-4 w-4 ml-1" />
							</Button>
						</Link>
					)}
					{remainingDays > 7 && (
						<Link href="/subscription">
							<Button
								variant="outline"
								size="sm"
								className={`border-white/20 ${style.text} hover:bg-white/10`}
							>
								View Plans
								<ArrowRight className="h-4 w-4 ml-1" />
							</Button>
						</Link>
					)}
				</div>
			</div>

			{/* Trial expiry date display */}
			{userSubscription.trial_end_date && (
				<div
					className={`mt-3 pt-3 border-t border-white/20 text-xs ${style.text} opacity-75 trial-expiry-date`}
				>
					Trial expires on:{" "}
					{new Date(
						userSubscription.trial_end_date
					).toLocaleDateString("en-US", {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</div>
			)}
		</div>
	);
}
