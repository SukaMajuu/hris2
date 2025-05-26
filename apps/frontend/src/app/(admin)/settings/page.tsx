"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SettingsPage() {
	const currentPackageName = "Premium Plan";
	const currentSeatTierDescription = "51 - 100 employee";

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
						<div>
							<h3 className="text-lg font-semibold text-foreground mb-1">
								Current Package
							</h3>
							<p className="text-2xl font-semibold text-foreground mb-2">
								{currentPackageName}
							</p>
							<p className="text-sm text-muted-foreground mb-3">
								This package determines the features available
								to your organization.
							</p>
							<Link href="/settings/subscription">
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
								{currentSeatTierDescription}
							</p>
							<p className="text-sm text-muted-foreground mb-3">
								Your billing adjusts based on the number of
								employees in this tier.
							</p>
							<Link href="/settings/subscription?view=seat">
								<Button
									variant="outline"
									className="dark:text-foreground dark:border-slate-700 dark:hover:bg-slate-800"
								>
									Manage Seat Tier
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
