import { createClient } from "@/lib/supabase/client";
import { TABLENAMES } from "@/lib/supabase/utilities";
import { getErrorMessage } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";


export interface Link {
  // Primary Key
  id: string;

  // Metadata & Timestamps
  created_at: Date | string;
  updated_at: Date | string | null;
  creator_id: string;
  is_active: boolean;

  // General Information
  type: string;
  title: string;
  description: string | null;
  destination_url: string | null;
  thumbnail_url: string | null;

  // Document Specific Fields
  document_r2_key: string | null;
  document_page_count: number | null;
  document_file_size_bytes: number | null;
  document_thumbnail_r2_key: string | null;

  // Pack Specific Fields
  pack_thumbnail_r2_key: string | null;
  pack_file_count: number | null;
  pack_total_size_bytes: number | null;

  // Financials
  price_usdc: number | null;
  suggested_amount_usdc: number | null;
  total_earned_usdc: number;

  // Access Controls & Logic
  access_expiry_type: string | null;
  access_max_views: number | null;
  access_ip_binding: boolean;
  access_wallet_binding: boolean;

  // Document Restrictions
  doc_watermark_enabled: boolean;
  doc_download_blocked: boolean;

  // Engagement & Customization
  thank_you_message: string | null;
  view_count: number;
  payment_count: number;
}

export interface LinkResponse {
  links: Link[];
  error: Error | String | null
}

async function getCreatorLinks(): Promise<LinkResponse> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        links: [],
        error: Error("User is not authenticated")
      }
    }

    const { data, error } = await supabase
      .from(TABLENAMES.LINKS)
      .select("*")
      .eq('creator_id', user.id);

    if (error || !data) {
      return {
        links: [],
        error: error || Error("User links could not be loaded")
      }
    }

    return {
      links: data,
      error: null
    }

  } catch (error) {
    console.log("Error fetching links: ", error);
    return {
      links: [],
      error: getErrorMessage(error)
    }
  }
}


export function useMyLinks() {
  return useQuery({
    queryKey: ["links"],
    queryFn: getCreatorLinks
  })
}
