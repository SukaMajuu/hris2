"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useUserSubscription } from "@/api/queries/subscription.queries";
import { useEmployeeStatsQuery } from "@/api/queries/employee.queries";
import {
	Loader2,
	AlertCircle,
	Settings,
	Package,
	Users,
	Crown,
	CheckCircle,
	Clock,
	XCircle,
	Pause,
	Calendar,
	ArrowRight,
	TrendingUp,
} from "lucide-react";

export default function SettingsPage() {
	const { data: userSubscription, isLoading, error } = useUserSubscription();
	const {
		data: employeeStats,
		isLoading: isLoadingStats,
	} = useEmployeeStatsQuery();

	const getEmployeeRangeDescription = () => {
		if (!userSubscription?.seat_plan) {
			return "No seat tier selected";
		}

		const { min_employees, max_employees } = userSubscription.seat_plan;
		return `${min_employees} - ${max_employees} employees`;
	};

	// Helper function to get subscription status display
	const getSubscriptionStatusDisplay = () => {
		if (!userSubscription) return "No subscription";

		const status = userSubscription.status;
		switch (status) {
			case "trial":
				return "Trial";
			case "active":
				return "Active";
			case "inactive":
				return "Inactive";
			case "suspended":
				return "Suspended";
			case "expired":
				return "Expired";
			case "cancelled":
				return "Cancelled";
			default:
				return status;
		}
	};

	// Get status icon and color
	const getStatusIcon = (): React.ReactElement => {
		if (!userSubscription)
			return <XCircle className="h-4 w-4 text-gray-600" />;

		const status = userSubscription.status;
		switch (status) {
			case "active":
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case "trial":
				return <Clock className="h-4 w-4 text-blue-600" />;
			case "suspended":
				return <Pause className="h-4 w-4 text-yellow-600" />;
			case "expired":
			case "cancelled":
				return <XCircle className="h-4 w-4 text-red-600" />;
			default:
				return <AlertCircle className="h-4 w-4 text-gray-600" />;
		}
	};

	const getBadgeVariant = (
		status: string
	): "default" | "secondary" | "outline" | "destructive" => {
		switch (status) {
			case "active":
				return "default";
			case "trial":
				return "secondary";
			case "suspended":
				return "outline";
			case "expired":
			case "cancelled":
				return "destructive";
			default:
				return "outline";
		}
	};

	// Get the current employee count from employee stats
	const currentEmployeeCount = employeeStats?.total_employees || 0;
	const maxEmployees = userSubscription?.seat_plan?.max_employees || 0;
	const usagePercentage =
		maxEmployees > 0
			? Math.min((currentEmployeeCount / maxEmployees) * 100, 100)
			: 0;

	return (
		<div className="flex flex-col gap-6">
			{/* Header Section */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground">
						Settings
					</h1>
					<p className="text-muted-foreground mt-1">
						Manage your account settings and preferences
					</p>
				</div>
				<div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
					<Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
				</div>
			</div>

			{(!!isLoading || !!isLoadingStats) && (
				<Card className="border border-gray-100 dark:border-gray-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-center space-x-2">
							<Loader2 className="h-5 w-5 animate-spin text-blue-600" />
							<span className="text-muted-foreground">
								Loading subscription details...
							</span>
						</div>
					</CardContent>
				</Card>
			)}

			{!!error && !isLoading && (
				<Card className="border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
					<CardContent className="p-6">
						<div className="flex items-center space-x-2">
							<AlertCircle className="h-5 w-5 text-red-500" />
							<span className="text-red-600 dark:text-red-400">
								Failed to load subscription details
							</span>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Subscription Overview Cards */}
			{!isLoading && !isLoadingStats && !error && (
				<div className="grid gap-6 md:grid-cols-2">
					{/* Current Package Card */}
					<Card className="border border-gray-100 transition-shadow hover:shadow-md dark:border-gray-800">
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-lg">
								<div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
									<Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
								</div>
								Current Package
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-2xl font-bold text-foreground">
										{userSubscription?.subscription_plan
											?.name || "No Package Selected"}
									</h3>
									<p className="text-sm text-muted-foreground">
										{userSubscription?.subscription_plan
											?.description ||
											"This package determines the features available to your organization."}
									</p>
								</div>
								<div className="flex items-center gap-2">
									{getStatusIcon()}
									<Badge
										variant={getBadgeVariant(
											userSubscription?.status || ""
										)}
									>
										{getSubscriptionStatusDisplay()}
									</Badge>
								</div>
							</div>

							{userSubscription?.subscription_plan?.features &&
								userSubscription.subscription_plan.features
									.length > 0 && (
									<div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
										<p className="mb-2 text-sm font-medium text-foreground">
											Available Features:
										</p>
										<ul className="space-y-1 text-xs text-muted-foreground">
											{userSubscription.subscription_plan.features
												.slice(0, 3)
												.map((feature) => (
													<li
														key={feature.id}
														className="flex items-center gap-2"
													>
														<CheckCircle className="h-3 w-3 text-green-500" />
														{feature.name}
													</li>
												))}
											{userSubscription.subscription_plan
												.features.length > 3 && (
												<li className="flex items-center gap-2">
													<Crown className="h-3 w-3 text-yellow-500" />
													And{" "}
													{userSubscription
														.subscription_plan
														.features.length -
														3}{" "}
													more features...
												</li>
											)}
										</ul>
									</div>
								)}

							<Link href="/subscription">
								<Button className="w-full" variant="outline">
									<Package className="mr-2 h-4 w-4" />
									Change Package
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
						</CardContent>
					</Card>

					{/* Current Seat Tier Card */}
					<Card className="border border-gray-100 transition-shadow hover:shadow-md dark:border-gray-800">
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-lg">
								<div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
									<Users className="h-5 w-5 text-green-600 dark:text-green-400" />
								</div>
								Current Seat Tier
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 flex-1 flex justify-between flex-col">
							<div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
								<div className="mb-6">
									<h3 className="text-2xl font-bold text-foreground">
										{getEmployeeRangeDescription()}
									</h3>
									<p className="text-sm text-muted-foreground">
										Your billing adjusts based on the number
										of employees in this tier.
									</p>
								</div>
								<div className="mb-2 flex items-center justify-between">
									<span className="text-sm font-medium text-foreground">
										Employee Usage
									</span>
									<span className="text-sm text-muted-foreground">
										{currentEmployeeCount} /{" "}
										{maxEmployees || "∞"}
									</span>
								</div>

								{maxEmployees > 0 && (
									<>
										<div className="mb-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
											<div
												className={`h-2 rounded-full transition-all duration-300 ${
													usagePercentage >= 90
														? "bg-red-500"
														: usagePercentage >= 70
														? "bg-yellow-500"
														: "bg-green-500"
												}`}
												style={{
													width: `${usagePercentage}%`,
												}}
											></div>
										</div>
										<div className="flex items-center justify-between text-xs text-muted-foreground">
											<span>
												{usagePercentage.toFixed(1)}%
												used
											</span>
											<span>
												{Math.max(
													0,
													maxEmployees -
														currentEmployeeCount
												)}{" "}
												remaining
											</span>
										</div>
									</>
								)}
							</div>

							<Link href="/subscription?view=seat">
								<Button className="w-full" variant="outline">
									<TrendingUp className="mr-2 h-4 w-4" />
									Manage Seat Tier
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
