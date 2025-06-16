"use client";

import { useSearchParams } from "next/navigation";

import { FeatureGuard } from "@/components/subscription/FeatureGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FEATURE_CODES } from "@/const/features";

import AttendanceOverviewTab from "./_tabsContent/AttendanceOverviewTab";
import LeaveRequestTab from "./_tabsContent/LeaveRequestTab";

const AttendancePage = () => {
	const searchParams = useSearchParams();
	const view = searchParams.get("view");

	const defaultTab = view === "permit" ? "permit" : "attendance-overview";

	return (
		<div className="p-0">
			<FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
				<div>
					<Tabs defaultValue={defaultTab} className="w-full mb-6">
						{/* Tabs List */}
						<TabsList className="mb-4 flex flex-wrap sm:flex-nowrap justify-start w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm p-2 h-[auto] sm:min-h-16 gap-1 sm:gap-2">
							<TabsTrigger
								value="attendance-overview"
								className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-md focus:outline-none data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors duration-150 ease-in-out min-w-[180px] sm:max-w-[220px] whitespace-nowrap text-center"
							>
								Attendance Overview
							</TabsTrigger>
							<TabsTrigger
								value="permit"
								className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-md focus:outline-none data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors duration-150 ease-in-out min-w-[180px] sm:max-w-[220px] whitespace-nowrap text-center"
							>
								Leave Requests
							</TabsTrigger>
						</TabsList>

						{/* Tabs Content */}
						<TabsContent value="attendance-overview">
							<AttendanceOverviewTab />
						</TabsContent>
						<TabsContent value="permit">
							<LeaveRequestTab />
						</TabsContent>
					</Tabs>
				</div>
			</FeatureGuard>
		</div>
	);
};

export default AttendancePage;
