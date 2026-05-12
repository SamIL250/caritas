import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type HealthResult = {
  ok: boolean;
  timestamp: string;
  environment: string;
  checks: {
    database: { ok: boolean; latencyMs: number; message?: string };
  };
  app: { node?: string; region?: string };
};

export async function GET() {
  const t0 = performance.now();
  let dbOk = false;
  let dbMessage: string | undefined;
  let latencyMs = 0;

  try {
    const supabase = await createClient();
    const tDb = performance.now();
    const { error } = await supabase.from("pages").select("id").limit(1);
    latencyMs = Math.round(performance.now() - tDb);
    if (error) {
      dbMessage = error.message;
    } else {
      dbOk = true;
    }
  } catch (e) {
    dbMessage = e instanceof Error ? e.message : "Database check failed";
  }

  const body: HealthResult = {
    ok: dbOk,
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    checks: {
      database: { ok: dbOk, latencyMs, message: dbMessage },
    },
    app: {
      node: process.version,
    },
  };

  return NextResponse.json(
    { ...body, _totalMs: Math.round(performance.now() - t0) },
    { status: 200 }
  );
}
