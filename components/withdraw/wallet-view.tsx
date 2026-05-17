import Header from "@/components/withdraw/header"
import WithdrawBalanceView from "@/components/withdraw/balance-view"

export default function WithdrawWalletView() {
  return (
    <div className={"w-full mx-auto"}>
      <Header />
      <WithdrawBalanceView />
    </div>
  )
}