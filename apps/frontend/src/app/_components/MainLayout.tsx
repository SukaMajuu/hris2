'use client';

import { ChevronDown, Loader2, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { useProactiveTokenRefresh } from '@/hooks/useProactiveTokenRefresh';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

import { useLogout } from '../(auth)/logout/useLogout';
import { type Role } from '../../const/role';
import { getMainMenuItemsByRole, getFooterItemsByRole } from '../_config/menuConfig';

interface MainLayoutProps {
  children: React.ReactNode;
}

const LogoComponent = () => {
  const { open } = useSidebar();
  return (
    <div className='flex flex-1 items-center justify-center overflow-hidden p-2'>
      <Image
        src={open ? '/logo.png' : '/logo2.png'}
        alt='Company Logo'
        width={open ? 84 : 40}
        height={open ? 84 : 40}
        className={`object-contain transition-all duration-200 ${open ? 'h-12' : 'h-8 w-8'}`}
      />
    </div>
  );
}

// Special LogoutButton component with loading state
const LogoutButton = ({ className }: { className?: string }) => {
  const { logout, isLoading } = useLogout();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent spam clicking
    await logout();
  };

  return (
    <SidebarMenuButton
      variant='default'
      tooltip={isLoading ? "Logging out..." : "Logout"}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      <div className='flex items-center gap-3'>
        {isLoading ? (
          <Loader2 className='h-5 w-5 flex-shrink-0 animate-spin' />
        ) : (
          <LogOut className='h-5 w-5 flex-shrink-0' />
        )}
        <span className='sidebar-item-label-and-chevron truncate'>
          {isLoading ? "Logging out..." : "Logout"}
        </span>
      </div>
    </SidebarMenuButton>
  );
}

// New component to encapsulate sidebar content and footer
interface NavContentProps {
  menuItems: ReturnType<typeof getMainMenuItemsByRole>;
  footerItems: ReturnType<typeof getFooterItemsByRole>;
  pathname: string;
}

const NavContent = ({ menuItems, footerItems, pathname }: NavContentProps) => (
    <>
      <SidebarContent className='flex-1 space-y-1.5 overflow-y-auto p-2'>
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const hasSubmenu = (item.items ?? []).length > 0;

            if (hasSubmenu) {
              const isAnySubActive =
                item.items?.some((sub) => pathname.startsWith(sub.href)) ?? false;
              return (
                <SidebarMenuItem key={item.title}>
                  <Collapsible defaultOpen={isAnySubActive}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        variant='default'
                        tooltip={item.title}
                        className={`sidebar-collapsible-trigger flex w-full items-center justify-between rounded-md px-3 py-2 transition-colors duration-150 ${
                          isAnySubActive
                            ? 'bg-primary hover:bg-primary/90 text-white'
                            : 'text-gray-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <item.icon className='h-5 w-5 flex-shrink-0' />
                          <span className='sidebar-item-label-and-chevron truncate text-sm font-medium'>
                            {item.title}
                          </span>
                        </div>
                        <ChevronDown
                          className="sidebar-item-label-and-chevron h-4 w-4 text-gray-500 transition-transform duration-200 ease-in-out"
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent className='sidebar-collapsible-content mt-1 ml-0 space-y-1'>
                      {item.items?.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <div key={sub.title}>
                            <SidebarMenuButton
                              asChild
                              variant='default'
                              tooltip={sub.title}
                              className={`w-full justify-start rounded-md px-3 py-1.5 text-sm transition-colors duration-150 ${
                                isSubActive
                                  ? 'bg-slate-200 font-medium text-slate-900 hover:bg-slate-300 hover:text-slate-900 active:bg-slate-400 active:text-slate-900'
                                  : 'bg-transparent text-gray-600 hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200 active:text-slate-900'
                              }`}
                            >
                              <Link href={sub.href} className='flex items-center gap-2.5 pl-7'>
                                {sub.icon && <sub.icon className='h-4 w-4 flex-shrink-0' />}
                                <span className='truncate'>{sub.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  variant='default'
                  tooltip={item.title}
                  className={`flex w-full items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary hover:bg-primary/90 text-white'
                      : 'bg-transparent text-gray-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Link href={item.href} className='flex items-center gap-3'>
                    <item.icon className='h-5 w-5 flex-shrink-0' />
                    <span className='sidebar-item-label-and-chevron truncate'>{item.title}</span>
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
              {item.title === "Logout" ? (
                <LogoutButton
                  className={`flex w-full items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    pathname === item.href
                      ? 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                      : 'bg-transparent text-gray-600 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                />
              ) : (
                <SidebarMenuButton
                  asChild
                  variant='default'
                  tooltip={item.title}
                  className={`flex w-full items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    pathname === item.href
                      ? 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                      : 'bg-transparent text-gray-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <Link href={item.href} className='flex items-center gap-3'>
                    <item.icon className='h-5 w-5 flex-shrink-0' />
                    <span className='sidebar-item-label-and-chevron truncate'>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </>
  )

const hideLayoutForPaths = [
  '/subscription',
  '/subscription/checkout',
  '/payment',
  '/payment/process',
  '/payment/pending',
  '/payment/success',
  '/payment/failed',
  '/welcome',
];

const MainLayout = ({ children }: MainLayoutProps) => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  useProactiveTokenRefresh();

  const { shouldShowLayout: hasActiveSubscription } = useSubscriptionStatus();

  const userProfile = useUserProfile();

  const role = (user?.role as Role) || 'admin';

  const shouldHideLayout =
    hideLayoutForPaths.includes(pathname) || (!hasActiveSubscription && pathname !== '/welcome');

  // Add sidebar styles to document head
  React.useEffect(() => {
    const styleId = 'sidebar-styles';
    if (document.getElementById(styleId)) return () => {};

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .group[data-state='collapsed'] .sidebar-item-label-and-chevron {
        display: none !important;
      }
      .group[data-state='collapsed'] .sidebar-collapsible-content {
        display: none !important;
      }

      .group[data-state='collapsed'] .sidebar-collapsible-trigger > div.gap-3 {
        gap: 0 !important;
      }

      .sidebar-collapsible-trigger[data-state='closed'] > svg.sidebar-item-label-and-chevron {
        transform: rotate(-90deg) !important;
      }

      .sidebar-collapsible-trigger[data-state='open'] > svg.sidebar-item-label-and-chevron {
        transform: rotate(0deg) !important;
      }

      .group[data-state='collapsed'] .flex.items-center.justify-start,
      .group[data-state='collapsed'] .flex.items-center.justify-between {
        justify-content: center !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const getPageTitle = () => {
    const allMenuItems = [...getMainMenuItemsByRole(role), ...getFooterItemsByRole(role)];
    let currentTitle = 'Dashboard';
    let longestMatch = 0;
    allMenuItems.forEach((item) => {
      if (pathname.startsWith(item.href) && item.href.length > longestMatch) {
        currentTitle = item.title;
        longestMatch = item.href.length;
      }
      item.items?.forEach((subItem) => {
        if (pathname.startsWith(subItem.href) && subItem.href.length > longestMatch) {
          currentTitle = subItem.title;
          longestMatch = subItem.href.length;
        }
      });
    });
    return currentTitle;
  };

  const menuItems = getMainMenuItemsByRole(role);
  const footerItems = getFooterItemsByRole(role);

  return (
    <SidebarProvider>
      <div className='flex h-full min-h-screen w-full bg-slate-100'>
        {!shouldHideLayout && (
          <>
            <Sidebar
              collapsible='icon'
              className='group border-r border-gray-200 bg-white shadow-sm'
            >
              <SidebarHeader className='flex h-16 items-center justify-center border-b border-gray-200'>
                <LogoComponent />
              </SidebarHeader>
              <NavContent menuItems={menuItems} footerItems={footerItems} pathname={pathname} />
              <SidebarRail className='border-r border-gray-200 bg-white' />
            </Sidebar>
          </>
        )}

        <SidebarInset
          className={cn('flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto', {
            'ml-0': shouldHideLayout,
          })}
        >
          {!shouldHideLayout && (
            <>
              <header className='sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 py-4'>
                <div className='flex items-center gap-3'>
                  <SidebarTrigger className='hover:bg-primary text-gray-600 hover:cursor-pointer hover:text-white' />
                  <h1 className='text-lg font-semibold whitespace-nowrap text-gray-800 md:text-xl'>
                    {getPageTitle()}
                  </h1>
                </div>
                <div className='flex items-center gap-2 md:gap-4'>
                  <div className='flex items-center gap-2 md:gap-3'>
                    <Avatar className='h-9 w-9 border-2 border-transparent transition-colors hover:border-blue-500'>
                      <AvatarImage src={userProfile.avatarUrl} alt={userProfile.avatarAlt} />
                      <AvatarFallback className='text-sm font-medium'>
                        {userProfile.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className='hidden text-sm md:block'>
                      <div className='font-semibold text-gray-800'>{userProfile.displayName}</div>
                      <div className='text-xs text-gray-500 capitalize'>{role}</div>
                    </div>
                  </div>
                </div>
              </header>
            </>
          )}

          <main className='flex-1 bg-slate-100'>
            <div className='p-4 lg:p-6'>{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
