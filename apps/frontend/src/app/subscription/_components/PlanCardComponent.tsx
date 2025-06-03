import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, ArrowRightIcon } from "lucide-react";
import { SubscriptionPlan } from "@/types/subscription";

interface PlanCardComponentProps {
	plan: SubscriptionPlan;
	currentUserPlan: SubscriptionPlan | null;
	onSelectPlan: (planId: number) => void;
}

const PlanCardComponent: React.FC<PlanCardComponentProps> = ({
	plan,
	currentUserPlan,
	onSelectPlan,
}) => {
	// Ensure safe comparisons for users without subscriptions
	const isCurrentPlan = currentUserPlan?.id === plan.id;
	const isInactive = plan.is_active === false;
	const hasCurrentSubscription =
		currentUserPlan !== null && currentUserPlan !== undefined;

	const cardClasses = `
		rounded-xl p-6 flex flex-col h-full shadow-lg relative
		${
			isCurrentPlan
				? "border-2 border-primary"
				: "border border-slate-200 dark:border-slate-700"
		}
		${isInactive ? "opacity-60 bg-slate-50 dark:bg-slate-800/50" : ""}
	`;
	const textColor = `text-slate-700 dark:text-slate-300 ${
		isInactive ? "opacity-70" : ""
	}`;

	return (
		<Card className={cardClasses}>
			{isCurrentPlan && hasCurrentSubscription && (
				<div className="absolute top-3 right-3 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
					Current Package
				</div>
			)}
			{isInactive && !isCurrentPlan && (
				<div className="absolute top-3 right-3 bg-slate-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
					Not Available
				</div>
			)}
			<CardHeader className="p-0 pt-2">
				<CardTitle
					className={`text-4xl font-bold text-slate-900 dark:text-slate-100 ${
						isInactive ? "opacity-70" : ""
					}`}
				>
					{plan?.name || "Unknown Plan"}
				</CardTitle>
				<p className={`text-sm ${textColor}`}>
					{plan?.description || "No description available"}
				</p>
			</CardHeader>
			<CardContent className="p-0 flex-grow">
				<ul className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
					{plan?.features &&
					Array.isArray(plan.features) &&
					plan.features.length > 0 &&
					!isInactive ? (
						plan.features.map((feature, index) => (
							<li
								key={
									typeof feature === "object" && feature?.id
										? feature.id
										: index
								}
								className={`flex items-center justify-between gap-2 ${textColor}`}
							>
								<span>
									{typeof feature === "object" &&
									feature?.name
										? feature.name
										: typeof feature === "string"
										? feature
										: "Feature"}
								</span>
								<CheckIcon
									className={`w-4 h-4 bg-green-500 text-white rounded-full p-0.5 flex-shrink-0 ${
										isInactive ? "opacity-50" : ""
									}`}
								/>
							</li>
						))
					) : (
						<li className={`${textColor} text-center py-4`}>
							No features available
						</li>
					)}
				</ul>
			</CardContent>
			<div className="mt-6">
				<Button
					onClick={() => !isInactive && onSelectPlan(plan?.id)}
					disabled={isInactive || !plan?.id}
					className={`w-full font-semibold py-3 text-white ${
						isCurrentPlan && hasCurrentSubscription
							? "bg-primary hover:bg-primary/80"
							: isInactive
							? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
							: "bg-primary hover:bg-primary/80"
					}`}
				>
					{isInactive
						? "Not Available Right Now"
						: isCurrentPlan && hasCurrentSubscription
						? "Configure Seats"
						: "Select a Package"}
					{!isInactive && <ArrowRightIcon className="ml-2 w-4 h-4" />}
				</Button>
			</div>
		</Card>
	);
};

export default PlanCardComponent;
