"use client";

import { Clock, Star, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserSubscription } from "@/types/subscription.types";

interface TrialConversionBannerProps {
	userSubscription: UserSubscription;
}

const TrialConversionBanner = ({
	userSubscription,
}: TrialConversionBannerProps) => {
	const router = useRouter();

	if (!userSubscription.is_in_trial) {
		return null;
	}

	const remainingDays = userSubscription.remaining_trial_days || 0;
	const isTrialExpiring = remainingDays <= 3;

	const handleConvertTrial = () => {
		// Redirect to checkout with current plan and seat plan for conversion
		if (userSubscription.subscription_plan && userSubscription.seat_plan) {
			const params = new URLSearchParams({
				planId: userSubscription.subscription_plan.id.toString(),
				seatPlanId: userSubscription.seat_plan.id.toString(),
				isMonthly: "true", // Default to monthly
				trial_conversion: "true",
			});

			router.push(`/subscription/checkout?${params.toString()}`);
		} else {
			// If no current plan/seat, redirect to subscription selection
			router.push("/subscription");
		}
	};

	const handleChooseDifferentPlan = () => {
		// Redirect to subscription page for plan selection
		router.push("/subscription");
	};

	return (
		<Card
			className={`mb-6 border-2 ${
				isTrialExpiring
					? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
					: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20"
			}`}
		>
			<CardContent>
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Badge
								variant={
									isTrialExpiring
										? "destructive"
										: "secondary"
								}
								className="text-xs"
							>
								<Clock className="h-3 w-3 mr-1" />
								Trial Active
							</Badge>
							<span
								className={`text-sm font-medium ${
									isTrialExpiring
										? "text-red-700 dark:text-red-300"
										: "text-blue-700 dark:text-blue-300"
								}`}
							>
								{remainingDays} days remaining
							</span>
						</div>

						<div>
							<h3
								className={`text-lg font-semibold ${
									isTrialExpiring
										? "text-red-900 dark:text-red-100"
										: "text-blue-900 dark:text-blue-100"
								}`}
							>
								{isTrialExpiring
									? "Trial Ending Soon!"
									: "You're on a Free Trial"}
							</h3>
							<p
								className={`text-sm ${
									isTrialExpiring
										? "text-red-700 dark:text-red-300"
										: "text-blue-700 dark:text-blue-300"
								}`}
							>
								{isTrialExpiring
									? "Convert now to avoid service interruption"
									: "Upgrade to a paid plan to continue using all features after your trial ends"}
							</p>
						</div>

						<div className="flex items-center gap-4 pt-2">
							<div className="text-xs text-slate-600 dark:text-slate-400">
								Current Plan:{" "}
								<span className="font-medium">
									{userSubscription.subscription_plan?.name}
								</span>
							</div>
							<div className="text-xs text-slate-600 dark:text-slate-400">
								Seat Plan:{" "}
								<span className="font-medium">
									{userSubscription.seat_plan?.min_employees}-
									{userSubscription.seat_plan?.max_employees}{" "}
									employees
								</span>
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Button
							onClick={handleConvertTrial}
							className={`${
								isTrialExpiring
									? "bg-red-600 hover:bg-red-700"
									: "bg-blue-600 hover:bg-blue-700"
							} text-white`}
						>
							<Star className="h-4 w-4 mr-2" />
							Convert to Paid
							<ArrowRight className="h-4 w-4 ml-2" />
						</Button>

						<Button
							variant="outline"
							size="sm"
							onClick={handleChooseDifferentPlan}
							className="text-xs"
						>
							Choose Different Plan
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default TrialConversionBanner;
