import { createClient } from "@/lib/supabase/client"
import { useQuery } from "@tanstack/react-query"

// We need stats about:
// All time earnings, current month earnings, total transactions on creators links, active links.

// const supabase = createClient();

interface AllTimeEarningsResponse {
  allTimeEarnings: string
  thisMonthEarnings: string
  allTimeTransactions: number
}

async function getAllTimeEarnings(): Promise<AllTimeEarningsResponse> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return {
        allTimeEarnings: "0",
        thisMonthEarnings: "0",
        allTimeTransactions: 0,
      }
    const { data, error } = await supabase
      .from("transactions")
      .select("creator_net_usdc")
      .eq("creator_id", user.id)

    console.log("Error getting all time earnings: ", error)
    const sum = data?.reduce((a, c) => a + Number(c.creator_net_usdc), 0)

    return {
      allTimeEarnings:
        sum?.toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        }) || "0",
      thisMonthEarnings: "0",
      allTimeTransactions: data?.length || 0,
    }
  } catch (error) {
    console.log("Error getting all time earnings: ", error)
    return {
      allTimeEarnings: "0",
      thisMonthEarnings: "0",
      allTimeTransactions: 0,
    }
  }
}

export function useGetAllTimeEarnings() {
  return useQuery({
    queryKey: ["allTimeEarnings"],
    queryFn: getAllTimeEarnings,
  })
}
