"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { FileText, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react"

import { ExpiryOverlay } from "@/components/viewer/ExpiryOverlay"
import { WrongWalletMessage } from "@/components/viewer/WrongWalletMessage"
import { ViewerHeroCard } from "@/components/viewer/viewer-hero-card"
import { DocumentErrorScreen } from "@/components/viewer/document-session/error-screen"
import { DocumentReaderPane } from "@/components/viewer/document-session/reader-pane"
import { DocumentSummarySidebar } from "@/components/viewer/document-session/summary-sidebar"
import { DocumentWalletSignStep } from "@/components/viewer/document-session/wallet-sign-step"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionManagementTable } from "@/components/ui/transaction-management-table"
import { useViewDocumentSession } from "@/hooks/use-view-document-session"
import { documentTransactions, viewerDocumentMock } from "@/lib/mock/view"

export function DocumentSession() {
  const params = useParams<{ tokenId: string }>()
  const tokenId = params?.tokenId

  const session = useViewDocumentSession(tokenId)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const shouldBlock =
        (event.metaKey || event.ctrlKey) && (key === "s" || key === "p")
      if (shouldBlock) {
        event.preventDefault()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  if (session.error === "expired") {
    return <ExpiryOverlay linkId={session.linkId} />
  }

  if (session.error === "wrong_wallet") {
    return <WrongWalletMessage requiredWallet={session.requiredWallet} />
  }

  if (session.error === "view_limit_reached") {
    return (
      <DocumentErrorScreen
        title="View limit reached"
        description="This document has reached its maximum opens."
      />
    )
  }

  if (session.error === "ip_mismatch") {
    return (
      <DocumentErrorScreen
        title="IP mismatch detected"
        description="This link is restricted to the network used at payment time."
      />
    )
  }

  return (
    <div className="space-y-6">
      <ViewerHeroCard
        title={session.title}
        description={viewerDocumentMock.description}
        badges={[
          viewerDocumentMock.fileTypeLabel,
          `${viewerDocumentMock.pageCount} pages`,
          viewerDocumentMock.fileSizeLabel,
          `Expires in ${session.expiresIn}`,
        ]}
        footer={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              <LockKeyhole className="mr-1 h-3.5 w-3.5" />
              Protected by token
            </Badge>
            <Badge variant="secondary">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              Watermark enabled
            </Badge>
            <Badge variant="secondary">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Download blocked
            </Badge>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-border/70">
            <CardHeader className="space-y-4 border-b bg-muted/20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-primary" />
                    {viewerDocumentMock.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Sign in with the correct wallet to unlock the viewer.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{session.expiresIn}</Badge>
                  {typeof session.viewsRemaining === "number" ? (
                    <Badge variant="secondary">
                      {session.viewsRemaining} opens left
                    </Badge>
                  ) : null}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              {!session.walletAddress || !session.signature ? (
                <DocumentWalletSignStep
                  walletAddress={session.walletAddress}
                  setWalletAddress={session.setWalletAddress}
                  signingState={session.signingState}
                  onSign={session.signSession}
                />
              ) : session.signingState === "signed" ? (
                <DocumentReaderPane
                  status={session.status}
                  pageUrls={session.pageUrls}
                  watermarkText={session.watermarkText}
                  walletAddress={session.walletAddress}
                  onOpen={session.openDocument}
                  onReset={session.resetSession}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="p-6">
              <TransactionManagementTable
                title="Recent document opens"
                description="Last confirmed unlocks for this protected document"
                transactions={documentTransactions}
                historyHref={`/view/${tokenId}/document`}
              />
            </CardContent>
          </Card>
        </div>

        <DocumentSummarySidebar
          tokenId={tokenId}
          expiresIn={session.expiresIn}
          viewsRemaining={session.viewsRemaining}
        />
      </div>
    </div>
  )
}
