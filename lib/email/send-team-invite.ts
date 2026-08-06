import { resend } from "@/lib/email/resend"
import { envConfig } from "@/lib/env"
import { teamInviteEmail } from "@/lib/email/templates/team-invite"

/** Best-effort: never throws into the invite flow; no-ops if Resend is unconfigured. */
export async function sendTeamInviteEmail(input: {
  to: string
  inviterName: string
  teamName: string
}) {
  if (!resend || !input.to) return
  const acceptUrl = `${envConfig.EMAIL_APP_URL}/dashboard/notifications`
  const { subject, html } = teamInviteEmail({
    inviterName: input.inviterName,
    teamName: input.teamName,
    acceptUrl,
  })
  try {
    await resend.emails.send({
      from: envConfig.EMAIL_FROM,
      to: input.to,
      subject,
      html,
    })
  } catch (error) {
    console.error("sendTeamInviteEmail failed:", error)
  }
}
