"use client"

import { useState, useMemo } from "react"
import { useActiveAccount } from "thirdweb/react"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"

export type FileItem = {
  id: string
  name: string
  type: string
  size?: string
  modified?: string
  sharedBy?: string
}

export function useUnifiedFileExplorer(fanWalletAddress: string) {
  const account = useActiveAccount()
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const isWrongWallet = useMemo(() => {
    return (
      !!account?.address &&
      !!fanWalletAddress &&
      account.address.toLowerCase() !== fanWalletAddress.toLowerCase()
    )
  }, [account?.address, fanWalletAddress])

  async function handleFileClick({
    file,
    tokenId,
    onOpen,
  }: {
    file: FileItem
    tokenId: string
    onOpen?: (file: FileItem) => void
  }) {
    console.log("File clicked:", file)
    if (!account?.address) {
      toast.error("Please connect your wallet first")
      return
    }

    setSelectedFile(file)
    setIsAuthenticating(true)

    try {
      toast.info(`Opening ${file.name}...`)
      onOpen?.(file)
    } catch (err) {
      toast.error("Failed to open file", {
        description: getErrorMessage(err),
      })
    } finally {
      console.log(tokenId)
      setIsAuthenticating(false)
    }
  }

  return {
    account,
    selectedFile,
    setSelectedFile,
    isAuthenticating,
    isAuthorized,
    setIsAuthorized,
    isWrongWallet,
    handleFileClick,
  }
}
