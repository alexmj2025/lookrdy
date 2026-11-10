import { NextResponse } from "next/server";
import { accountReturnPath } from "@/lib/onboarding/accountPaths";
import { getSupabaseUserClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = accountReturnPath(url.searchParams.get("next"));
  const client = code ? await getSupabaseUserClient() : null;
  if (client && code && !(await client.auth.exchangeCodeForSession(code)).error) {
    return NextResponse.redirect(new URL(next, url));
  }
  return NextResponse.redirect(new URL("/account?confirmation=failed", url));
}
