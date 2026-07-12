import { createClient } from "@/lib/supabase/client"
import { createLink } from "@/lib/links/create-link"
import { getCreatorLinks } from "@/lib/links/list-links"
import { getErrorMessage } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type {
  CreateLinkParams,
  Link,
  LinkResponse,
  ModerationStatus,
} from "@/lib/links/types"

export function useMyLinks() {
  return useQuery({
    queryKey: ["links"],
    queryFn: getCreatorLinks,
  })
}

export function useCreateLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: Parameters<typeof createLink>[1]) => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User is not authenticated")
      const { data, error } = await createLink(user.id, params)
      if (error || !data) {
        throw new Error(getErrorMessage(error) || "Failed to create link")
      }
      return data
    },
    onSuccess: () => {
      toast.success("Link created and submitted for review.")
      void queryClient.invalidateQueries({ queryKey: ["links"] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Failed to create link")
    },
  })
}
