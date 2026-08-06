"use client"

import Link from "next/link"
import { Download, FileSpreadsheet, NotebookPen } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const cardBase = "rounded-2xl border border-border/70 bg-transparent shadow-none"

export function QuestIntegrationsCard({ questId }: { questId: string }) {
  return (
    <Card className={cardBase}>
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg">Integrations</CardTitle>
        <CardDescription>
          Send submissions to your favourite tools. More coming soon.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <Download className="size-4" />
            <span className="font-medium">CSV export</span>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href={`/api/quests/${questId}/review/export`}>Export</Link>
          </Button>
        </div>

        <IntegrationRow
          icon={<FileSpreadsheet className="size-4" />}
          label="Google Sheets"
          detail="Sync submissions to a sheet"
        />
        <IntegrationRow
          icon={<NotebookPen className="size-4" />}
          label="Notion"
          detail="Send submissions to Notion"
        />
      </CardContent>
    </Card>
  )
}

function IntegrationRow({
  icon,
  label,
  detail,
}: {
  icon: React.ReactNode
  label: string
  detail: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </div>
      <Badge variant="secondary">Coming soon</Badge>
    </div>
  )
}
