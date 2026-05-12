"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  normalizeDioceseMapContent,
  type DioceseMapMarker,
  type DioceseMapSectionContent,
} from "@/lib/diocese-map-defaults";

function imgSrc(src?: string): string {
  if (!src) return "";
  const t = src.trim();
  if (!t) return "";
  return t.startsWith("http") ? t : t.startsWith("/") ? t : `/${t}`;
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

function loadLeafletFromCdn(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  const w = window as unknown as { L?: any };
  if (w.L) return Promise.resolve(w.L);

  return new Promise((resolve, reject) => {
    const cssId = "leaflet-css-caritas";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const jsId = "leaflet-js-caritas";
    const existing = document.getElementById(jsId) as HTMLScriptElement | null;
    const finish = () => {
      const L = (window as unknown as { L?: any }).L;
      if (L) resolve(L);
      else reject(new Error("Leaflet missing"));
    };

    if (existing) {
      if ((window as unknown as { L?: any }).L) {
        finish();
        return;
      }
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("Leaflet script error")), {
        once: true,
      });
      return;
    }

    const s = document.createElement("script");
    s.id = jsId;
    s.async = true;
    s.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
    s.onload = finish;
    s.onerror = () => reject(new Error("Leaflet load failed"));
    document.body.appendChild(s);
  });
}

type Props = Partial<DioceseMapSectionContent> & Record<string, unknown>;

export default function DioceseMapSectionClient(raw: Props) {
  const stableKey = JSON.stringify(raw);
  const c = useMemo(() => normalizeDioceseMapContent(raw), [stableKey]);

  const shellRef = useRef<HTMLDivElement>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const selectedIdRef = useRef<string | null>(null);
  const hideCardRef = useRef<() => void>(() => {});

  const [selectedId, setSelectedId] = useState<string | null>(null);
  selectedIdRef.current = selectedId;

  const [cardStyle, setCardStyle] = useState<{
    left: number;
    top: number;
    transformOrigin: string;
  } | null>(null);

  const dioceseById = useMemo(() => {
    const m = new Map<string, DioceseMapMarker>();
    for (const d of c.dioceses) {
      if (d.lat && d.lng) m.set(d.id, d);
    }
    return m;
  }, [c.dioceses]);

  const selected = selectedId ? dioceseById.get(selectedId) ?? null : null;

  const hideCard = useCallback(() => {
    setSelectedId(null);
    setCardStyle(null);
  }, []);
  hideCardRef.current = hideCard;

  const positionCard = useCallback(() => {
    const map = mapRef.current;
    const shell = shellRef.current;
    const id = selectedIdRef.current;
    if (!map || !shell || !id) {
      setCardStyle(null);
      return;
    }
    const marker = markersRef.current[id];
    if (!marker) return;

    const pt = map.latLngToContainerPoint(marker.getLatLng());
    const mw = shell.offsetWidth;
    const mh = shell.offsetHeight;
    const cw = 300;
    const ch = 370;
    const gap = 16;
    const showAbove = pt.y - ch - gap >= 8;
    let top = showAbove ? pt.y - ch - gap : pt.y + gap;
    let left = pt.x - cw / 2;
    left = Math.max(8, Math.min(left, mw - cw - 8));
    top = Math.max(8, Math.min(top, mh - ch - 8));
    const originX = pt.x - left;
    const originY = showAbove ? "100%" : "0%";
    setCardStyle({
      left,
      top,
      transformOrigin: `${originX}px ${originY}`,
    });
  }, []);

  useEffect(() => {
    positionCard();
  }, [positionCard, selectedId]);

  const selectDiocese = useCallback(
    (id: string) => {
      if (!dioceseById.has(id)) return;
      setSelectedId(id);
      const map = mapRef.current;
      const d = dioceseById.get(id);
      if (map && d) {
        map.flyTo([d.lat, d.lng], 10, { duration: 1.2 });
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(positionCard);
      });
    },
    [dioceseById, positionCard],
  );

  const selectDioceseRef = useRef(selectDiocese);
  selectDioceseRef.current = selectDiocese;

  const mapConfigKey = useMemo(
    () =>
      JSON.stringify({
        lat: c.map_center_lat,
        lng: c.map_center_lng,
        z: c.map_zoom,
        ids: c.dioceses.map((x) => `${x.id}:${x.lat}:${x.lng}:${x.archdiocese ? 1 : 0}`).join("|"),
      }),
    [c.map_center_lat, c.map_center_lng, c.map_zoom, c.dioceses],
  );

  useEffect(() => {
    const el = mapDivRef.current;
    if (!el) return;

    let cancelled = false;
    let mapInst: any = null;
    markersRef.current = {};

    void (async () => {
      try {
        const L = await loadLeafletFromCdn();
        if (cancelled || !mapDivRef.current) return;

        mapInst = L.map(mapDivRef.current, {
          center: [c.map_center_lat, c.map_center_lng],
          zoom: c.map_zoom,
          scrollWheelZoom: false,
        });

        if (cancelled) {
          mapInst.remove();
          mapInst = null;
          return;
        }

        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: "&copy; OpenStreetMap &copy; CARTO",
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(mapInst);

        mapInst.on("click", () => {
          hideCardRef.current();
        });

        const onViewport = () => {
          positionCard();
        };
        mapInst.on("moveend", onViewport);
        mapInst.on("zoomend", onViewport);

        const markers: Record<string, any> = {};
        for (const d of c.dioceses) {
          if (!d.lat || !d.lng) continue;
          const marker = L.circleMarker([d.lat, d.lng], {
            radius: d.archdiocese ? 14 : 10,
            fillColor: d.archdiocese ? "#c0392b" : "#911313",
            color: "#ffffff",
            weight: 2.5,
            opacity: 1,
            fillOpacity: 0.92,
          }).addTo(mapInst);

          marker.on("click", (e: any) => {
            L.DomEvent.stopPropagation(e);
            selectDioceseRef.current(d.id);
          });
          markers[d.id] = marker;
        }

        markersRef.current = markers;
        mapRef.current = mapInst;
      } catch {
        /* CDN blocked / offline */
      }
    })();

    return () => {
      cancelled = true;
      markersRef.current = {};
      mapRef.current = null;
      if (mapInst) {
        try {
          mapInst.remove();
        } catch {
          /* noop */
        }
      }
    };
    }, [mapConfigKey, c.map_center_lat, c.map_center_lng, c.map_zoom, positionCard]);

  return (
    <section
      className="diocese-map-section"
      id={c.anchor_id || undefined}
      aria-label="Diocesan network map"
    >
      <div className="diocese-map-inner">
        <div className="diocese-map-sidebar">
          <div>
            <div className="diocese-map-eyebrow">
              <span className="diocese-map-eyebrow-dot" aria-hidden />
              {c.eyebrow}
            </div>
            <h2 className="diocese-map-title" style={{ marginTop: "0.7rem" }}>
              {c.title_prefix} <span>{c.title_highlight}</span>
              <br />
              {c.title_suffix}
            </h2>
            <p className="diocese-map-desc" style={{ marginTop: "0.8rem" }}>
              {c.description}
            </p>
          </div>
          <ul className="diocese-list">
            {c.dioceses.map((d, idx) => (
              <li
                key={d.id}
                className={`diocese-list-item${selectedId === d.id ? " active" : ""}`}
              >
                <button type="button" className="diocese-list-hit" onClick={() => selectDiocese(d.id)}>
                  <span className="diocese-num">{String(idx + 1).padStart(2, "0")}</span>
                  {d.image ? (
                    <img
                      src={imgSrc(d.image)}
                      alt=""
                      className="diocese-list-thumb"
                      loading="lazy"
                    />
                  ) : (
                    <span className="diocese-list-thumb diocese-list-thumb--empty" aria-hidden />
                  )}
                  <div className="diocese-list-name">
                    <strong>{d.name}</strong>
                    <span>
                      <i className="fa-solid fa-location-dot" aria-hidden />
                      {d.city}
                    </span>
                  </div>
                  <i className="fa-solid fa-chevron-right diocese-list-arrow" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="diocese-map-wrap">
          <div ref={shellRef} className="rwanda-map-shell">
            <div ref={mapDivRef} className="rwanda-map-canvas" />
            {selected && cardStyle ? (
              <div
                className="map-center-card visible"
                style={{
                  left: cardStyle.left,
                  top: cardStyle.top,
                  transformOrigin: cardStyle.transformOrigin,
                }}
              >
                <button
                  type="button"
                  className="map-card-close"
                  aria-label="Close"
                  onClick={(e) => {
                    e.stopPropagation();
                    hideCard();
                  }}
                >
                  <i className="fa-solid fa-xmark" aria-hidden />
                </button>
                <div className="lp-img-wrap">
                  {selected.image ? (
                    <img
                      src={imgSrc(selected.image)}
                      alt=""
                      className="lp-img"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="lp-body">
                  <div className="lp-title">
                    {selected.name}
                    {selected.archdiocese ? (
                      <span className="lp-arch">★ Archdiocese</span>
                    ) : null}
                  </div>
                  <div className="lp-city">
                    <i className="fa-solid fa-location-dot" aria-hidden /> {selected.city}
                  </div>
                  {selected.bishop ? (
                    <div className="lp-meta">
                      <i className="fa-solid fa-user-tie" aria-hidden /> {selected.bishop}
                    </div>
                  ) : null}
                  {selected.founded ? (
                    <div className="lp-meta">
                      <i className="fa-regular fa-calendar" aria-hidden /> Est. {selected.founded}
                    </div>
                  ) : null}
                  <div className="lp-desc">{selected.description}</div>
                  <div className="lp-contacts">
                    {selected.phone ? (
                      <a href={telHref(selected.phone)} className="lp-contact-btn">
                        <i className="fa-solid fa-phone" aria-hidden /> {selected.phone}
                      </a>
                    ) : null}
                    {selected.website ? (
                      <a
                        href={selected.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lp-contact-btn lp-web-btn"
                      >
                        <i className="fa-solid fa-globe" aria-hidden /> Website
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div
            className={`diocese-info-bar${selected ? " has-data" : ""}`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {!selected ? (
              <>
                <i className="fa-solid fa-location-dot diocese-info-bar-icon-muted" aria-hidden />
                <span>{c.empty_hint}</span>
              </>
            ) : (
              <>
                {selected.image ? (
                  <img
                    src={imgSrc(selected.image)}
                    alt=""
                    className="diocese-info-img"
                    loading="lazy"
                  />
                ) : null}
                <div className="diocese-info-bar-text">
                  <strong>
                    {selected.name}
                    {selected.archdiocese ? " ★" : ""}
                  </strong>
                  <p>{selected.description}</p>
                  <div className="diocese-info-contacts">
                    {selected.phone ? (
                      <a href={telHref(selected.phone)} className="diocese-contact-link">
                        <i className="fa-solid fa-phone" aria-hidden /> {selected.phone}
                      </a>
                    ) : null}
                    {selected.website ? (
                      <a
                        href={selected.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="diocese-contact-link"
                      >
                        <i className="fa-solid fa-globe" aria-hidden /> Visit website
                      </a>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
