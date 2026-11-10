import { NextResponse } from "next/server";
import { accountRequired, beginLookTrial } from "@/lib/guestTrial";

export const runtime = "nodejs";

export async function POST() {
  const trial = await beginLookTrial("wardrobe");
  return trial.allowed
    ? NextResponse.json({ ok: true })
    : NextResponse.json(accountRequired, { status: 403 });
}
