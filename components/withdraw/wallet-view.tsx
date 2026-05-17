import Header from "@/components/withdraw/header"
import WithdrawBalanceView from "@/components/withdraw/balance-view"
import WithdrawHistory from "@/components/withdraw/withdraw-history"

export default function WithdrawWalletView() {
  return (
    <div className="mx-auto w-full">
      <Header />
      <WithdrawBalanceView />
      <WithdrawHistory />
    </div>
  )
}
