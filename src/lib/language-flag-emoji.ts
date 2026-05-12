/** Map language / locale codes to an ISO 3166-1 alpha-2 region for flag emoji (best-effort). */
const LANG_TO_REGION: Record<string, string> = {
  en: "GB",
  fr: "FR",
  de: "DE",
  es: "ES",
  it: "IT",
  pt: "PT",
  nl: "NL",
  da: "DK",
  sv: "SE",
  no: "NO",
  nb: "NO",
  nn: "NO",
  fi: "FI",
  is: "IS",
  pl: "PL",
  cs: "CZ",
  sk: "SK",
  hu: "HU",
  ro: "RO",
  bg: "BG",
  hr: "HR",
  sr: "RS",
  bs: "BA",
  sl: "SI",
  uk: "UA",
  ru: "RU",
  be: "BY",
  et: "EE",
  lv: "LV",
  lt: "LT",
  el: "GR",
  tr: "TR",
  sq: "AL",
  mk: "MK",
  mt: "MT",
  ga: "IE",
  cy: "GB",
  gd: "GB",
  ca: "ES",
  eu: "ES",
  gl: "ES",
  lb: "LU",
  iw: "IL",
  he: "IL",
  ar: "SA",
  fa: "IR",
  ps: "AF",
  ur: "PK",
  hi: "IN",
  bn: "BD",
  ta: "IN",
  te: "IN",
  mr: "IN",
  gu: "IN",
  kn: "IN",
  ml: "IN",
  pa: "IN",
  si: "LK",
  ne: "NP",
  my: "MM",
  th: "TH",
  lo: "LA",
  km: "KH",
  vi: "VN",
  id: "ID",
  ms: "MY",
  tl: "PH",
  fil: "PH",
  jv: "ID",
  jw: "ID",
  zh: "CN",
  "zh-cn": "CN",
  "zh-tw": "TW",
  ja: "JP",
  ko: "KR",
  mn: "MN",
  ka: "GE",
  hy: "AM",
  az: "AZ",
  kk: "KZ",
  ky: "KG",
  uz: "UZ",
  tk: "TM",
  tg: "TJ",
  ku: "IQ",
  ckb: "IQ",
  am: "ET",
  ti: "ER",
  om: "ET",
  sw: "TZ",
  rw: "RW",
  ln: "CD",
  lg: "UG",
  ha: "NG",
  ig: "NG",
  yo: "NG",
  zu: "ZA",
  xh: "ZA",
  af: "ZA",
  st: "ZA",
  tn: "BW",
  mg: "MG",
  ny: "MW",
  sn: "ZW",
  so: "SO",
};

function regionalIndicatorEmoji(regionAlpha2: string): string {
  const r = regionAlpha2.toUpperCase();
  if (r.length !== 2 || !/^[A-Z]{2}$/.test(r)) return "🌐";
  const base = 0x1f1e6;
  return String.fromCodePoint(base + (r.charCodeAt(0) - 65), base + (r.charCodeAt(1) - 65));
}

const BASE_INFER: Record<string, string> = {
  eo: "EU",
  la: "VA",
  bo: "CN",
  yi: "IL",
};

/** Circular flag-style emoji for language picker (fallback 🌐 when unknown). */
export function languageFlagEmoji(langCode: string): string {
  if (!langCode.trim()) return "🌐";
  const raw = langCode.trim();
  const keyFull = raw.toLowerCase().replace(/_/g, "-");
  const base = keyFull.split("-")[0].toLowerCase();

  if (keyFull === "en" || base === "en") return regionalIndicatorEmoji("GB");

  const region =
    LANG_TO_REGION[keyFull] ??
    LANG_TO_REGION[base] ??
    BASE_INFER[base] ??
    (base.length === 2 ? base.toUpperCase() : "");

  if (!region) return "🌐";
  return regionalIndicatorEmoji(region);
}
