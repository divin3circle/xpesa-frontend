import type { SupabaseClient } from "@supabase/supabase-js"

export type NotificationInput = {
  recipientCreatorId: string
  type: string
  category?: "invite" | "normal"
  title: string
  body?: string | null
  data?: Record<string, unknown>
}

/** Insert an in-app notification. Best-effort — never throws into the caller's flow. */
export async function createNotification(
  supabase: SupabaseClient,
  input: NotificationInput
) {
  const { error } = await supabase.from("notifications").insert({
    recipient_creator_id: input.recipientCreatorId,
    type: input.type,
    category: input.category ?? "normal",
    title: input.title,
    body: input.body ?? null,
    data: input.data ?? {},
  })
  if (error) {
    console.error("createNotification failed:", error.message)
  }
}
