import { Resend } from "resend";
import { translations } from "./translations";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendReportEmail(
  to: string,
  scanId: string,
  baseUrl: string,
  language: "de" | "en" = "de"
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const t = translations[language];
  const reportUrl = `${baseUrl}/report/${scanId}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "JourneyFix <onboarding@resend.dev>",
    to,
    subject: t.emailSubject,
    html: `
      <h2>${t.emailHeading}</h2>
      <p>${t.emailBody}</p>
      <p><a href="${reportUrl}" style="background:#0f172a;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;">${t.emailCta}</a></p>
      <p>${t.emailCopyLink}: ${reportUrl}</p>
      <p>${t.emailSignature}<br>JourneyFix.ch</p>
    `,
  });
}
