import { useMemo } from "react";
import { getContract } from "thirdweb";
import { client, HEDERA_HTS_ADDR } from "@/lib/utils";
import { defaultChain } from "@/lib/thirdweb/account-abstraction";

export const useContracts = () => {
  const contract = useMemo(() => {
    return getContract({
      client,
      chain: defaultChain,
      address: HEDERA_HTS_ADDR,
    });
  }, []);

  return {
    data: { success: true, contract },
    isLoading: false,
    error: null,
  };
};