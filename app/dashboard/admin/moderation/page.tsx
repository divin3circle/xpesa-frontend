import { ModerationAdminView } from "@/components/admin/moderation/moderation-admin-view"

export default function AdminModerationPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Content moderation
        </h1>
        <p className="text-sm text-muted-foreground">
          Review creator links before they appear publicly.
        </p>
      </section>
      <ModerationAdminView />
    </div>
  )
}
