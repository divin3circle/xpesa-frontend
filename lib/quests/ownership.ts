import type { SupabaseClient } from "@supabase/supabase-js"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { getCreatorIdForUser } from "./server"

export async function requireOwnedQuest(questId: string) {
  const auth = await createClient()
  const { data } = await auth.auth.getUser()
  if (!data.user) throw new Error("Not authenticated")

  const supabase = createAdminClient()
  const creatorId = await getCreatorIdForUser(supabase, data.user.id)
  const { data: quest, error } = await supabase
    .from("quests")
    .select("*, link:links(id,title,type,description)")
    .eq("id", questId)
    .eq("creator_id", creatorId)
    .single()

  if (error || !quest) throw new Error("Quest not found")
  return { supabase, quest }
}

export async function getReviewQuestions(supabase: SupabaseClient, questId: string) {
  const { data, error } = await supabase
    .from("quest_questions")
    .select("*")
    .eq("quest_id", questId)
    .order("sort_order", { ascending: true })

  if (error) throw error
  return data ?? []
}
