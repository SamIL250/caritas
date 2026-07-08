import { NextRequest, NextResponse } from "next/server";

import {
  PAGE_LANGUAGE,
  canonicalTranslateLangCode,
} from "@/lib/google-translate";
import {
  buildGoogTransClearSetCookies,
  buildGoogTransSetCookies,
} from "@/lib/googtrans-cookie-utils";

export async function POST(request: NextRequest) {
  let lang: string = PAGE_LANGUAGE;
  try {
    const body = (await request.json()) as { lang?: string };
    if (typeof body.lang === "string" && body.lang.trim()) {
      lang = canonicalTranslateLangCode(body.lang.trim());
    }
  } catch {
    /* default to English */
  }

  const isEnglish = lang.toLowerCase() === PAGE_LANGUAGE;
  const hostname = request.nextUrl.hostname;
  const secure = request.nextUrl.protocol === "https:";

  let pathname = "/";
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      pathname = new URL(referer).pathname || "/";
    } catch {
      pathname = "/";
    }
  }

  const headers = new Headers();
  for (const cookie of buildGoogTransClearSetCookies(hostname, pathname, secure)) {
    headers.append("Set-Cookie", cookie);
  }

  if (!isEnglish) {
    for (const cookie of buildGoogTransSetCookies(lang, hostname, pathname, secure)) {
      headers.append("Set-Cookie", cookie);
    }
  }

  return NextResponse.json(
    { ok: true, lang: isEnglish ? PAGE_LANGUAGE : lang },
    { headers },
  );
}
