import type { ReactNode } from "react"

import { ViewerFrame } from "@/components/viewer/viewer-frame"

export default function ViewTokenLayout({ children }: { children: ReactNode }) {
  return <ViewerFrame>{children}</ViewerFrame>
}
