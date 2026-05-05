import { useQuery } from "@tanstack/react-query"
import { getBalance } from "thirdweb/extensions/erc20"
import { getContract } from "thirdweb"
import { Account } from "thirdweb/wallets"

import { PAYMENT_CHAIN, USDC_CONTRACT_ADDRESS } from "@/lib/thirdweb/chains"
import { client, envConfig } from "@/lib/utils"

async function getMyBalance(account: Account) {
  if (!USDC_CONTRACT_ADDRESS || !account) {
    return "0.00"
  }
  const balance = await getBalance({
    contract: getContract({
      client: client,
      chain: PAYMENT_CHAIN,
      address: USDC_CONTRACT_ADDRESS,
    }),
    address: account.address,
  })
  return balance.displayValue
}

export function useMyBalance(account: Account) {
  return useQuery({
    queryKey: ["my-balance", envConfig.CHAIN, account.address],
    queryFn: () => getMyBalance(account),
  })
}
