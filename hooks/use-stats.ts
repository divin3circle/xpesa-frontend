// import { createClient } from "@/lib/supabase/client"
// import { useQuery } from "@tanstack/react-query"

// We need stats about:
// All time earnings, current month earnings, total transactions on creators links, active links.

// const supabase = createClient();

// async function getAllTimeEarnings(): Promise<string> {
//   try {
//     const { data: { user } } = await supabase.auth.getUser()
//     if (!user) return "0"
//     const { data, error } = await supabase
//       .from('transactions')
//       .select('total_earned_usdc')
//       .eq('creator_id', user.id)

//     console.log("Error getting all time earnings: ", error)
//     const sum = data?.reduce((a, c) => Number(a.total_earned_usdc) + Number(c.total_earned_usdc), 0);

//     return sum?.toLocaleString(undefined, {
//       maximumFractionDigits: 2,
//       minimumFractionDigits: 2
//     }) || "0"
//   } catch (error) {
//     console.log("Error getting all time earnings: ", error);
//     return "0"
//   }
// }
