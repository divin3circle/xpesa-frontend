"use client"

import { useMemo, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"

import { Button } from "@/components/ui/button"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type SecurePdfViewerProps = {
  fileUrl: string
  walletWatermark: string
}

export function SecurePdfViewer({
  fileUrl,
  walletWatermark,
}: SecurePdfViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [zoom, setZoom] = useState(1)

  const pageLabel = useMemo(() => {
    if (!numPages) return "Page 1 of 1"
    return `Page ${pageNumber} of ${numPages}`
  }, [numPages, pageNumber])

  return (
    <div
      className="space-y-3"
      onContextMenu={(event) => event.preventDefault()}
    >
      <style>{"@media print { body { display: none } }"}</style>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-2">
        <div className="text-sm text-muted-foreground">{pageLabel}</div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
          >
            Prev
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={numPages > 0 ? pageNumber >= numPages : false}
            onClick={() =>
              setPageNumber((current) =>
                numPages ? Math.min(numPages, current + 1) : current + 1
              )
            }
          >
            Next
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setZoom((current) => Math.max(0.8, current - 0.1))}
          >
            -
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setZoom((current) => Math.min(2, current + 0.1))}
          >
            +
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-[65vh] items-center justify-center overflow-auto rounded-2xl border p-2">
        <Document
          file={fileUrl}
          loading={
            <p className="text-sm text-muted-foreground">Loading document...</p>
          }
          onLoadSuccess={({ numPages: loadedPages }) => {
            setNumPages(loadedPages)
            setPageNumber(1)
          }}
          onLoadError={() => {
            setNumPages(0)
          }}
        >
          <Page
            pageNumber={pageNumber}
            scale={zoom}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
        <p className="pointer-events-none absolute right-4 bottom-4 font-mono text-xs text-black/20 select-none">
          {walletWatermark}
        </p>
      </div>
    </div>
  )
}
