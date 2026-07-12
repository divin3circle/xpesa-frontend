"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import {
  useUnifiedFileExplorer,
  type FileItem,
} from "@/hooks/use-unified-file-explorer"
import { useViewingFile } from "@/hooks/use-viewing-file"
import { useUnlockedContent } from "@/hooks/use-unlocked-content"
import { useDownload } from "@/hooks/use-download"
import { useTokenOnlyAutoUnlock } from "@/hooks/use-token-only-auto-unlock"
import { useViewerFileActions } from "@/hooks/use-viewer-file-actions"
import { AccessConnectBanner } from "./unified-file-explorer/access-connect-banner"
import { HeaderActions } from "./unified-file-explorer/header-actions"
import { FileList } from "./unified-file-explorer/file-list"
import { LockedFilesPreview } from "./unified-file-explorer/locked-files-preview"
import { PdfOverlay } from "./unified-file-explorer/pdf-overlay"
import { ImageOverlay } from "./unified-file-explorer/image-overlay"
import { VideoOverlay } from "./unified-file-explorer/video-overlay"
import { useUnlockToken } from "@/hooks/use-unlock-token"
import { FanWalletConnectModal } from "@/components/fan-wallet-connect-modal"
import { useFanWalletContext } from "@/components/fan-wallet-context"

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
  const wrongWalletModalRef = useRef<string | null>(null)
  const { fanSmartAccountAddress } = useFanWalletContext()
  const isTokenOnlyAccess =
    fanWalletAddress.startsWith("kotani:") || fanWalletAddress.startsWith("free:")

  useEffect(() => {
    if (
      !isTokenOnlyAccess &&
      !fanSmartAccountAddress &&
      !hasShownModalRef.current
    ) {
      hasShownModalRef.current = true
      queueMicrotask(() => {
        setShowFanConnectModal(true)
      })
    }
  }, [fanSmartAccountAddress, isTokenOnlyAccess])

  const {
    account,
    selectedFile,
    isAuthorized,
    isWrongWallet,
    handleFileClick,
    setIsAuthorized,
  } = useUnifiedFileExplorer(
    fanWalletAddress,
    isTokenOnlyAccess,
    fanSmartAccountAddress
  )

  useEffect(() => {
    if (!isWrongWallet || !fanSmartAccountAddress) return

    const connectedWallet = fanSmartAccountAddress.toLowerCase()
    if (wrongWalletModalRef.current === connectedWallet) return

    wrongWalletModalRef.current = connectedWallet
    queueMicrotask(() => {
      setShowFanConnectModal(true)
    })
  }, [fanSmartAccountAddress, isWrongWallet])

  const effectiveFanAddress = isTokenOnlyAccess
    ? fanSmartAccountAddress || fanWalletAddress
    : fanSmartAccountAddress

  const unlock = useUnlockToken(tokenId, linkType, effectiveFanAddress ?? undefined)
  const download = useDownload()
  const {
    content: unlockedContent,
    hydrated,
    storeContent,
  } = useUnlockedContent(tokenId)

  async function handleConfirm() {
    if (!isTokenOnlyAccess && !fanSmartAccountAddress) {
      setShowFanConnectModal(true)
      return
    }

    if (isWrongWallet) {
      setShowFanConnectModal(true)
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
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || "Failed to confirm access")
    }
  }

  const { viewingFileUrl, openViewer, closeViewer } = useViewingFile()
  const { onOpen, handlePreviewLoadError, handleDownloadFile } =
    useViewerFileActions({
      unlockedContent,
      openViewer,
      download,
      tokenId,
      linkType,
      title,
    })

  useEffect(() => {
    if (unlockedContent) {
      setIsAuthorized(true)
    }
  }, [setIsAuthorized, unlockedContent])

  useTokenOnlyAutoUnlock({
    enabled: isTokenOnlyAccess,
    hydrated,
    unlockedContent,
    unlock,
    storeContent,
    setIsAuthorized,
  })

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <FanWalletConnectModal
        isOpen={showFanConnectModal}
        onCloseAction={() => setShowFanConnectModal(false)}
      />

      {!isTokenOnlyAccess && !fanSmartAccountAddress && <AccessConnectBanner />}

      <HeaderActions
        title={title}
        filesCount={files.length}
        isAuthorized={isAuthorized}
        isWrongWallet={isWrongWallet}
        onConfirm={handleConfirm}
        onDownload={
          linkType === "pack"
            ? undefined
            : () => {
                void download.mutateAsync({ tokenId, filename: title })
              }
        }
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
        <LockedFilesPreview
          files={files}
          linkType={linkType}
          onFileClick={(file) => handleFileClick({ file, tokenId, onOpen })}
        />
      )}

      {viewingFileUrl && selectedFile?.type === "pdf" && (
        <PdfOverlay
          fileUrl={viewingFileUrl}
          fileName={selectedFile.name}
          onCloseAction={closeViewer}
          watermark={account?.address || "Locked"}
          onLoadErrorAction={handlePreviewLoadError}
        />
      )}

      {viewingFileUrl && selectedFile?.type === "image" && (
        <ImageOverlay
          fileUrl={viewingFileUrl}
          fileName={selectedFile.name}
          onCloseAction={closeViewer}
        />
      )}

      {viewingFileUrl && selectedFile?.type === "video" && (
        <VideoOverlay
          fileUrl={viewingFileUrl}
          fileName={selectedFile.name}
          onCloseAction={closeViewer}
        />
      )}
    </div>
  )
}
