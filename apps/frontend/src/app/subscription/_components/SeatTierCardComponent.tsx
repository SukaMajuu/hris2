import {
	ArrowRightIcon,
	ArrowUpIcon,
	ArrowDownIcon,
	Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { useSubscriptionUpgrade } from "@/hooks/useSubscriptionUpgrade";
import { UserSubscription } from "@/types/subscription.types";
import { formatCurrency } from "@/utils/currency";

export interface SeatTier {
	id: number;
	packageName: string;
	employeeRangeDescription: string;
	planId: number;
	sizeTierName: string;
	pricePerMonth: number;
	pricePerYear: number;
}

interface SeatTierCardComponentProps {
	tier: SeatTier;
	isCurrentTier: boolean;
	userSubscription?: UserSubscription | null;
	onSelectSeatTier: (planId: number, seatPlanId: number) => void;
}

const SeatTierCardComponent: React.FC<SeatTierCardComponentProps> = ({
	tier,
	isCurrentTier,
	userSubscription,
	onSelectSeatTier,
}) => {
	const router = useRouter();
	const { isLoading: isUpgrading } = useSubscriptionUpgrade();

	const [isInDowngradeContext, setIsInDowngradeContext] = React.useState(
		false
	);
	const [targetDowngradePlan, setTargetDowngradePlan] = React.useState<{
		planId: number;
		planName: string;
		isDowngrade: boolean;
	} | null>(null);

	React.useEffect(() => {
		const stored = sessionStorage.getItem("targetDowngradePlan");
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				setTargetDowngradePlan(parsed);
				setIsInDowngradeContext(true);
			} catch (error) {
				console.error("Failed to parse downgrade context:", error);
			}
		}
	}, []);

	const currentSeatPlan = userSubscription?.seat_plan;
	const hasActiveSubscription =
		userSubscription?.status === "active" ||
		userSubscription?.status === "trial";
	const canUpgradeDowngrade =
		hasActiveSubscription && currentSeatPlan && !isCurrentTier;

	// Check if this is an equivalent tier for an upgrade (same employee range)
	const isEquivalentTier =
		hasActiveSubscription &&
		currentSeatPlan &&
		userSubscription?.subscription_plan?.id !== tier.planId &&
		currentSeatPlan.min_employees ===
			parseInt(
				tier.employeeRangeDescription.match(/(\d+)-/)?.[1] || "0",
				10
			) &&
		currentSeatPlan.max_employees ===
			parseInt(
				tier.employeeRangeDescription.match(/-(\d+)/)?.[1] || "0",
				10
			);

	let isUpgrade = false;
	let isDowngrade = false;

	if (isInDowngradeContext && !isCurrentTier) {
		// This is intentionally empty - we're in downgrade context but not current tier
	} else if (canUpgradeDowngrade && currentSeatPlan) {
		const currentCapacity = currentSeatPlan.max_employees;

		const tierDescription = tier.employeeRangeDescription.toLowerCase();
		const tierCapacityMatch = tierDescription.match(/(\d+)-(\d+)/);

		let tierMaxCapacity = 0;
		if (tierCapacityMatch && tierCapacityMatch[2]) {
			tierMaxCapacity = parseInt(tierCapacityMatch[2], 10);
		} else {
			const allNumbers = tierDescription.match(/\d+/g);
			if (allNumbers && allNumbers.length > 0) {
				tierMaxCapacity = Math.max(
					...allNumbers.map((n) => parseInt(n, 10))
				);
			}
		}

		const currentSeatPlanId = currentSeatPlan.id;
		const targetSeatPlanId = tier.id;

		if (tierMaxCapacity > currentCapacity) {
			isUpgrade = true;
		} else if (tierMaxCapacity < currentCapacity) {
			isDowngrade = true;
		} else if (tierMaxCapacity === currentCapacity) {
			isUpgrade = targetSeatPlanId > currentSeatPlanId;
			isDowngrade = targetSeatPlanId < currentSeatPlanId;
		}
	}

	const handleSeatChange = async () => {
		if (isInDowngradeContext && targetDowngradePlan) {
			const params = new URLSearchParams({
				planId: targetDowngradePlan.planId.toString(),
				seatPlanId: tier.id.toString(),
				isMonthly: "true",
				upgrade: "true",
			});

			sessionStorage.removeItem("targetDowngradePlan");

			router.push(`/subscription/checkout?${params.toString()}`);
		} else if (
			hasActiveSubscription &&
			userSubscription?.subscription_plan?.id !== tier.planId
		) {
			// Plan change - redirect to checkout
			const params = new URLSearchParams({
				planId: tier.planId.toString(),
				seatPlanId: tier.id.toString(),
				isMonthly: "true",
				upgrade: "true",
			});

			router.push(`/subscription/checkout?${params.toString()}`);
		} else if (canUpgradeDowngrade && (isUpgrade || isDowngrade)) {
			// Seat tier change within same plan - redirect to checkout for preview and payment
			const params = new URLSearchParams({
				planId:
					userSubscription?.subscription_plan?.id?.toString() ||
					tier.planId.toString(),
				seatPlanId: tier.id.toString(),
				isMonthly: "true",
				upgrade: isUpgrade ? "true" : "false", // Set upgrade flag based on whether it's an upgrade or downgrade
			});

			router.push(`/subscription/checkout?${params.toString()}`);
		} else {
			onSelectSeatTier(tier.planId, tier.id);
		}
	};

	const getButtonText = () => {
		if (isCurrentTier) return "Current Tier";
		if (isEquivalentTier) return "Select Recommended";
		if (isInDowngradeContext) return "Select Tier";
		if (isUpgrade) return "Upgrade Seats";
		if (isDowngrade) return "Downgrade Seats";
		return "Select Tier";
	};

	const getButtonIcon = () => {
		if (isCurrentTier) return <Settings className="ml-1.5 w-4 h-4" />;
		if (isInDowngradeContext)
			return <ArrowRightIcon className="ml-1.5 w-4 h-4" />;
		if (isUpgrade) return <ArrowUpIcon className="ml-1.5 w-4 h-4" />;
		if (isDowngrade) return <ArrowDownIcon className="ml-1.5 w-4 h-4" />;
		return null;
	};

	const getButtonColor = () => {
		if (isCurrentTier)
			return "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
		if (isEquivalentTier) return "bg-blue-600 hover:bg-blue-700 text-white";
		if (isInDowngradeContext)
			return "bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white";
		if (isUpgrade) return "bg-green-600 hover:bg-green-700 text-white";
		if (isDowngrade) return "bg-orange-600 hover:bg-orange-700 text-white";
		return "bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white";
	};

	return (
		<Card
			className={`
				w-full min-w-80 rounded-lg p-6 flex flex-col h-full shadow-md bg-slate-50 dark:bg-slate-800
				border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-primary relative
			`}
		>
			{isCurrentTier && (
				<div className="absolute top-3 right-3 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
					Current Tier
				</div>
			)}
			{isEquivalentTier && !isCurrentTier && (
				<div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
					Recommended
				</div>
			)}
			{isInDowngradeContext && !isCurrentTier && !isEquivalentTier && (
				<div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
					Select Option
				</div>
			)}
			{!isInDowngradeContext &&
				!isEquivalentTier &&
				isUpgrade &&
				!isCurrentTier && (
					<div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
						Upgrade
					</div>
				)}
			{!isInDowngradeContext &&
				!isEquivalentTier &&
				isDowngrade &&
				!isCurrentTier && (
					<div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
						Downgrade
					</div>
				)}
			<CardHeader className="p-0 mb-3 pt-2">
				<p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
					{tier.packageName} Plan
				</p>
				<p className="text-lg font-medium text-slate-700 dark:text-slate-200 mt-2">
					{tier.employeeRangeDescription}
				</p>
				<div className="mt-2 space-y-1">
					<p className="text-sm text-slate-600 dark:text-slate-400">
						Monthly: {formatCurrency(tier.pricePerMonth)}
					</p>
					<p className="text-sm text-slate-600 dark:text-slate-400">
						Yearly: {formatCurrency(tier.pricePerYear)}
					</p>
				</div>
			</CardHeader>
			<div className="mt-auto">
				<Button
					onClick={handleSeatChange}
					className={`w-full font-semibold py-2.5 text-sm ${getButtonColor()}`}
					disabled={isCurrentTier || isUpgrading}
				>
					{isUpgrading ? "Processing..." : getButtonText()}
					{!isCurrentTier &&
						!isUpgrading &&
						!isEquivalentTier &&
						getButtonIcon()}
				</Button>
			</div>
		</Card>
	);
};

export default SeatTierCardComponent;
