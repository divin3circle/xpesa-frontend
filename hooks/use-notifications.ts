"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { NotificationsResponse } from "@/app/api/notifications/route"
import type { NotificationPreferences } from "@/lib/notifications/preferences"

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || "Request failed")
  return body as T
}

export function useNotifications(filter: "all" | "invite" | "normal" = "all") {
  return useQuery({
    queryKey: ["notifications", filter],
    queryFn: () =>
      jsonFetch<NotificationsResponse>(`/api/notifications?filter=${filter}`),
    refetchInterval: 60_000,
  })
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { ids?: string[]; all?: boolean }) =>
      jsonFetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () =>
      jsonFetch<{ preferences: NotificationPreferences }>(
        "/api/notifications/preferences"
      ),
  })
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Omit<NotificationPreferences, "creator_id">>) =>
      jsonFetch<{ preferences: NotificationPreferences }>(
        "/api/notifications/preferences",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["notification-preferences"] }),
  })
}
