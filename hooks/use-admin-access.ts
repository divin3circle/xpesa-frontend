import { useQuery } from "@tanstack/react-query"

import { createClient } from "@/lib/supabase/client"

async function getAdminAccess() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { isAdmin: false }

  const response = await fetch("/api/admin/moderation?status=all")
  return { isAdmin: response.ok }
}

export function useAdminAccess() {
  return useQuery({
    queryKey: ["admin-access"],
    queryFn: getAdminAccess,
    staleTime: 5 * 60 * 1000,
  })
}
