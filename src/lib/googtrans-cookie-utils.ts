import { PAGE_LANGUAGE } from "@/lib/google-translate";

const COOKIE_EXPIRE = "Thu, 01 Jan 1970 00:00:00 GMT";

/** All path prefixes for a URL (/, /dashboard, /dashboard/pages, …). */
export function googTransCookiePaths(pathname: string): string[] {
  const paths = new Set<string>(["/"]);
  let current = pathname.trim() || "/";
  if (!current.startsWith("/")) current = `/${current}`;
  paths.add(current);
  let prefix = "";
  for (const segment of current.split("/").filter(Boolean)) {
    prefix += `/${segment}`;
    paths.add(prefix);
  }
  return [...paths];
}

/** Host + parent domain variants used by Google Translate. */
export function googTransCookieDomains(hostname: string): Array<string | undefined> {
  const domains = new Set<string | undefined>([undefined]);
  const host = hostname.trim();
  if (!host) return [...domains];
  domains.add(host);
  if (host.includes(".")) {
    domains.add(`.${host}`);
  }
  const parts = host.split(".").filter(Boolean);
  if (parts.length >= 2) {
    domains.add(`.${parts.slice(-2).join(".")}`);
  }
  return [...domains];
}

function secureSuffix(secure: boolean): string {
  return secure ? "; Secure" : "";
}

/** Build Set-Cookie header values that expire every googtrans variant. */
export function buildGoogTransClearSetCookies(
  hostname: string,
  pathname: string,
  secure: boolean,
): string[] {
  const securePart = secureSuffix(secure);
  const cookies: string[] = [];
  for (const domain of googTransCookieDomains(hostname)) {
    for (const path of googTransCookiePaths(pathname)) {
      const domainPart = domain ? `; Domain=${domain}` : "";
      cookies.push(
        `googtrans=; Path=${path}${domainPart}; Expires=${COOKIE_EXPIRE}; Max-Age=0; SameSite=Lax${securePart}`,
      );
      cookies.push(
        `googtrans=; Path=${path}${domainPart}; Expires=${COOKIE_EXPIRE}; Max-Age=0; SameSite=None${securePart}`,
      );
    }
  }
  return cookies;
}

/** Build Set-Cookie values that apply one googtrans on every path prefix. */
export function buildGoogTransSetCookies(
  targetLang: string,
  hostname: string,
  pathname: string,
  secure: boolean,
): string[] {
  const value = `/${PAGE_LANGUAGE}/${targetLang}`;
  const securePart = secureSuffix(secure);
  const cookies: string[] = [];
  for (const path of googTransCookiePaths(pathname)) {
    cookies.push(
      `googtrans=${value}; Path=${path}; Max-Age=31536000; SameSite=Lax${securePart}`,
    );
  }
  // Also set on parent domain when applicable (matches Google widget behaviour).
  for (const domain of googTransCookieDomains(hostname)) {
    if (!domain) continue;
    cookies.push(
      `googtrans=${value}; Path=/; Domain=${domain}; Max-Age=31536000; SameSite=Lax${securePart}`,
    );
  }
  return cookies;
}
