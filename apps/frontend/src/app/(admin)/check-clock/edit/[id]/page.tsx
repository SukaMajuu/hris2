'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

export default function EditCheckClockEmployee() {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  // eslint-disable-next-line
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleSave = () => {
    // Add your save logic here
    
    // Show success toast
    toast({
      title: "Success",
      description: "Changes saved successfully",
      duration: 2000,
    });

    // Redirect after toast
    setTimeout(() => {
      router.push("/check-clock");
    }, 2000);
  };

  return (
    <div className="space-y-4">

      {/* Profile */}
      <Card>
        <CardHeader>
            <CardTitle className="text-lg font-semibold bg-[#E69500] text-white p-4 rounded-lg">
                Edit Checkclock
            </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <Image
              src={profileImage || '/logo.png'}
              alt='Profile Photo'
              width={80}
              height={80}
              className='object-fill'
            />
          <div>
            <p className="text-lg font-semibold">Sarah Connor</p>
            <p className="text-gray-500 text-sm">CEO</p>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Work Schedule */}
        <Card>
          <CardContent className="relative p-4 space-y-3">
            <div className="absolute top-3 right-3 cursor-pointer">
              <Pencil onClick={() => setIsEditingSchedule(!isEditingSchedule)} />
            </div>

            <h3 className="font-semibold text-md">Work Schedule</h3>

            <div>
              <label className="text-sm text-gray-600">Work Schedule Type</label>
              <Select disabled={!isEditingSchedule}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Morning" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Check In</label>
                <Input value="07:00 - 08:00" readOnly />
              </div>
              <div>
                <label className="text-sm text-gray-600">Check-out</label>
                <Input value="17:00 - 18:00" readOnly />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Break Start</label>
              <Input value="12:00 - 13:00" readOnly />
            </div>

            <div>
              <label className="text-sm text-gray-600">Work Type</label>
              <Input value="WFO (Work From Office)" readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Check-Clock Location */}
        <Card>
          <CardContent className="relative p-4 space-y-3">
            <div className="absolute top-3 right-3 cursor-pointer">
              <Pencil onClick={() => setIsEditingLocation(!isEditingLocation)} />
            </div>

            <h3 className="font-semibold text-md">Check-Clock Location</h3>

            <div>
              <label className="text-sm text-gray-600">Location</label>
              <Select disabled={!isEditingLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="malang">Kota Malang</SelectItem>
                  <SelectItem value="jakarta">Jakarta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Address Details</label>
              <Input value="Kota Malang, Jawa Timur" readOnly />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Lat</label>
                <Input value="Lat Location" readOnly />
              </div>
              <div>
                <label className="text-sm text-gray-600">Long</label>
                <Input value="Long Location" readOnly />
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
          Save Changes
        </Button>
      </div>
    </div>
  );
}
