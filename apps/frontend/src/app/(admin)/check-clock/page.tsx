"use client";

import CheckClockEmployeeTab from "./_tabsContent/CheckClockEmployeeTab";
import CheckClockOverviewTab from "./_tabsContent/CheckClockOverviewTab";
import CheckClockApprovalTab from "./_tabsContent/CheckClockApprovalTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeatureGuard } from "@/components/subscription/FeatureGuard";
import { FEATURE_CODES } from "@/const/features";

function CheckClockContent() {
	return (
		<div className="p-0">
			<div>
				<Tabs
					defaultValue="check-clock-employee"
					className="w-full mb-6"
				>
					{/* Tabs List */}
					<TabsList className="mb-4 flex flex-wrap sm:flex-nowrap justify-start w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm p-2 h-[auto] sm:min-h-16 gap-1 sm:gap-2">
						<TabsTrigger
							value="check-clock-employee"
							className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-md focus:outline-none data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors duration-150 ease-in-out min-w-[180px] sm:max-w-[220px] whitespace-nowrap text-center"
						>
							Check-Clock Employee
						</TabsTrigger>
						<TabsTrigger
							value="check-clock-overview"
							className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-md focus:outline-none data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors duration-150 ease-in-out min-w-[180px] sm:max-w-[220px] whitespace-nowrap text-center"
						>
							Check-Clock Overview
						</TabsTrigger>
						<TabsTrigger
							value="check-clock-approval"
							className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-md focus:outline-none data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors duration-150 ease-in-out min-w-[180px] sm:max-w-[220px] whitespace-nowrap text-center"
						>
							Check-Clock Approval
						</TabsTrigger>
					</TabsList>

					{/* Tabs Content */}
					<TabsContent value="check-clock-employee">
						<CheckClockEmployeeTab />
					</TabsContent>
					<TabsContent value="check-clock-overview">
						<CheckClockOverviewTab />
					</TabsContent>
					<TabsContent value="check-clock-approval">
						<CheckClockApprovalTab />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

export default function CheckClockPage() {
	return (
		<FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
			<CheckClockContent />
		</FeatureGuard>
	);
}
