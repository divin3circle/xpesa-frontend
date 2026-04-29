"use client"

import { motion } from "framer-motion"
import { IconStar } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  useUnifiedFileExplorer,
  type FileItem,
} from "@/hooks/use-unified-file-explorer"
import { useViewingFile } from "@/hooks/use-viewing-file"
import { useUnlockedContent } from "@/hooks/use-unlocked-content"
import { HeaderActions } from "./unified-file-explorer/header-actions"
import { FileCard } from "./unified-file-explorer/file-card"
import { FileList } from "./unified-file-explorer/file-list"
import { PdfOverlay } from "./unified-file-explorer/pdf-overlay"
import { useUnlockToken } from "@/hooks/use-unlock-token"

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
  const {
    account,
    selectedFile,
    isAuthorized,
    isWrongWallet,
    handleFileClick,
    setIsAuthorized,
  } = useUnifiedFileExplorer(fanWalletAddress)

  const unlock = useUnlockToken(tokenId, linkType)
  const { storeContent } = useUnlockedContent()

  async function handleConfirm() {
    try {
      const response = await unlock.mutateAsync()
      storeContent(response)
      setIsAuthorized(true)
    } catch (err: unknown) {
      console.error("unlock error", err)
      const msg = err instanceof Error ? err.message : String(err)
      alert(msg || "Failed to confirm access")
    }
  }

  const { viewingFileUrl, openViewer, closeViewer } = useViewingFile()
  const { content: unlockedContent } = useUnlockedContent()

  function onOpen(file: FileItem) {
    if (!unlockedContent) {
      console.warn("Content not unlocked yet")
      return
    }

    let signedUrl: string | null = null

    // Check if it's document content (has signedUrl directly)
    if ("pageCount" in unlockedContent) {
      signedUrl = unlockedContent.signedUrl
    }

    if (signedUrl) {
      openViewer(signedUrl)
    } else {
      console.error("No signed URL available for file", file.id)
    }
  }

  function handleDownloadPack() {
    if (!unlockedContent || !("files" in unlockedContent)) {
      console.warn("Pack content not available")
      return
    }

    const packUrl = unlockedContent.signedUrl
    if (!packUrl) {
      console.error("No download URL available")
      return
    }

    // Create a temporary link and trigger download
    const link = document.createElement("a")
    link.href = packUrl
    link.download = `${unlockedContent.title}.zip` || "pack.zip"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      {isWrongWallet && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mb-8 overflow-hidden"
        >
          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2">
                <IconStar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Wrong Wallet Connected</p>
                <p className="text-xs text-amber-700">
                  This content was purchased by{" "}
                  <span className="font-mono">
                    {fanWalletAddress.slice(0, 6)}...
                    {fanWalletAddress.slice(-4)}
                  </span>
                  . Please switch accounts to view.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="rounded-xl">
              Switch Account
            </Button>
          </div>
        </motion.div>
      )}

      <HeaderActions
        title={title}
        filesCount={files.length}
        isAuthorized={isAuthorized}
        isWrongWallet={isWrongWallet}
        onConfirm={handleConfirm}
        onDownload={linkType === "pack" ? handleDownloadPack : undefined}
        isAuthorizing={unlock.isAuthorizing}
      />

      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold tracking-wider text-muted-foreground uppercase">
            {linkType === "pack" ? "Folder Contents" : "Asset Preview"}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
            >
              <FileCard
                file={file}
                onClick={(clickedFile) =>
                  handleFileClick({ file: clickedFile, tokenId, onOpen })
                }
              />
            </motion.div>
          ))}
        </div>
      </section>

      <FileList
        files={files}
        onFileClick={(file) => handleFileClick({ file, tokenId, onOpen })}
        isAuthorized={isAuthorized}
      />

      {viewingFileUrl && selectedFile && (
        <PdfOverlay
          fileUrl={viewingFileUrl}
          fileName={selectedFile.name}
          onClose={closeViewer}
          watermark={account?.address || "Locked"}
        />
      )}
    </div>
  )
}
