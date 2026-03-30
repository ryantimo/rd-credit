import { Resend } from "resend"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "timonian.98@gmail.com"
const FROM = "CreditIQ <onboarding@resend.dev>"

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

export async function notifyNewUser(name: string, email: string, firm?: string | null) {
  const resend = getResend(); if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `🆕 New signup: ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px">
        <h2 style="color:#6366f1">New CreditIQ signup</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280">Name</td><td style="font-weight:600">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Email</td><td>${email}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Firm</td><td>${firm ?? "—"}</td></tr>
        </table>
      </div>
    `,
  })
}

export async function notifyNewFiling(
  cpaName: string, cpaEmail: string,
  clientName: string, taxYear: number
) {
  const resend = getResend(); if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `📁 New filing: ${clientName} (${taxYear})`,
    html: `
      <div style="font-family:sans-serif;max-width:480px">
        <h2 style="color:#6366f1">New R&D filing started</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280">CPA</td><td style="font-weight:600">${cpaName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">CPA email</td><td>${cpaEmail}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Client</td><td style="font-weight:600">${clientName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Tax year</td><td>${taxYear}</td></tr>
        </table>
      </div>
    `,
  })
}

export async function notifyFilingComplete(
  cpaName: string, cpaEmail: string,
  clientName: string, taxYear: number,
  creditAmount: number, method: string
) {
  const resend = getResend(); if (!resend) return
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `✅ Filing complete: ${clientName} — ${fmt(creditAmount)} credit`,
    html: `
      <div style="font-family:sans-serif;max-width:480px">
        <h2 style="color:#10b981">Filing completed</h2>
        <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0">
          <div style="font-size:13px;color:#16a34a">Estimated R&D Credit</div>
          <div style="font-size:32px;font-weight:700;color:#15803d">${fmt(creditAmount)}</div>
          <div style="font-size:12px;color:#16a34a">Method: ${method.toUpperCase()}</div>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280">CPA</td><td style="font-weight:600">${cpaName} (${cpaEmail})</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Client</td><td style="font-weight:600">${clientName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Tax year</td><td>${taxYear}</td></tr>
        </table>
      </div>
    `,
  })
}
