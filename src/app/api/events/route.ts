import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/analytics/record";
import { getSessionId } from "@/lib/session";
import type { FunnelEvent } from "@/lib/types";

const ALLOWED: FunnelEvent[] = [
  "landing",
  "started",
  "photo_uploaded",
  "request_completed",
  "generation_completed",
  "look_selected",
  "hotspot_opened",
  "retailer_clicked",
  "repeat_generation",
];

export async function POST(request: Request) {
  try {
    const { event, properties } = (await request.json()) as {
      event: FunnelEvent;
      properties?: Record<string, unknown>;
    };

    if (!ALLOWED.includes(event)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const sessionId = await getSessionId();
    await recordEvent(sessionId, event, properties ?? {});
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
