import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim() ?? "";
  const origin = req.nextUrl.origin;
  const bad = NextResponse.redirect(new URL("/newsletter/unsubscribed?ok=0", origin));
  const good = NextResponse.redirect(new URL("/newsletter/unsubscribed?ok=1", origin));

  if (!token || token.length > 128) return bad;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("newsletter_unsubscribe", { p_token: token });

  if (error || data !== true) return bad;
  return good;
}
