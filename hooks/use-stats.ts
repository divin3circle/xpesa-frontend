import { createClient } from "@/lib/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { TABLENAMES } from "@/lib/supabase/utilities"

interface AllTimeEarningsResponse {
  allTimeEarnings: string
  thisMonthEarnings: string
  allTimeTransactions: number
}

async function getCurrentMonthEarnings(): Promise<string> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return "0.0"
    }
    const { data, error } = await supabase
      .from(TABLENAMES.TRANSACTIONS)
      .select("creator_net_usdc")
      .gte("created_at", thirtyDaysAgo.toISOString())
    if (error || !data) {
      console.log("Error getting this month's earnings: ", error)
      return "0.0"
    }
    const sum = data?.reduce((a, c) => a + Number(c.creator_net_usdc), 0)

    return (
      sum?.toLocaleString(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }) || "0.0"
    )
  } catch (error) {
    console.error("Error getting this month's earnings data", error)
    return "0.0"
  }
}

async function getAllTimeEarnings(): Promise<AllTimeEarningsResponse> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return {
        allTimeEarnings: "0.0",
        thisMonthEarnings: "0.0",
        allTimeTransactions: 0,
      }
    const { data } = await supabase
      .from(TABLENAMES.TRANSACTIONS)
      .select("creator_net_usdc")
      .eq("creator_id", user.id)

    const sum = data?.reduce((a, c) => a + Number(c.creator_net_usdc), 0)

    return {
      allTimeEarnings:
        sum?.toLocaleString(undefined, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        }) || "0",
      thisMonthEarnings: await getCurrentMonthEarnings(),
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
