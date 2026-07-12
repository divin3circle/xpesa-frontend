import { useQuery } from "@tanstack/react-query"
import { defineChain, getContract } from "thirdweb"
import { getBalance } from "thirdweb/extensions/erc20"
import type { Account } from "thirdweb/wallets"

import { client } from "@/lib/utils"
import { fetchMultichainTokens } from "./api"
import type { TokenBalance } from "./types"

async function loadBalances(account?: Account): Promise<TokenBalance[]> {
  if (!account) return []
  const tokens = await fetchMultichainTokens()
  const balances = await Promise.all(
    tokens.map(async (token) => {
      try {
        const balance = await getBalance({
          contract: getContract({
            client,
            chain: defineChain(token.chainId),
            address: token.tokenAddress,
          }),
          address: account.address,
        })
        return {
          token,
          balance: balance.displayValue,
          balanceNumber: Number(balance.displayValue),
        }
      } catch {
        return { token, balance: "0", balanceNumber: 0 }
      }
    })
  )
  return balances
}

export function useMultichainBalances(account?: Account) {
  return useQuery({
    queryKey: ["multichain-balances", account?.address],
    queryFn: () => loadBalances(account),
    enabled: Boolean(account),
  })
}
