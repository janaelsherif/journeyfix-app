import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SUBSCRIBE_SOURCES, type SubscribeSource } from "@/lib/subscribe-sources";

const bodySchema = z.object({
  email: z.string().email(),
  source: z
    .string()
    .refine((s): s is SubscribeSource => (SUBSCRIBE_SOURCES as readonly string[]).includes(s), {
      message: "Invalid source",
    }),
  marketingConsent: z.boolean().optional(),
});

/**
 * Brevo-ready subscription / lead capture (Nexilon-style).
 * Set BREVO_API_KEY to upsert contacts; optional BREVO_LIST_IDS (comma-separated)
 * for lists that should receive double opt-in when marketingConsent is true.
 */
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const { email, source, marketingConsent } = parsed.data;
  const apiKey = process.env.BREVO_API_KEY;

  if (apiKey) {
    const listIds = (process.env.BREVO_LIST_IDS || "")
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n));

    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        attributes: {
          SOURCE_JOURNEYFIX: source,
          MARKETING_OPT_IN: marketingConsent === true,
        },
        updateEnabled: true,
        ...(marketingConsent && listIds.length > 0 ? { listIds } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[subscribe] Brevo error", res.status, errText);
      return NextResponse.json(
        { ok: false, error: "Could not sync contact" },
        { status: 502 }
      );
    }
  } else {
    console.log("[subscribe] BREVO_API_KEY not set — accepted only:", { email, source, marketingConsent });
  }

  return NextResponse.json({ ok: true });
}
