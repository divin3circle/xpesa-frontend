/**
 * Navigation Configuration
 *
 * Centralized navigation structure with typed configuration.
 * Icon names are stored as strings for flexibility and to keep config pure.
 * Icons are resolved in the sidebar component using Lucide React.
 *
 * To add a new icon:
 * 1. Add the icon name to the navigationConfig (iconName field)
 * 2. Import the icon in app-sidebar.tsx
 * 3. Add it to the iconMap in the resolveIcon function
 */

export interface NavItem {
  title: string
  url: string
  iconName?: string
}

export interface NavGroup {
  title: string
  url: string
  iconName?: string
  items: NavItem[]
}

export const navigationConfig: NavGroup[] = [
  {
    title: "Onboarding",
    url: "#",
    iconName: "book-open",
    items: [
      {
        title: "Documentation",
        url: "/docs",
        iconName: "book-open",
      },
      {
        title: "Learn",
        url: "/learn",
        iconName: "ai-learning",
      },
    ],
  },
  {
    title: "Analytics",
    url: "#",
    iconName: "dashboard",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        iconName: "dashboard",
      },
      {
        title: "My Page",
        url: "/dashboard/my-page",
        iconName: "user",
      },
      {
        title: "Profile",
        url: "/dashboard/profile",
        iconName: "profile",
      },
    ],
  },
  {
    title: "Links",
    url: "#",
    iconName: "link",
    items: [
      {
        title: "My Links",
        url: "/dashboard/links",
        iconName: "link",
      },
      {
        title: "Create Link",
        url: "/dashboard/links/create",
        iconName: "link-create",
      },
      {
        title: "Links Analytics",
        url: "/dashboard/links/analytics",
        iconName: "analytics",
      },
    ],
  },
  {
    title: "Wallet",
    url: "#",
    iconName: "wallet",
    items: [
      {
        title: "Withdraw Funds",
        url: "/dashboard/wallet/withdraw",
        iconName: "money",
      },
      {
        title: "Transaction History",
        url: "/dashboard/wallet/history",
        iconName: "transaction",
      },
      {
        title: "Supported Methods",
        url: "/dashboard/wallet/methods",
        iconName: "credit-card",
      },
      {
        title: "Payout Settings",
        url: "/dashboard/wallet/settings",
        iconName: "settings",
      },
    ],
  },
]
