import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";

interface StatCardProps {
	label: string;
	value: string | number;
	icon?: React.ReactNode;
	trend?: {
		value: number;
		label: string;
	};
	description?: string;
}

export function StatCard({
	label,
	value,
	icon,
	trend,
	description,
}: StatCardProps) {
	const getTrendIcon = () => {
		if (!trend) return null;

		if (trend.value > 0) {
			return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
		} else if (trend.value < 0) {
			return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
		} else {
			return <MinusIcon className="h-4 w-4 text-gray-500" />;
		}
	};

	return (
		<Card className="border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div className="text-sm font-medium text-gray-500">
						{label}
					</div>
					{icon && <div className="text-gray-400">{icon}</div>}
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col">
					<CardTitle className="text-2xl font-bold">
						{value}
					</CardTitle>

					{trend && (
						<div className="flex items-center gap-1 text-sm mt-1">
							{getTrendIcon()}
							<span
								className={
									trend.value > 0
										? "text-green-500"
										: trend.value < 0
										? "text-red-500"
										: "text-gray-500"
								}
							>
								{Math.abs(trend.value)}% {trend.label}
							</span>
						</div>
					)}

					{description && (
						<p className="text-xs text-gray-500 mt-2">
							{description}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
