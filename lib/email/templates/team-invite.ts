export function teamInviteEmail(input: {
  inviterName: string
  teamName: string
  acceptUrl: string
}) {
  const subject = `${input.inviterName} invited you to ${input.teamName} on Xpesa`
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
    <h1 style="font-size:20px;margin:0 0 8px">You've been invited to a team</h1>
    <p style="font-size:14px;line-height:1.5;color:#444;margin:0 0 16px">
      <strong>${input.inviterName}</strong> invited you to join
      <strong>${input.teamName}</strong> on Xpesa to view their creator analytics.
    </p>
    <a href="${input.acceptUrl}"
       style="display:inline-block;background:#0b3d2e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:600">
      View invitation
    </a>
    <p style="font-size:12px;color:#888;margin:20px 0 0">
      If you weren't expecting this, you can safely ignore this email.
    </p>
  </div>`
  return { subject, html }
}
