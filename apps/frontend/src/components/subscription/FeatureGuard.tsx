"use client";

import React from "react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { type FeatureCode } from "@/const/features";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Lock, Zap, Mail } from "lucide-react";
import Link from "next/link";

interface FeatureGuardProps {
	children: React.ReactNode;
	feature: FeatureCode;
	fallback?: React.ReactNode;
	showUpgradePrompt?: boolean;
}

interface UpgradePromptProps {
	featureName: string;
	currentPlan?: string;
	isAdmin: boolean;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ featureName, currentPlan, isAdmin }) => {
	return (
		<Card className="border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
			<CardContent className="p-6 text-center">
				<div className="flex flex-col items-center gap-4">
					<div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full">
						<Lock className="w-8 h-8 text-white" />
					</div>

					<div className="space-y-2">
						<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
							Feature Locked
						</h3>
						<p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
							<strong>{featureName}</strong> is not available in your current{" "}
							{currentPlan && (
								<span className="font-medium capitalize">{currentPlan}</span>
							)} plan.
							{!isAdmin && " Contact your administrator to upgrade your plan."}
						</p>
					</div>

					{isAdmin ? (
						<div className="flex flex-col sm:flex-row gap-3">
							<Link href="/subscription">
								<Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
									<Zap className="w-4 h-4 mr-2" />
									Upgrade Plan
								</Button>
							</Link>
							<Link href="/subscription">
								<Button variant="outline" className="text-slate-600 dark:text-slate-300">
									View All Plans
								</Button>
							</Link>
						</div>
					) : (
						<div className="flex flex-col sm:flex-row gap-3">
							<Button
								variant="outline"
								className="text-slate-600 dark:text-slate-300"
								onClick={() => {
									// You could implement a contact admin feature here
									alert("Please contact your administrator to upgrade your plan.");
								}}
							>
								<Mail className="w-4 h-4 mr-2" />
								Contact Admin
							</Button>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

const getFeatureName = (featureCode: FeatureCode): string => {
	const featureNames: Record<FeatureCode, string> = {
		admin_dashboard: "Admin Dashboard",
		employee_dashboard: "Employee Dashboard",
		employee_management: "Employee Management",
		document_employee_management: "Document Management",
		check_clock_settings: "Check-Clock Settings",
		check_clock_system: "Check-Clock System",
	};

	return featureNames[featureCode] || featureCode;
};

export function FeatureGuard({
	children,
	feature,
	fallback,
	showUpgradePrompt = true
}: FeatureGuardProps) {
	const { hasFeature } = useFeatureAccess();
	const { getCurrentPlanType } = useFeatureAccess();
	const { isLoading, isAdmin } = useSubscriptionStatus();

	// Show loading state while checking subscription
	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	// If user has access to the feature, render children
	if (hasFeature(feature)) {
		return <>{children}</>;
	}

	// If custom fallback is provided, use it
	if (fallback) {
		return <>{fallback}</>;
	}

	// Show upgrade prompt by default
	if (showUpgradePrompt) {
		return (
			<UpgradePrompt
				featureName={getFeatureName(feature)}
				currentPlan={getCurrentPlanType() || undefined}
				isAdmin={isAdmin}
			/>
		);
	}

	// Return null if no upgrade prompt should be shown
	return null;
}

// Convenience wrapper for multiple features (all must be available)
interface MultiFeatureGuardProps {
	children: React.ReactNode;
	features: FeatureCode[];
	fallback?: React.ReactNode;
	showUpgradePrompt?: boolean;
}

export function MultiFeatureGuard({
	children,
	features,
	fallback,
	showUpgradePrompt = true
}: MultiFeatureGuardProps) {
	const { hasFeatures } = useFeatureAccess();
	const { getCurrentPlanType } = useFeatureAccess();
	const { isLoading, isAdmin } = useSubscriptionStatus();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (hasFeatures(features)) {
		return <>{children}</>;
	}

	if (fallback) {
		return <>{fallback}</>;
	}

	if (showUpgradePrompt) {
		const featureNames = features.map(getFeatureName).join(", ");
		return (
			<UpgradePrompt
				featureName={featureNames}
				currentPlan={getCurrentPlanType() || undefined}
				isAdmin={isAdmin}
			/>
		);
	}

	return null;
}
