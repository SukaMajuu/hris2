import type React from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Sidebar,
	SidebarHeader,
	SidebarProvider,
	SidebarTrigger,
	SidebarRail,
	SidebarInset,
	SidebarContent,
	SidebarFooter,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { type Role } from "../../const/role";
import { getMainMenuItemsByRole, getFooterItemsByRole } from "../_config/menuConfig";
import { useAuthStore } from "@/stores/auth.store";

interface MainLayoutProps {
	children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
	const pathname = usePathname();
	const { user } = useAuthStore();
	const role = (user?.role as Role) || "admin";

	const getPageTitle = () => {
		const allMenuItems = [...getMainMenuItemsByRole(role), ...getFooterItemsByRole(role)];
		const currentMenuItem = allMenuItems.find(item => item.href === pathname);
		return currentMenuItem?.title || "Dashboard";
	};

	const menuItems = getMainMenuItemsByRole(role);
	const footerItems = getFooterItemsByRole(role);

	return (
		<SidebarProvider>
			<div className="flex w-full h-full min-h-screen bg-gray-50">
				<Sidebar
					collapsible="offcanvas"
					className="border-r border-gray-200"
				>
					<SidebarHeader className="border-b border-gray-200">
						<div className="p-2">
							<div className="h-10 w-10 flex items-center justify-center mx-auto">
								<Image
									src="/logo.png"
									alt="Company Logo"
									width={120}
									height={40}
									className="h-10 w-auto"
								/>
							</div>
						</div>
					</SidebarHeader>

					<SidebarContent className="p-2">
						<SidebarMenu>
							{menuItems.map((item) => {
								const isActive = pathname === item.href;
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={item.title}
											className={
												isActive ? "bg-[#7CA5BF] text-white hover:bg-[#6B9AC4]" : "text-gray-600 hover:bg-gray-100"
											}
										>
											<Link href={item.href} className="flex items-center gap-3">
												<item.icon className="h-5 w-5" />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarContent>

					<SidebarFooter className="mt-auto border-t border-gray-200 p-2">
						<SidebarMenu>
							{footerItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										tooltip={item.title}
										isActive={pathname === item.href}
										className={
											pathname === item.href
												? "bg-[#7CA5BF] text-white hover:bg-[#6B9AC4]"
												: "text-gray-600 hover:bg-gray-100"
										}
									>
										<Link href={item.href} className="flex items-center gap-3">
											<item.icon className="h-5 w-5" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarFooter>

					<SidebarRail />
				</Sidebar>

				<SidebarInset className="flex-1 flex flex-col overflow-hidden w-full h-full min-h-screen">
					<header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<SidebarTrigger className="text-gray-600 hover:text-white hover:bg-[#5A89B3]" />
							<h1 className="text-xl md:text-2xl font-semibold text-gray-800">
								{getPageTitle()}
							</h1>
						</div>
						<div className="flex items-center gap-2 md:gap-4">
							<div className="relative hidden md:block">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									className="pl-10 w-[200px] lg:w-[250px] bg-gray-50 border-gray-200"
									placeholder="Search..."
								/>
							</div>
							<div className="relative">
								<Button
									variant="ghost"
									size="icon"
									className="relative hover:bg-[#5A89B3] group"
								>
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
										className="text-gray-600 group-hover:text-white"
									>
										<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
										<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
									</svg>
								</Button>
							</div>
							<div className="flex items-center gap-2 md:gap-3">
								<Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-blue-500">
									<AvatarImage src="#" />
									<AvatarFallback>JD</AvatarFallback>
								</Avatar>
								<div className="hidden md:block">
									<div className="font-medium">{user?.email || "User"}</div>
									<div className="text-xs text-gray-500">
										{role}
									</div>
								</div>
							</div>
						</div>
					</header>

					<div className="flex-1 overflow-auto bg-[#E5E7EB]">
						<div className="p-6">{children}</div>
					</div>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
