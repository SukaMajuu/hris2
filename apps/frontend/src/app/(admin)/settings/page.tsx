"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SettingsPage() {
	return (
		<div className="container mx-auto p-4 py-8 md:p-8">
			<header className="mb-2">
				<h1 className="text-3xl mb-1 font-bold tracking-tight text-foreground">
					Settings
				</h1>
				<p className="text-muted-foreground">
					Manage your account settings and preferences.
				</p>
			</header>

			{/* Subscription Section */}
			<section className="mb-12">
				<div className="grid md:grid-cols-3 gap-6 py-8">
					<div className="md:col-span-1">
						<h2 className="text-xl font-semibold text-foreground mb-1">
							Subscription Plan
						</h2>
						<p className="text-sm text-muted-foreground">
							Each organization has its own subscription plan,
							billing cycle, payment methods and usage quotas.
						</p>
					</div>
					<div className="md:col-span-2 space-y-4">
						<div>
							<h3 className={`text-2xl font-semibold mb-2`}>
								Premium
							</h3>
							<Link href="/settings/subscription">
								<Button
									variant="outline"
									className="dark:text-foreground dark:border-slate-700 dark:hover:bg-slate-800"
								>
									Change subscription plan
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>
			<section className="mb-12">
				<div className="grid md:grid-cols-3 gap-6 py-8">
					<div className="md:col-span-1">
						<h2 className="text-xl font-semibold text-foreground mb-1"></h2>
					</div>
				</div>
			</section>
		</div>
	);
}
