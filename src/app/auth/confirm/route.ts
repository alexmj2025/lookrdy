import { NextResponse } from "next/server";
import { accountReturnPath, passwordResetPath } from "@/lib/onboarding/accountPaths";
import { getSupabaseUserClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const flowId = url.searchParams.get("sb_flow_id");
  const client = code ? await getSupabaseUserClient() : null;
  if (client && code) {
    const { data, error } = await client.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
    if (!error && data.session) {
      if ("redirectType" in data && data.redirectType === "recovery") {
        return NextResponse.redirect(new URL(`${passwordResetPath}?link=ready`, url));
      }
      if (next !== passwordResetPath) {
        return NextResponse.redirect(new URL(accountReturnPath(next), url));
      }
    }
  }
  if (next === passwordResetPath) {
    return NextResponse.redirect(new URL(`${passwordResetPath}?link=invalid`, url));
  }
  return NextResponse.redirect(new URL("/account?confirmation=failed", url));
}
