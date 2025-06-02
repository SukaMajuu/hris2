"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUserSubscription } from "@/api/queries/subscription.queries";
import { Loader2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
	const { data: userSubscription, isLoading, error } = useUserSubscription();

	// Helper function to format employee range description
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

	return (
		<div className="container mx-auto p-4 py-8 md:p-8">
			<header className="mb-8">
				<h1 className="text-3xl mb-1 font-bold tracking-tight text-foreground">
					Settings
				</h1>
				<p className="text-muted-foreground">
					Manage your account settings and preferences.
				</p>
			</header>

			{/* Subscription Section */}
			<section className="mb-12 border-t border-border pt-8">
				<div className="grid md:grid-cols-3 gap-8">
					<div className="md:col-span-1">
						<h2 className="text-xl font-semibold text-foreground mb-1">
							Subscription Details
						</h2>
						<p className="text-sm text-muted-foreground">
							Review and manage your current feature package and
							employee seat tier.
						</p>
					</div>
					<div className="md:col-span-2 space-y-8">
						{isLoading ? (
							<div className="flex items-center space-x-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span className="text-muted-foreground">
									Loading subscription details...
								</span>
							</div>
						) : error ? (
							<div className="flex items-center space-x-2">
								<AlertCircle className="h-4 w-4 text-red-500" />
								<span className="text-red-600 dark:text-red-400">
									Failed to load subscription details
								</span>
							</div>
						) : (
							<>
								<div>
									<h3 className="text-lg font-semibold text-foreground mb-1">
										Current Package
									</h3>
									<div className="flex items-center gap-2 mb-2">
										<p className="text-2xl font-semibold text-foreground">
											{userSubscription?.subscription_plan
												?.name || "No Package Selected"}
										</p>
										{userSubscription?.status && (
											<span
												className={`px-2 py-1 text-xs font-medium rounded-full ${
													userSubscription.status ===
													"active"
														? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
														: userSubscription.status ===
														  "trial"
														? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
														: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
												}`}
											>
												{getSubscriptionStatusDisplay()}
											</span>
										)}
									</div>
									<p className="text-sm text-muted-foreground mb-3">
										{userSubscription?.subscription_plan
											?.description ||
											"This package determines the features available to your organization."}
									</p>
									{userSubscription?.subscription_plan
										?.features &&
										userSubscription.subscription_plan
											.features.length > 0 && (
											<div className="mb-3">
												<p className="text-sm font-medium text-foreground mb-2">
													Available Features:
												</p>
												<ul className="text-xs text-muted-foreground space-y-1">
													{userSubscription.subscription_plan.features
														.slice(0, 3)
														.map((feature) => (
															<li
																key={feature.id}
															>
																• {feature.name}
															</li>
														))}
													{userSubscription
														.subscription_plan
														.features.length >
														3 && (
														<li>
															• And{" "}
															{userSubscription
																.subscription_plan
																.features
																.length -
																3}{" "}
															more...
														</li>
													)}
												</ul>
											</div>
										)}
									<Link href="/subscription">
										<Button
											variant="outline"
											className="dark:text-foreground dark:border-slate-700 dark:hover:bg-slate-800"
										>
											Change Package
										</Button>
									</Link>
								</div>
								<div>
									<h3 className="text-lg font-semibold text-foreground mb-1">
										Current Seat Tier
									</h3>
									<p className="text-2xl font-semibold text-foreground mb-2">
										{getEmployeeRangeDescription()}
									</p>
									<div className="text-sm text-muted-foreground mb-3 space-y-1">
										<p>
											Your billing adjusts based on the
											number of employees in this tier.
										</p>
										{userSubscription?.current_employee_count !==
											undefined && (
											<p>
												Current employees:{" "}
												<span className="font-medium">
													{
														userSubscription.current_employee_count
													}
												</span>
												{userSubscription.max_employee_count && (
													<>
														{" "}
														/{" "}
														{
															userSubscription.max_employee_count
														}
													</>
												)}
											</p>
										)}
									</div>
									<Link href="/subscription?view=seat">
										<Button
											variant="outline"
											className="dark:text-foreground dark:border-slate-700 dark:hover:bg-slate-800"
										>
											Manage Seat Tier
										</Button>
									</Link>
								</div>
							</>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}
