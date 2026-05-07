"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CustomConnectButton from "@/components/ui/connect-button";
import { Button } from "@/components/ui/button";
import { ChevronsRight, KeyRound, Loader2 } from "lucide-react";
import { prepareContractCall } from "thirdweb";
import { useActiveWallet, useSendTransaction } from "thirdweb/react";
import { toast } from "sonner";
import { useContracts } from "@/hooks/use-contracts";
import { USDC_CONTRACT_ADDRESS } from "@/lib/thirdweb/chains";
import { BrandLogo } from "@/components/landing/brand-logo";

function AssociatePage() {
  const {
    mutate: sendTransaction,
    isPending,
    isSuccess,
    isError,
  } = useSendTransaction();

  const { data: contract } = useContracts();
  const wallet = useActiveWallet()

  useEffect(() => {
    if (isSuccess) {
      toast.success("Wallet associated successfully");
    }
    if (isError) {
      toast.error("Failed to associate wallet");
    }
  }, [isSuccess, isError]);
  const onClick = async () => {
    if (!wallet) {
      toast.error("Please connect your wallet to continue");
      return;
    }
    if (!contract) {
      toast.error("Contract not found");
      return;
    }
    const walletAddress = wallet.getAccount()?.address
    if (!walletAddress) {
      toast.error("Wallet account not found")
      return
    }

    const transaction = prepareContractCall({
      contract: contract.contract,
      method:
        "function associateToken(address account, address token) external returns (int64 responseCode)",
      params: [walletAddress, USDC_CONTRACT_ADDRESS],
      value: BigInt(0),
    });
    sendTransaction(transaction);
  };

  return (
    <div className="w-full flex flex-col items-center max-w-7xl mx-auto px-4 h-screen ">
      <div className="w-full flex items-center justify-between mt-2">
       <BrandLogo tone="default" />
        <div className="flex items-center gap-2">
          <CustomConnectButton />
        </div>
      </div>
      <div className="w-full mt-16 flex flex-col items-center justify-center md:max-w-xl">
        <h1 className="text-4xl font-heading text-foreground">
          USDC Token Association
        </h1>
        <p className="text-base text-muted-foreground font-sans md:text-center text-left mt-2">
          Associating your wallet with the USDC Stablecoin will allow you to
          receive USDC payments directly to your wallet.
        </p>
        <Image
          src="/associate.png"
          alt="associate"
          width={1000}
          height={1000}
          className="w-auto h-48 object-cover mt-4"
        />
        <div className="w-full flex flex-col md:flex-row items-center gap-2 mt-12">
          <Button
            variant="default"
            className="rounded-3xl w-full md:w-1/2 bg-background hover:bg-foreground/10 ease-in transition-all duration-300 text-foreground border border-foreground/20 font-funnel-display font-semibold flex items-center justify-center"
            onClick={onClick}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Associate Wallet
                <KeyRound className="w-4 h-4" />
              </>
            )}
          </Button>
          <Link
            href={"/dashboard"}
            className="flex gap-2 items-center w-full md:w-1/2 group cursor-pointer"
          >
            <Button
              variant="default"
              className="rounded-3xl w-[88%] md:w-[80%] bg-foreground text-background hover:bg-foreground/90 ease-in transition-all duration-300  border border-foreground/20 font-funnel-display font-semibold flex items-center justify-center"
            >
              Back to App
            </Button>
            <div className="w-10 h-10 bg-foreground group-hover:bg-foreground/90 rounded-full flex items-center justify-center">
              <ChevronsRight className="w-6 h-6 text-background group-hover:rotate-[-45deg] ease-in transition-all duration-300" />
            </div>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground font-funnel-display text-center mt-4">
          To successfully associate your wallet with the KESY Stablecoin, you
          need to have some HBAR in your wallet to cover the transaction fees.{" "}
          <a
            href="https://hedera.com/hbar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/50 font-semibold underline"
          >
            Get ℏBAR
          </a>
        </p>
      </div>
    </div>
  );
}

export default AssociatePage;
