import {
  BarChart2,
  Users,
  Clock,
  Calendar,
  User,
  HelpCircle,
  Settings,
  type LucideIcon,
  LogOut,
} from "lucide-react"
import { ROLES, type Role } from "@/const/role"

export type MenuItemType = "main" | "footer"

export interface SubMenuItemConfig {
  title: string;
  href: string;
  icon?: LucideIcon; // Opsional jika ingin ada icon untuk sub menu
}

export interface MenuItemConfig {
  title: string
  href: string
  icon: LucideIcon
  roles: Role[]
  type: MenuItemType
  items?: SubMenuItemConfig[]
}

export const menuItems: MenuItemConfig[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart2,
    roles: [ROLES.admin, ROLES.user],
    type: "main"
  },
  {
    title: "Employee",
    href: "/employee-management",
    icon: Users,
    roles: [ROLES.admin],
    type: "main"
  },
  {
    title: "Check-Clock",
    href: "/check-clock",
    icon: Clock,
    roles: [ROLES.admin],
    type: "main",
    items: [
      {
        title: "Work Schedule",
        href: "/check-clock/work-schedule",
      },
      { title: "Location",
        href: "/check-clock/location",
      }
    ]
  },
  {
    title: "Overtime",
    href: "/overtime",
    icon: Calendar,
    roles: [ROLES.admin],
    type: "main"
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    roles: [ROLES.user],
    type: "main"
  },
  {
    title: "My Time",
    href: "/time",
    icon: Clock,
    roles: [ROLES.user],
    type: "main"
  },
  {
    title: "Support",
    href: "#",
    icon: HelpCircle,
    roles: [ROLES.admin, ROLES.user],
    type: "footer"
  },
  {
    title: "Settings",
    href: "#",
    icon: Settings,
    roles: [ROLES.admin, ROLES.user],
    type: "footer"
  },
  {
    title: "Logout",
    href: "/logout",
    icon: LogOut,
    roles: [ROLES.admin, ROLES.user],
    type: "footer"
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
