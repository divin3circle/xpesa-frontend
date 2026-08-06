"use client"

import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import LoadingSpinner from "@/components/ui/loading-spinner"
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-notifications"
import type { NotificationPreferences } from "@/lib/notifications/preferences"

const cardBase = "rounded-2xl border border-border/70 bg-transparent shadow-none"

type PrefKey = keyof Omit<NotificationPreferences, "creator_id">

const ROWS: { key: PrefKey; label: string; hint: string }[] = [
  { key: "team_invite_in_app", label: "Team invites — in-app", hint: "Show invite notifications in the bell." },
  { key: "team_invite_email", label: "Team invites — email", hint: "Email me when I'm invited to a team." },
  { key: "team_activity_in_app", label: "Team activity — in-app", hint: "Updates like members joining." },
  { key: "team_activity_email", label: "Team activity — email", hint: "Email me about team activity." },
]

export default function NotificationSettingsPage() {
  const { data, isLoading } = useNotificationPreferences()
  const update = useUpdateNotificationPreferences()

  if (isLoading || !data) {
    return (
      <div className="grid min-h-[240px] place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  const prefs = data.preferences

  const toggle = (key: PrefKey, value: boolean) => {
    update.mutate(
      { [key]: value },
      { onError: () => toast.error("Could not save"), onSuccess: () => toast.success("Saved") }
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Notification settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose how you hear about team invites and activity.
        </p>
      </section>

      <Card className={cardBase}>
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {ROWS.map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <Label htmlFor={row.key} className="text-sm font-medium">
                  {row.label}
                </Label>
                <p className="text-xs text-muted-foreground">{row.hint}</p>
              </div>
              <Switch
                id={row.key}
                checked={Boolean(prefs[row.key])}
                onCheckedChange={(v) => toggle(row.key, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
