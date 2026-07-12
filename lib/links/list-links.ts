import { createClient } from "@/lib/supabase/client"
import { TABLENAMES } from "@/lib/supabase/utilities"
import { getErrorMessage } from "@/lib/utils"
import type { LinkResponse } from "./types"

export async function getCreatorLinks(): Promise<LinkResponse> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { links: [], error: Error("User is not authenticated") }
    }

    const { data, error } = await supabase
      .from(TABLENAMES.LINKS)
      .select("*")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false })

    if (error || !data) {
      return {
        links: [],
        error: error || Error("User links could not be loaded"),
      }
    }

    return { links: data, error: null }
  } catch (error) {
    return { links: [], error: getErrorMessage(error) }
  }
}
