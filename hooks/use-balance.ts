
import { getBalance } from "thirdweb/extensions/erc20";
import { Account } from "thirdweb/wallets";
import { PAYMENT_CHAIN, USDC_CONTRACT_ADDRESS } from "@/lib/thirdweb/chains";
import { client, envConfig } from "@/lib/utils";
import { formatUnits } from "viem";
import { getContract } from "thirdweb";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http, parseAbi } from 'viem'
import { hedera, hederaTestnet } from 'viem/chains'
 
async function  getMyBalance(account: Account) {
    if(!USDC_CONTRACT_ADDRESS || !account) {
        return "0.00"
    };
    const balance = await getBalance({ 
        contract: getContract({
            client: client,
            chain: PAYMENT_CHAIN,
            address: USDC_CONTRACT_ADDRESS,
        }), 
        address: account.address
     });
     console.log(formatUnits(balance.value, 6))
    return formatUnits(balance.value, 6);
}

async function getRawBalance({ address }: { address: `0x${string}` }){
    try {
const publicClient = createPublicClient({
  chain: envConfig.ENV === "DEV" ? hederaTestnet : hedera,
  transport: http(),
})

const tokenAddress = USDC_CONTRACT_ADDRESS as `0x${string}`
const walletAddress = address

const balance = await publicClient.readContract({
  address: tokenAddress,
  abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
  functionName: 'balanceOf',
  args: [walletAddress],
})

        return formatUnits(balance, 6)
    } catch (error) {
        console.log(error)
        return "0.00"
    }
}

export function useMyBalance(account: Account) {
    return useQuery({
        queryKey: ["my-balance", account.address],
        queryFn: () => getRawBalance({ address: account.address as `0x${string}` }),
    })
}