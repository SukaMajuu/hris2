import {
  BarChart2,
  Users,
  Clock,
  // Calendar,
  User,
  Settings,
  type LucideIcon,
  LogOut,
} from "lucide-react"
import { ROLES, type Role } from "@/const/role"
import { FEATURE_CODES, type FeatureCode } from "@/const/features"

export type MenuItemType = "main" | "footer"

export interface SubMenuItemConfig {
  title: string;
  href: string;
  icon?: LucideIcon; // Opsional jika ingin ada icon untuk sub menu
  requiredFeature?: FeatureCode; // Feature requirement for sub menu
}

export interface MenuItemConfig {
  title: string
  href: string
  icon: LucideIcon
  roles: Role[]
  type: MenuItemType
  items?: SubMenuItemConfig[]
  requiredFeature?: FeatureCode // Feature requirement for main menu
}

export const menuItems: MenuItemConfig[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart2,
    roles: [ROLES.admin, ROLES.user],
    type: "main",
    requiredFeature: FEATURE_CODES.ADMIN_DASHBOARD // For admin, EMPLOYEE_DASHBOARD for users
  },
  {
    title: "Employee",
    href: "/employee-management",
    icon: Users,
    roles: [ROLES.admin],
    type: "main",
    requiredFeature: FEATURE_CODES.EMPLOYEE_MANAGEMENT
  },
  {
    title: "Check-Clock",
    href: "#",
    icon: Clock,
    roles: [ROLES.admin],
    type: "main",
    requiredFeature: FEATURE_CODES.CHECK_CLOCK_SYSTEM,
    items: [
      {
        title: "Overview",
        href: "/check-clock",
        requiredFeature: FEATURE_CODES.CHECK_CLOCK_SYSTEM
      },
      {
        title: "Work Schedule",
        href: "/check-clock/work-schedule",
        requiredFeature: FEATURE_CODES.CHECK_CLOCK_SETTINGS
      },
      {
        title: "Location",
        href: "/check-clock/location",
        requiredFeature: FEATURE_CODES.CHECK_CLOCK_SETTINGS
      }
    ]
  },
  // {
  //   title: "Overtime",
  //   href: "/overtime",
  //   icon: Calendar,
  //   roles: [ROLES.admin],
  //   type: "main"
  // },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    roles: [ROLES.user],
    type: "footer"
    // No feature requirement - available to all users
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: Clock,
    roles: [ROLES.user],
    type: "main",
    requiredFeature: FEATURE_CODES.EMPLOYEE_DASHBOARD
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: [ROLES.admin],
    type: "footer"
    // No feature requirement - available to all admins
  },
  {
    title: "Logout",
    href: "/logout",
    icon: LogOut,
    roles: [ROLES.admin, ROLES.user],
    type: "footer"
    // No feature requirement - always available
  }
]

export const getMenuItemsByRole = (role: Role): MenuItemConfig[] => {
  return menuItems.filter(item => item.roles.includes(role))
}

export const getMainMenuItemsByRole = (role: Role): MenuItemConfig[] => {
  return menuItems.filter(item =>
    item.roles.includes(role) &&
    item.type === "main"
  )
}

export const getFooterItemsByRole = (role: Role): MenuItemConfig[] => {
  return menuItems.filter(item =>
    item.roles.includes(role) &&
    item.type === "footer"
  )
}

// New function to get menu items filtered by both role and feature access
export const getMenuItemsByRoleAndFeatures = (
  role: Role,
  hasFeature: (feature: FeatureCode) => boolean
): MenuItemConfig[] => {
  return menuItems
    .filter(item => item.roles.includes(role))
    .filter(item => {
      // If no feature is required, show the item
      if (!item.requiredFeature) return true;

      // Special case for dashboard - admin needs admin_dashboard, user needs employee_dashboard
      if (item.href === "/dashboard") {
        if (role === ROLES.admin) {
          return hasFeature(FEATURE_CODES.ADMIN_DASHBOARD);
        } else {
          return hasFeature(FEATURE_CODES.EMPLOYEE_DASHBOARD);
        }
      }

      // Check if user has required feature
      return hasFeature(item.requiredFeature);
    })
    .map(item => ({
      ...item,
      // Filter sub-items based on feature access
      items: item.items?.filter(subItem => {
        if (!subItem.requiredFeature) return true;
        return hasFeature(subItem.requiredFeature);
      })
    }));
}

export const getMainMenuItemsByRoleAndFeatures = (
  role: Role,
  hasFeature: (feature: FeatureCode) => boolean
): MenuItemConfig[] => {
  return getMenuItemsByRoleAndFeatures(role, hasFeature)
    .filter(item => item.type === "main");
}

export const getFooterItemsByRoleAndFeatures = (
  role: Role,
  hasFeature: (feature: FeatureCode) => boolean
): MenuItemConfig[] => {
  return getMenuItemsByRoleAndFeatures(role, hasFeature)
    .filter(item => item.type === "footer");
}
