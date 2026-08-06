"use client"

import Link from "next/link"
import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  useNotifications,
  useMarkNotificationsRead,
} from "@/hooks/use-notifications"

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function NotificationBell() {
  const { data } = useNotifications("all")
  const markRead = useMarkNotificationsRead()
  const unread = data?.unread ?? 0
  const recent = (data?.notifications ?? []).slice(0, 6)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unread > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-background">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unread > 0 ? (
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => markRead.mutate({ all: true })}
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />

        {recent.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          recent.map((n) => (
            <DropdownMenuItem key={n.id} asChild className="cursor-pointer">
              <Link href="/dashboard/notifications" className="flex flex-col items-start gap-0.5">
                <span className="flex w-full items-center gap-2">
                  {!n.read_at ? (
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  ) : (
                    <span className="size-1.5 shrink-0" />
                  )}
                  <span className={cn("truncate text-sm", !n.read_at && "font-medium")}>
                    {n.title}
                  </span>
                </span>
                <span className="pl-3.5 text-xs text-muted-foreground">
                  {timeAgo(n.created_at)}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer justify-center">
          <Link href="/dashboard/notifications">View all notifications</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
