import { createClient } from "@/lib/supabase/client";
import { TABLENAMES } from "@/lib/supabase/utilities";
import { useQuery } from "@tanstack/react-query";

interface CreatorDetails {
  id: string;
  handle: string;
  display_name: string;
  email: string;
  bio: string;
  avatar_url: string;
  mpesa_number: string;
  wallet_address: string;
  plan: string;
  is_active: boolean;
  oauth_provider: string | null;
  password_hash: string | null;
  onboarding_complete: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

interface CreatorDetailsResponse {
  creator: CreatorDetails | null;
  error: Error | string | null
}

async function getCreatorDetails(): Promise<CreatorDetailsResponse> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        creator: null,
        error: new Error("User session absent.")
      }
    }
    const { data, error } = await supabase
      .from(TABLENAMES.CREATORS)
      .select()
      .eq('id', user.id)

    if (!data || data?.length === 0 || error) {
      return {
        creator: null,
        error: new Error("User details couldn't be fetched.")
      }
    }
    return {
      creator: data[0] as CreatorDetails,
      error: null
    }
  } catch (error) {
    console.log(error)
    return {
      creator: null,
      error: error as string
    }
  }
}


export function useUserDetails() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: getCreatorDetails,
  })
  return { data, isLoading, error }
}
