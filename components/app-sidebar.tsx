"use client"

import * as React from "react"
import Link from "next/link"
import {
  AccountSetting01Icon,
  AiLearningIcon,
  Analytics01Icon,
  BookOpen01Icon,
  CreditCardIcon,
  DashboardSquare02Icon,
  Link01Icon,
  Link02Icon,
  Money02Icon,
  Settings02Icon,
  TransactionIcon,
  User02Icon,
  Wallet02Icon,
} from "hugeicons-react"

import { ProfileViewer } from "@/components/profile-viewer"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { navigationConfig, type NavItem } from "@/lib/navigation"
import { useActiveLink } from "@/hooks/use-active-link"
import { useAdminAccess } from "@/hooks/use-admin-access"

const versions = ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"]

/**
 * Icon resolver - Maps icon names to Lucide React components
 * Extend this mapping as needed for new icons
 */
function resolveIcon(iconName?: string): React.ReactNode {
  if (!iconName) return null

  const iconMap: Record<
    string,
    React.ComponentType<Record<string, unknown>>
  > = {
    "book-open": BookOpen01Icon,
    "ai-learning": AiLearningIcon,
    dashboard: DashboardSquare02Icon,
    user: User02Icon,
    profile: AccountSetting01Icon,
    link: Link01Icon,
    "link-create": Link02Icon,
    analytics: Analytics01Icon,
    quest: AiLearningIcon,
    documents: BookOpen01Icon,
    wallet: Wallet02Icon,
    money: Money02Icon,
    transaction: TransactionIcon,
    "credit-card": CreditCardIcon,
    settings: Settings02Icon,
  }

  const IconComponent = iconMap[iconName]
  return IconComponent ? (
    <IconComponent size={16} strokeWidth={1.8} className="text-current" />
  ) : null
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: adminAccess } = useAdminAccess()
  const showAdmin = adminAccess?.isAdmin === true

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <ProfileViewer defaultVersion={versions[0]} />
      </SidebarHeader>
      <SidebarContent>
        {navigationConfig.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items
                  .filter((item) => showAdmin || item.url !== "/dashboard/admin/moderation")
                  .map((item) => (
                  <NavItemComponent key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

/**
 * NavItemComponent - Renders a single nav item with icon and active state detection
 *
 * Features:
 * - Automatic active state detection via useActiveLink hook
 * - Icon rendering from iconName strings (Lucide React icons)
 * - Full keyboard navigation support via SidebarMenuButton
 * - Responsive layout with icon-first design
 */
function NavItemComponent({ item }: { item: NavItem }) {
  const isActive = useActiveLink(item.url)
  const icon = resolveIcon(item.iconName)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.url} className="flex items-center gap-2">
          {icon && <span className="shrink-0 text-current">{icon}</span>}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
