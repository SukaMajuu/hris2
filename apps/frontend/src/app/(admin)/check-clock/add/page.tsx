"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

export default function AddCheckclockPage() {
    const router = useRouter();

    const handleSave = () => {
        // Add your save logic here
        
        // Show success toast
        toast({
        title: "Success",
        description: "Add CheckClock successfully",
        duration: 2000,
        });

        // Redirect after toast
        setTimeout(() => {
        router.push("/check-clock");
        }, 2000);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold bg-[#6B9AC4] text-white p-4 rounded-lg">
                        Add Checkclock
                    </CardTitle>
                </CardHeader>
            </Card> 

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <Card>
                    <CardContent className="p-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Employee</label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="employee1">John Doe</SelectItem>
                                        <SelectItem value="employee2">Jane Smith</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Work Schedule</label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Work Schedule Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="regular">Regular</SelectItem>
                                        <SelectItem value="shift">Shift</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Working Hours</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Check-in</label>
                                        <Input type="text" placeholder="07:00 - 08:00" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Check-out</label>
                                        <Input type="text" placeholder="17:00 - 18:00" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Break Start</label>
                                <Input type="text" placeholder="12:00 - 13:00" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Work Type</label>
                                <Input type="text" value="WFO (Work From Office)" readOnly />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column */}
                <Card>
                    <CardContent className="p-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Location</label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="location1">Office Location 1</SelectItem>
                                        <SelectItem value="location2">Office Location 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Address Details</label>
                                <Input 
                                    type="text"
                                    value="Kota Malang, Jawa Timur"
                                    readOnly
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Lat</label>
                                    <Input placeholder="Lat Location" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Long</label>
                                    <Input placeholder="Long Location" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
                <Button variant="destructive" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button variant="default" onClick={handleSave}>
                    Save
                </Button>
            </div>
        </div>
    );
}