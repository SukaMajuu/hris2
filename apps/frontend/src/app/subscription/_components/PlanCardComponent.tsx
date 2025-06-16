import {
	CheckIcon,
	ArrowRightIcon,
	ArrowUpIcon,
	ArrowDownIcon,
	Settings,
} from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionPlan, UserSubscription } from "@/types/subscription.types";

interface PlanCardComponentProps {
	plan: SubscriptionPlan;
	currentUserPlan: SubscriptionPlan | null;
	userSubscription?: UserSubscription | null;
	onSelectPlan: (planId: number) => void;
}

const PlanCardComponent: React.FC<PlanCardComponentProps> = ({
	plan,
	currentUserPlan,
	userSubscription,
	onSelectPlan,
}) => {
	const isCurrentPlan = currentUserPlan?.id === plan.id;
	const isInactive = plan.is_active === false;
	const hasCurrentSubscription =
		currentUserPlan !== null && currentUserPlan !== undefined;

	const isUpgrade =
		hasCurrentSubscription &&
		currentUserPlan &&
		plan.id > currentUserPlan.id;
	const isDowngrade =
		hasCurrentSubscription &&
		currentUserPlan &&
		plan.id < currentUserPlan.id;

	const getFeatureDisplayText = (feature: string | { name: string }) => {
		if (typeof feature === "object" && feature?.name) {
			return feature.name;
		}
		if (typeof feature === "string") {
			return feature;
		}
		return "Feature";
	};

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

	const handlePlanAction = () => {
		if (isInactive) return;

		if (userSubscription && isUpgrade) {
			onSelectPlan(plan.id);
		} else if (userSubscription && isDowngrade) {
			const downgradeData = {
				planId: plan.id,
				planName: plan.name,
				isDowngrade: true,
			};

			sessionStorage.setItem(
				"targetDowngradePlan",
				JSON.stringify(downgradeData)
			);

			onSelectPlan(plan.id);
		} else if (userSubscription && !isUpgrade && !isDowngrade) {
			onSelectPlan(plan.id);
		} else if (!userSubscription) {
			onSelectPlan(plan.id);
		}
	};

	const getButtonText = () => {
		if (isInactive) return "Not Available Right Now";
		if (isCurrentPlan && hasCurrentSubscription) return "Configure Seats";
		if (isUpgrade) return "Upgrade Plan";
		if (isDowngrade) return "Downgrade Plan";
		return "Select a Package";
	};

	const getButtonIcon = () => {
		if (isInactive) return null;
		if (isCurrentPlan && hasCurrentSubscription)
			return <Settings className="ml-2 w-4 h-4" />;
		if (isUpgrade) return <ArrowUpIcon className="ml-2 w-4 h-4" />;
		if (isDowngrade) return <ArrowDownIcon className="ml-2 w-4 h-4" />;
		return <ArrowRightIcon className="ml-2 w-4 h-4" />;
	};

	const getButtonColor = () => {
		if (isInactive)
			return "bg-slate-400 dark:bg-slate-600 cursor-not-allowed";
		if (isCurrentPlan && hasCurrentSubscription)
			return "bg-primary hover:bg-primary/80";
		if (isUpgrade) return "bg-green-600 hover:bg-green-700";
		if (isDowngrade) return "bg-orange-600 hover:bg-orange-700";
		return "bg-primary hover:bg-primary/80";
	};

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
			{isUpgrade && !isInactive && (
				<div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
					Upgrade
				</div>
			)}
			{isDowngrade && (
				<div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
					Downgrade
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
								<span>{getFeatureDisplayText(feature)}</span>
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
					onClick={handlePlanAction}
					disabled={isInactive || !plan?.id}
					className={`w-full font-semibold py-3 text-white ${getButtonColor()}`}
				>
					{getButtonText()}
					{getButtonIcon()}
				</Button>
			</div>
		</Card>
	);
};

export default PlanCardComponent;
