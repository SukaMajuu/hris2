"use client";

import CheckClockEmployeeTab from "./_components/CheckClockEmployeeTab";
import CheckClockOverviewTab from "./_components/CheckClockOverviewTab";
import CheckClockApprovalTab from "./_components/CheckClockApprovalTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CheckClockPage() {
    return (
        <div className="p-0">
            <div>
                <Tabs defaultValue="check-clock-employee" className="w-full mb-6">
                    {/* Tabs List */}
                    <TabsList className="mb-2 flex justify-start w-full rounded-md bg-white min-h-16 px-3 py-2">
                        <TabsTrigger
                            value="check-clock-employee"
                            className="px-6 py-3 text-sm font-medium text-gray-700 rounded-md focus:outline-none data-[state=active]:bg-secondary data-[state=active]:text-white max-w-[200px] whitespace-nowrap"
                        >
                            Check-Clock Employee
                        </TabsTrigger>
                        <TabsTrigger
                            value="check-clock-overview"
                            className="px-6 py-3 text-sm font-medium text-gray-700 rounded-md focus:outline-none data-[state=active]:bg-secondary data-[state=active]:text-white max-w-[200px] whitespace-nowrap"
                        >
                            Check-Clock Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="check-clock-approval"
                            className="px-6 py-3 text-sm font-medium text-gray-700 rounded-md focus:outline-none data-[state=active]:bg-secondary data-[state=active]:text-white max-w-[200px] whitespace-nowrap"
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