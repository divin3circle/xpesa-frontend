import { redirect } from "next/navigation"

export default function DashboardTransactionsAliasPage() {
  redirect("/dashboard/wallet/history")
}
