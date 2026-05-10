"use client";

import { EmailCaptureWidget } from "@/components/EmailCaptureWidget";

/** Home page Nexilon-style footer capture (source-tagged for follow-up). */
export function CommunitySubscribe() {
  return <EmailCaptureWidget source="journeyfix_footer" variant="panel" className="py-12" />;
}
