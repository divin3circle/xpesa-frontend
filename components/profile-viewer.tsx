"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UnfoldMoreIcon,
  Tick02Icon,
  LogOut,
  Switch,
} from "@hugeicons/core-free-icons"
import Image from "next/image"
import { ModeToggle } from "./mode-toggle"

export function ProfileViewer({ defaultVersion }: { defaultVersion: string }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={100}
                  height={100}
                  className="h-8 w-8 rounded-2xl object-cover"
                />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Sylus Abel</span>
                <span className="text-xs text-foreground/75">@sylus</span>
              </div>
              <HugeiconsIcon
                icon={UnfoldMoreIcon}
                strokeWidth={2}
                className="ml-auto"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start"
          >
            <DropdownMenuItem
              onSelect={() => {}}
              className="flex items-center justify-between"
            >
              <span className="">Switch Account</span>
              <HugeiconsIcon icon={Switch} strokeWidth={2} className="ml-2" />
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {}}
              className="flex items-center justify-between"
            >
              <span className="">Logout</span>
              <HugeiconsIcon icon={LogOut} strokeWidth={2} className="ml-2" />
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={() => {}}
              className="flex items-center justify-between"
            >
              <span className="">App Version</span>
              <div className="ml-2 flex items-center gap-1 text-xs">
                <HugeiconsIcon
                  icon={Tick02Icon}
                  strokeWidth={2}
                  className="ml-2 text-chart-1"
                />
                {defaultVersion}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {}}
              className="flex items-center justify-between"
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="">Select Mode</span>
                <ModeToggle />
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
