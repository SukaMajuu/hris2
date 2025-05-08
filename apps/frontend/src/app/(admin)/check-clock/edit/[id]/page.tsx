"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditCheckClock } from "../useEditCheckClock";

export default function EditCheckClockPage() {
    const { form, handleCancel, handleSave } = useEditCheckClock();
    const workScheduleType = form.type;

    return (
        <div className="p-0">
            <div className="bg-[#FFA500] text-black p-3 rounded-md font-medium mb-6 text-center text-lg shadow" style={{ minHeight: 48 }}>Edit Check-Clock Employee</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kiri: 3 card (profile, working hours, work schedule) */}
                <div className="flex flex-col gap-6">
                    {/* Employee Profile */}
                    <Card className="p-6 min-h-56 flex flex-col justify-center">
                        <div className="flex items-center gap-4">
                            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                <Image src="/placeholder.svg?height=96&width=96" alt="Employee photo" width={96} height={96} className="h-full w-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">{form.name}</h3>
                                <p className="text-gray-500">{form.position}</p>
                            </div>
                        </div>
                    </Card>
                    {/* Working Hours */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Working Hours</h3>
                            <button className="text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Check In</label>
                                <p className="text-gray-700">{form.checkIn} - 08:00</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Check-out</label>
                                <p className="text-gray-700">{form.checkOut} - 18:00</p>
                            </div>
                        </div>
                    </Card>
                    {/* Work Schedule */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Work Schedule</h3>
                            <button className="text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Work Schedule Type</label>
                                <Select value={workScheduleType}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select work schedule type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="WFO">WFO (Work From Office)</SelectItem>
                                        <SelectItem value="WFA">WFA (Work From Anywhere)</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>
                </div>
                {/* Kanan: Check-Clock Location */}
                <div className="flex flex-col gap-6 h-full">
                    <Card className="p-6 h-full flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Check-Clock Location</h3>
                            <button className="text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Branch Location</label>
                                <p className="text-gray-700">{form.branch}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Map Picker</label>
                                <div className="h-32 bg-gray-200 rounded-md relative overflow-hidden">
                                    <Image src="/placeholder.svg?height=128&width=400&text=Map+of+Malang" alt="Map" width={400} height={128} className="h-full w-full object-cover" />
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <div className="h-6 w-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 flex gap-1">
                                        <button className="h-6 w-6 bg-white rounded shadow flex items-center justify-center"><span>−</span></button>
                                        <button className="h-6 w-6 bg-white rounded shadow flex items-center justify-center"><span>+</span></button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Location Radius (meter)</label>
                                <p className="text-gray-700">{form.radius} meter</p>
                            </div>
                        </div>
                    </Card>
                </div>
                {/* Action Buttons */}
                <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-2">
                    <Button variant="destructive" onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </div>
        </div>
    );
}