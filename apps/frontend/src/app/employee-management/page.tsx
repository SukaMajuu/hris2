"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupContent,
  SidebarGroup,
  SidebarProvider,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"


// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: Home,
  },
  {
    title: "Employee",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Check-Clock",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Overtime",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <SidebarProvider   style={{
      "--sidebar-width": "15rem",
      "--sidebar-width-mobile": "15rem",
    } as React.CSSProperties}>
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
      <SidebarContent>
        <SidebarHeader>
          <div className="flex items-center justify-center p-1">
            <img src="logo.png" alt="Logo" className="h-12 w-auto" />
          </div>
        </SidebarHeader>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    </SidebarProvider>
  )
}


export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-center text-2xl font-bold">Employee Management</h1>
      <AppSidebar />
    </div>
  );
}