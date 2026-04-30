"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import {
  useUnifiedFileExplorer,
  type FileItem,
} from "@/hooks/use-unified-file-explorer"
import { useViewingFile } from "@/hooks/use-viewing-file"
import { useUnlockedContent } from "@/hooks/use-unlocked-content"
import { useDownload } from "@/hooks/use-download"
import { HeaderActions } from "./unified-file-explorer/header-actions"
import { FileCard } from "./unified-file-explorer/file-card"
import { FileList } from "./unified-file-explorer/file-list"
import { PdfOverlay } from "./unified-file-explorer/pdf-overlay"
import { useUnlockToken } from "@/hooks/use-unlock-token"
import { FanWalletConnectModal } from "@/components/fan-wallet-connect-modal"
import { useFanWalletContext } from "@/components/fan-wallet-context"
import { HugeiconsIcon } from "@hugeicons/react"
import { StarAward01FreeIcons } from "@hugeicons/core-free-icons"

interface UnifiedFileExplorerProps {
  tokenId: string
  title: string
  files: FileItem[]
  linkType: "document" | "pack"
  fanWalletAddress: string
}

export function UnifiedFileExplorer({
  tokenId,
  title,
  files,
  linkType,
  fanWalletAddress,
}: UnifiedFileExplorerProps) {
  const [showFanConnectModal, setShowFanConnectModal] = useState(false)
  const hasShownModalRef = useRef(false)
  const { fanSmartAccountAddress } = useFanWalletContext()

  useEffect(() => {
    if (!fanSmartAccountAddress && !hasShownModalRef.current) {
      hasShownModalRef.current = true
      queueMicrotask(() => {
        setShowFanConnectModal(true)
      })
    }
  }, [fanSmartAccountAddress])

  const {
    account,
    selectedFile,
    isAuthorized,
    isWrongWallet,
    handleFileClick,
    setIsAuthorized,
  } = useUnifiedFileExplorer(fanWalletAddress)

  const effectiveFanAddress = fanSmartAccountAddress || fanWalletAddress

  const unlock = useUnlockToken(tokenId, linkType, effectiveFanAddress)
  const download = useDownload()
  const {
    content: unlockedContent,
    hydrated,
    storeContent,
  } = useUnlockedContent(tokenId)

  async function handleConfirm() {
    if (!fanSmartAccountAddress) {
      setShowFanConnectModal(true)
      return
    }

    if (isWrongWallet) {
      toast.error(
        "Wrong wallet. Please disconnect and reconnect with the correct account."
      )
      return
    }

    try {
      const response = await unlock.mutateAsync()
      storeContent(response)
      setIsAuthorized(true)
      toast.success("Access granted!")
    } catch (err: unknown) {
      console.error("unlock error", err)
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || "Failed to confirm access")
    }
  }

  const { viewingFileUrl, openViewer, closeViewer } = useViewingFile()

  useEffect(() => {
    if (unlockedContent) {
      setIsAuthorized(true)
    }
  }, [setIsAuthorized, unlockedContent])

  function onOpen(file: FileItem) {
    if (!unlockedContent) {
      console.warn("Content not unlocked yet")
      toast.warning("Please confirm access to view this file")
      return
    }

    let previewUrl: string | null = null

    if ("pageCount" in unlockedContent) {
      previewUrl = unlockedContent.previewUrl
    }

    if (previewUrl) {
      openViewer(previewUrl)
    } else {
      console.error("No preview URL available for file", file.id)
    }
  }

  function handlePreviewLoadError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error)

    if (/429|too many requests/i.test(message)) {
      toast.error("Too many preview requests", {
        description: "Try again in a minute.",
      })
      return
    }

    toast.error("Failed to load preview", {
      description: message || "Please try again.",
    })
  }

  function handleDownloadFile(file: FileItem) {
    void download
      .mutateAsync({
        tokenId,
        filename: linkType === "pack" ? `${title}.zip` : file.name || title,
      })
      .catch((err: unknown) => {
        console.error("download error", err)
        const message = err instanceof Error ? err.message : String(err)
        toast.error(message || "Failed to download content")
      })
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <FanWalletConnectModal
        isOpen={showFanConnectModal}
        onClose={() => setShowFanConnectModal(false)}
      />

      {!fanSmartAccountAddress && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mb-8 overflow-hidden"
        >
          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2">
                <HugeiconsIcon icon={StarAward01FreeIcons} />
              </div>
              <div>
                <p className="text-sm font-semibold">Connect Fan Wallet</p>
                <p className="text-xs text-muted-foreground">
                  Connect your wallet to verify ownership and access this
                  content
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <HeaderActions
        title={title}
        filesCount={files.length}
        isAuthorized={isAuthorized}
        isWrongWallet={isWrongWallet}
        onConfirm={handleConfirm}
        onDownload={() => {
          void download.mutateAsync({
            tokenId,
            filename: linkType === "pack" ? `${title}.zip` : title,
          })
        }}
        isAuthorizing={unlock.isAuthorizing}
        isDownloading={download.isDownloading}
      />

      <FileList
        files={files}
        onFileClick={(file) => handleFileClick({ file, tokenId, onOpen })}
        onDownload={handleDownloadFile}
        isAuthorized={isAuthorized}
        isDownloading={download.isDownloading}
      />

      {hydrated && !isAuthorized && files.length > 0 && (
        <section className="my-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="mt-4 font-sans text-xl font-semibold">
              {linkType === "pack" ? "Folder Contents" : "Included Assets"}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {files.map((file) => (
              <div key={file.id}>
                <FileCard
                  file={file}
                  onClick={(clickedFile) =>
                    handleFileClick({ file: clickedFile, tokenId, onOpen })
                  }
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {viewingFileUrl && selectedFile && (
        <PdfOverlay
          fileUrl={viewingFileUrl}
          fileName={selectedFile.name}
          onClose={closeViewer}
          watermark={account?.address || "Locked"}
          onLoadError={handlePreviewLoadError}
        />
      )}
    </div>
  )
}
