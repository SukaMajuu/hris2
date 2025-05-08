import type React from 'react';
import Image from 'next/image';
// import { Search } from "lucide-react";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
// import { Input } from "@/components/ui/input";
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
} from '@/components/ui/sidebar';
import { type Role } from '../../const/role';
import { getMainMenuItemsByRole, getFooterItemsByRole } from '../_config/menuConfig';
import { useAuthStore } from '@/stores/auth.store';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = (user?.role as Role) || 'admin';

  const getPageTitle = () => {
    const allMenuItems = [...getMainMenuItemsByRole(role), ...getFooterItemsByRole(role)];
    const currentMenuItem = allMenuItems.find((item) => item.href === pathname);
    return currentMenuItem?.title || 'Dashboard';
  };

  const menuItems = getMainMenuItemsByRole(role);
  const footerItems = getFooterItemsByRole(role);

  return (
    <SidebarProvider>
      <div className='flex h-full min-h-screen w-full bg-gray-50'>
        <Sidebar collapsible='icon' className='border-r border-gray-200'>
          <SidebarHeader className='h-18 justify-center border-b border-gray-200'>
            <div className='mx-auto flex aspect-square h-8 items-center justify-center'>
              <Image
                src='/logo.png'
                alt='Company Logo'
                width={32}
                height={32}
                className='h-full w-full object-contain'
              />
            </div>
          </SidebarHeader>

          <SidebarContent className='p-2'>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={
                        isActive
                          ? 'bg-[#7CA5BF] text-white hover:bg-[#6B9AC4]'
                          : 'text-gray-600 hover:bg-gray-100'
                      }
                    >
                      <Link href={item.href} className='flex items-center gap-3'>
                        <item.icon className='h-5 w-5' />
                        <span className='overflow-hidden'>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className='mt-auto border-t border-gray-200 p-2'>
            <SidebarMenu>
              {footerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.href}
                    className={
                      pathname === item.href
                        ? 'bg-[#7CA5BF] text-white hover:bg-[#6B9AC4]'
                        : 'text-gray-600 hover:bg-gray-100'
                    }
                  >
                    <Link href={item.href} className='flex items-center gap-3'>
                      <item.icon className='h-5 w-5' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset className='flex h-full min-h-screen w-full flex-1 flex-col overflow-hidden'>
          <header className='flex h-18 items-center justify-between border-b border-gray-200 bg-white px-4 py-4'>
            <div className='flex items-center gap-3'>
              <SidebarTrigger className='text-gray-600 hover:bg-[#5A89B3] hover:text-white' />
              <h1 className='text-xl font-semibold text-gray-800 md:text-2xl'>{getPageTitle()}</h1>
            </div>
            <div className='flex items-center gap-2 md:gap-4'>
              <div className='relative hidden md:block'></div>
              <div className='relative'>
                <a href='facebook.com' target='_blank' rel='noopener noreferrer'>
                  <Button variant='ghost' size='icon' className='group relative hover:bg-[#5A89B3]'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='text-gray-600 group-hover:text-white'
                    >
                      <path d='M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'></path>
                      <path d='M10.3 21a1.94 1.94 0 0 0 3.4 0'></path>
                    </svg>
                  </Button>
                </a>
              </div>
              <div className='flex items-center gap-2 md:gap-3'>
                <Avatar className='h-8 w-8 border-2 border-blue-500 md:h-9 md:w-9'>
                  <AvatarImage src='#' />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className='hidden md:block'>
                  <div className='font-medium'>{user?.email || 'User'}</div>
                  <div className='text-xs text-gray-500'>{role}</div>
                </div>
              </div>
            </div>
          </header>

          <div className='flex-1 overflow-auto bg-[#E5E7EB]'>
            <div className='p-4'>{children}</div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
