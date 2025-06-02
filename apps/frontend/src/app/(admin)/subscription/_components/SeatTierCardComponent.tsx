import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ArrowRightIcon } from "lucide-react";

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
	onSelectSeatTier: (planId: number, seatPlanId: number) => void;
}

const SeatTierCardComponent: React.FC<SeatTierCardComponentProps> = ({
	tier,
	isCurrentTier,
	onSelectSeatTier,
}) => {
	const formatCurrency = (value: number) => {
		return `Rp ${value.toLocaleString("id-ID")}`;
	};

	return (
		<Card
			className={`
				rounded-lg p-6 flex flex-col h-full shadow-md bg-slate-50 dark:bg-slate-800
				border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-primary relative
			`}
		>
			{isCurrentTier && (
				<div className="absolute top-3 right-3 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
					Current Tier
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
					onClick={() => onSelectSeatTier(tier.planId, tier.id)}
					className={`w-full font-semibold py-2.5 text-sm ${
						isCurrentTier
							? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
							: "bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white"
					}`}
					disabled={isCurrentTier}
				>
					{isCurrentTier ? "Current Tier" : "Select Tier"}
					{!isCurrentTier && (
						<ArrowRightIcon className="ml-1.5 w-4 h-4" />
					)}
				</Button>
			</div>
		</Card>
	);
};

export default SeatTierCardComponent;
