"use client"

import Link from "next/link"
import {
  Search,
  FileText,
  BarChart2,
  Users,
  Clock,
  Calendar,
  HelpCircle,
  Settings,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function EmployeeManagement() {

  return (
    <SidebarProvider>
      <div className="flex w-full h-full min-h-screen bg-gray-50">
        <Sidebar className="w-[230px] border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200">
            <div className="p-4 flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-[#1A365D] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span className="font-bold text-xl text-[#1A365D]">HRIS</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="../dashboard" className="flex items-center gap-3 text-gray-600">
                    <BarChart2 className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={true} className="bg-[#6B9AC4] text-white hover:bg-[#5A89B3]">
                  <Link href="../employee-management" className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    <span>Employee</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="../check-clock" className="flex items-center gap-3 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <span>Check-Clock</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="../overtime" className="flex items-center gap-3 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <span>Overtime</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#" className="flex items-center gap-3 text-gray-600">
                    <FileText className="h-5 w-5" />
                    <span>kosong</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#" className="flex items-center gap-3 text-gray-600">
                    <HelpCircle className="h-5 w-5" />
                    <span>Support</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="#" className="flex items-center gap-3 text-gray-600">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden w-full h-full min-h-screen">
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">Employee Management</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input className="pl-10 w-[250px] bg-gray-50 border-gray-200" placeholder="Search..." />
              </div>
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-600"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                  </svg>
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-blue-500">
                  <AvatarImage src="#" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">John Doe</div>
                  <div className="text-xs text-gray-500">Admin</div>
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>
    </SidebarProvider>
  )
}
