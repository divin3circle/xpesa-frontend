"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  IconPdf, 
  IconFileDescription, 
  IconPhoto, 
  IconFile, 
  IconFolder,
  IconDownload,
  IconEye,
  IconDotsVertical,
  IconSearch,
  IconFilter,
  IconClock,
  IconStar,
  IconArrowRight
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useActiveAccount } from "thirdweb/react"
import { SecurePdfViewer } from "./SecurePdfViewer"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type FileItem = {
  id: string
  name: string
  type: string
  size?: string
  modified?: string
  sharedBy?: string
}

interface UnifiedFileExplorerProps {
  tokenId: string
  title: string
  files: FileItem[]
  linkType: "document" | "pack"
  fanWalletAddress: string
}

export function UnifiedFileExplorer({ tokenId, title, files, linkType, fanWalletAddress }: UnifiedFileExplorerProps) {
  const account = useActiveAccount()
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const isWrongWallet = account?.address && fanWalletAddress && 
    account.address.toLowerCase() !== fanWalletAddress.toLowerCase()

  const getFileIcon = (fileName: string, size: "sm" | "lg" = "sm") => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    const className = size === "sm" ? "h-5 w-5" : "h-10 w-10"
    
    if (ext === "pdf") return <IconPdf className={cn(className, "text-rose-500")} />
    if (ext === "docx" || ext === "doc") return <IconFileDescription className={cn(className, "text-blue-500")} />
    if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) return <IconPhoto className={cn(className, "text-emerald-500")} />
    
    return <IconFile className={cn(className, "text-muted-foreground")} />
  }

  const handleFileClick = async (file: FileItem) => {
    if (!account?.address) {
      toast.error("Please connect your wallet first")
      return
    }

    setSelectedFile(file)
    setIsAuthenticating(true)

    try {
      // For now, we simulate the fetch since we need a signature for the real API
      // In a real scenario, we'd call the /api/packs/file/ endpoint
      const msg = `xpesa-open:${tokenId}`
      // This part would normally happen if we have the signature
      
      // For demonstration, we'll just show what would happen
      toast.info(`Opening ${file.name}...`)
      
      // If it's a PDF, we'd show the viewer
      if (file.name.endsWith(".pdf")) {
        // setViewingFileUrl(...)
      }
    } catch (error) {
      toast.error("Failed to open file")
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-10">
      {/* Wallet Warning Banner */}
      {isWrongWallet && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mb-8 overflow-hidden"
        >
          <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-4 border border-amber-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                <IconStar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">Wrong Wallet Connected</p>
                <p className="text-xs text-amber-700">
                  This content was purchased by <span className="font-mono">{fanWalletAddress.slice(0, 6)}...{fanWalletAddress.slice(-4)}</span>. 
                  Please switch accounts to view.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="rounded-xl border-amber-200 bg-white text-amber-700 hover:bg-amber-50">
              Switch Account
            </Button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#111827]">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {linkType === "pack" ? "Bundle" : "Document"} Explorer • {files.length} items
          </p>
        </div>
        <div className="flex gap-3">
          {!isAuthorized && !isWrongWallet && (
            <Button 
              onClick={() => setIsAuthorized(true)} // In real: trigger signature
              className="rounded-xl shadow-md bg-[#111827] hover:bg-[#1F2937]"
            >
              <IconEye className="mr-2 h-4 w-4" />
              Unlock Assets
            </Button>
          )}
          {isAuthorized && (
            <Button variant="outline" className="rounded-xl border-border/50 bg-white shadow-sm">
              <IconDownload className="mr-2 h-4 w-4" />
              Download All
            </Button>
          )}
        </div>
      </div>

      {/* Grid View (Folders/Suggested) */}
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {linkType === "pack" ? "Folder Contents" : "Asset Preview"}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {files.map((file, idx) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => handleFileClick(file)}
              className="group cursor-pointer"
            >
              <Card className="overflow-hidden border-none bg-white shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-0">
                  <div className="flex aspect-square flex-col items-center justify-center bg-[#FFFBEB] p-10">
                    <div className="relative">
                      <IconFolder className="h-24 w-24 text-[#FBBF24]" />
                      <div className="absolute inset-0 flex items-center justify-center pt-2">
                        {getFileIcon(file.name, "sm")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="truncate font-medium text-[#374151]">{file.name}</span>
                    <Badge variant="secondary" className="bg-[#F3F4F6] text-[#6B7280]">
                      {file.name.split(".").pop()?.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* List View (Table) */}
      <section>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">
            All Files
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search file..." 
                className="h-10 w-64 rounded-xl border-none bg-white pl-10 shadow-sm"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-none bg-white shadow-sm">
              <IconFilter className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-[#F9FAFB] text-muted-foreground">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="hidden px-6 py-4 font-medium md:table-cell">File Size</th>
                <th className="hidden px-6 py-4 font-medium lg:table-cell">Modified</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {files.map((file) => (
                <tr 
                  key={file.id} 
                  className="group cursor-pointer transition-colors hover:bg-[#F9FAFB]"
                  onClick={() => handleFileClick(file)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-[#F3F4F6] p-2">
                        {getFileIcon(file.name, "sm")}
                      </div>
                      <span className="font-medium text-[#111827]">{file.name}</span>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 text-muted-foreground md:table-cell">
                    {file.size || "2.4 MB"}
                  </td>
                  <td className="hidden px-6 py-4 text-muted-foreground lg:table-cell">
                    {file.modified || "12 Oct 2023"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100">
                      <IconDotsVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* PDF Viewer Overlay (if implemented) */}
      {viewingFileUrl && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 lg:p-10">
          <div className="relative h-full w-full max-w-5xl overflow-hidden rounded-3xl bg-white">
            <Button 
              variant="ghost" 
              className="absolute right-4 top-4 z-10"
              onClick={() => setViewingFileUrl(null)}
            >
              Close
            </Button>
            <div className="h-full w-full pt-12">
               <SecurePdfViewer fileUrl={viewingFileUrl} walletWatermark={account?.address || "Locked"} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
