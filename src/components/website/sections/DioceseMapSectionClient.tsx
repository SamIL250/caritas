"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  normalizeDioceseMapContent,
  type DioceseMapMarker,
  type DioceseMapSectionContent,
} from "@/lib/diocese-map-defaults";
import {
  buildHealthFacilityMapPoints,
  healthFacilityMarkerStyle,
  type HealthFacilityMapPoint,
} from "@/lib/diocese-health-facility-coords";
import { uniqueSorted } from "@/lib/diocese-health-facilities";

type NetworkTab = "map" | "health";

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

function loadMarkerClusterFromCdn(L: any): Promise<any> {
  const w = window as unknown as { L?: any };
  if (w.L?.markerClusterGroup) return Promise.resolve(w.L);

  return new Promise((resolve, reject) => {
    for (const [id, href] of [
      ["leaflet-cluster-css", "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"],
      [
        "leaflet-cluster-default-css",
        "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css",
      ],
    ] as const) {
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    }

    const jsId = "leaflet-cluster-js-caritas";
    const existing = document.getElementById(jsId) as HTMLScriptElement | null;
    const finish = () => {
      if (L.markerClusterGroup) resolve(L);
      else reject(new Error("MarkerCluster missing"));
    };

    if (existing) {
      if (L.markerClusterGroup) {
        finish();
        return;
      }
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("MarkerCluster script error")), {
        once: true,
      });
      return;
    }

    const s = document.createElement("script");
    s.id = jsId;
    s.async = true;
    s.src = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js";
    s.onload = finish;
    s.onerror = () => reject(new Error("MarkerCluster load failed"));
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
  const clusterRef = useRef<any>(null);
  const selectedIdRef = useRef<string | null>(null);
  const hideCardRef = useRef<() => void>(() => {});

  const [activeTab, setActiveTab] = useState<NetworkTab>("map");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [healthSearch, setHealthSearch] = useState("");
  const [healthDioceseFilter, setHealthDioceseFilter] = useState("");
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

  const healthPoints = useMemo(
    () => buildHealthFacilityMapPoints(c.health_facilities, c.dioceses),
    [c.health_facilities, c.dioceses],
  );

  const healthDioceses = useMemo(
    () => uniqueSorted(c.health_facilities.map((f) => f.diocese)),
    [c.health_facilities],
  );

  const filteredHealthPoints = useMemo(() => {
    const q = healthSearch.trim().toLowerCase();
    return healthPoints.filter((f) => {
      if (healthDioceseFilter && f.diocese !== healthDioceseFilter) return false;
      if (!q) return true;
      const haystack = [
        f.diocese,
        f.district,
        f.sector,
        f.name,
        f.facility_type,
        f.responsible,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [healthPoints, healthSearch, healthDioceseFilter]);

  const healthById = useMemo(() => {
    const m = new Map<string, HealthFacilityMapPoint>();
    for (const f of healthPoints) m.set(f.id, f);
    return m;
  }, [healthPoints]);

  const selectedDiocese = activeTab === "map" && selectedId ? dioceseById.get(selectedId) ?? null : null;
  const selectedHealth =
    activeTab === "health" && selectedId ? healthById.get(selectedId) ?? null : null;

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

    const latLng = typeof marker.getLatLng === "function" ? marker.getLatLng() : marker._latlng;
    if (!latLng) return;

    const pt = map.latLngToContainerPoint(latLng);
    const mw = shell.offsetWidth;
    const mh = shell.offsetHeight;
    const cw = 340;
    const ch = activeTab === "health" ? 280 : 370;
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
  }, [activeTab]);

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

  const selectHealthFacility = useCallback(
    (id: string) => {
      if (!healthById.has(id)) return;
      setSelectedId(id);
      const map = mapRef.current;
      const f = healthById.get(id);
      if (map && f) {
        map.flyTo([f.lat, f.lng], 12, { duration: 1.2 });
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(positionCard);
      });
    },
    [healthById, positionCard],
  );

  const selectDioceseRef = useRef(selectDiocese);
  selectDioceseRef.current = selectDiocese;
  const selectHealthRef = useRef(selectHealthFacility);
  selectHealthRef.current = selectHealthFacility;

  const mapConfigKey = useMemo(
    () =>
      JSON.stringify({
        tab: activeTab,
        lat: c.map_center_lat,
        lng: c.map_center_lng,
        z: c.map_zoom,
        dioceseIds: c.dioceses
          .map((x) => `${x.id}:${x.lat}:${x.lng}:${x.archdiocese ? 1 : 0}`)
          .join("|"),
        healthIds: filteredHealthPoints.map((x) => `${x.id}:${x.lat}:${x.lng}`).join("|"),
      }),
    [
      activeTab,
      c.map_center_lat,
      c.map_center_lng,
      c.map_zoom,
      c.dioceses,
      filteredHealthPoints,
    ],
  );

  useEffect(() => {
    const el = mapDivRef.current;
    if (!el) return;

    let cancelled = false;
    let mapInst: any = null;

    void (async () => {
      try {
        const L = await loadLeafletFromCdn();
        if (activeTab === "health") await loadMarkerClusterFromCdn(L);
        if (cancelled || !mapDivRef.current) return;

        if (!mapRef.current) {
          mapInst = L.map(mapDivRef.current, {
            center: [c.map_center_lat, c.map_center_lng],
            zoom: c.map_zoom,
            scrollWheelZoom: false,
          });

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

          mapRef.current = mapInst;
        } else {
          mapInst = mapRef.current;
        }

        if (clusterRef.current) {
          try {
            mapInst.removeLayer(clusterRef.current);
          } catch {
            /* noop */
          }
          clusterRef.current = null;
        }

        for (const marker of Object.values(markersRef.current)) {
          try {
            mapInst.removeLayer(marker);
          } catch {
            /* noop */
          }
        }
        markersRef.current = {};

        if (activeTab === "map") {
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
            markersRef.current[d.id] = marker;
          }
        } else {
          const cluster = L.markerClusterGroup({
            maxClusterRadius: 42,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
          });

          for (const f of filteredHealthPoints) {
            const style = healthFacilityMarkerStyle(f);
            const marker = L.circleMarker([f.lat, f.lng], {
              radius: style.radius,
              fillColor: style.fillColor,
              color: "#ffffff",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.92,
            });

            marker.on("click", (e: any) => {
              L.DomEvent.stopPropagation(e);
              selectHealthRef.current(f.id);
            });
            cluster.addLayer(marker);
            markersRef.current[f.id] = marker;
          }

          mapInst.addLayer(cluster);
          clusterRef.current = cluster;
        }
      } catch {
        /* CDN blocked / offline */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapConfigKey, c.map_center_lat, c.map_center_lng, c.map_zoom, c.dioceses, filteredHealthPoints, activeTab, positionCard]);

  useEffect(() => {
    return () => {
      markersRef.current = {};
      clusterRef.current = null;
      const map = mapRef.current;
      mapRef.current = null;
      if (map) {
        try {
          map.remove();
        } catch {
          /* noop */
        }
      }
    };
  }, []);

  useEffect(() => {
    setSelectedId(null);
    setCardStyle(null);
  }, [activeTab]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    requestAnimationFrame(() => {
      try {
        map.invalidateSize();
      } catch {
        /* map not ready */
      }
    });
  }, [activeTab]);

  const mapTabLabel = c.map_tab_label || "Diocesan Caritas";
  const healthTabLabel = c.health_tab_label || "Health Facilities";

  return (
    <section
      className="diocese-map-section"
      id={c.anchor_id || undefined}
      aria-label={
        activeTab === "health" ? "Diocesan health facilities map" : "Diocesan network map"
      }
    >
      <div className="diocese-map-header">
        <div className="diocese-map-eyebrow">
          <span className="diocese-map-eyebrow-dot" aria-hidden />
          {c.eyebrow}
        </div>
        <h2 className="diocese-map-title">
          {c.title_prefix} <span>{c.title_highlight}</span> {c.title_suffix}
        </h2>
        <p className="diocese-map-desc">
          {activeTab === "health" && c.health_description ? c.health_description : c.description}
        </p>

        <div className="diocese-network-tabs" role="tablist" aria-label="Network views">
          <button
            type="button"
            role="tab"
            id="diocese-network-tab-map"
            aria-selected={activeTab === "map"}
            aria-controls="diocese-network-panel"
            className={`diocese-network-tab${activeTab === "map" ? " is-active" : ""}`}
            onClick={() => setActiveTab("map")}
          >
            <i className="fa-solid fa-map-location-dot" aria-hidden />
            {mapTabLabel}
          </button>
          <button
            type="button"
            role="tab"
            id="diocese-network-tab-health"
            aria-selected={activeTab === "health"}
            aria-controls="diocese-network-panel"
            className={`diocese-network-tab${activeTab === "health" ? " is-active" : ""}`}
            onClick={() => setActiveTab("health")}
          >
            <i className="fa-solid fa-hospital" aria-hidden />
            {healthTabLabel}
          </button>
        </div>
      </div>

      <div
        className="diocese-map-inner"
        id="diocese-network-panel"
        role="tabpanel"
        aria-labelledby={activeTab === "health" ? "diocese-network-tab-health" : "diocese-network-tab-map"}
      >
        <div className="diocese-map-sidebar">
          {activeTab === "map" ? (
            <>
              <div className="diocese-sidebar-title">
                <i className="fa-solid fa-church" aria-hidden /> {c.select_label}
              </div>
              <ul className="diocese-list">
                {c.dioceses.map((d, idx) => (
                  <li
                    key={d.id}
                    className={`diocese-list-item${selectedId === d.id ? " active" : ""}`}
                  >
                    <button
                      type="button"
                      className="diocese-list-hit"
                      onClick={() => selectDiocese(d.id)}
                    >
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
            </>
          ) : (
            <>
              <div className="diocese-sidebar-title">
                <i className="fa-solid fa-hospital" aria-hidden /> {c.health_select_label}
              </div>
              <div className="diocese-health-sidebar-filters">
                <input
                  type="search"
                  className="diocese-health-sidebar-filters__input"
                  placeholder="Search facilities…"
                  value={healthSearch}
                  onChange={(e) => setHealthSearch(e.target.value)}
                  aria-label="Search health facilities"
                />
                <select
                  className="diocese-health-sidebar-filters__select"
                  value={healthDioceseFilter}
                  onChange={(e) => setHealthDioceseFilter(e.target.value)}
                  aria-label="Filter by diocese"
                >
                  <option value="">All dioceses</option>
                  {healthDioceses.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <p className="diocese-health-sidebar-count" aria-live="polite">
                {filteredHealthPoints.length} facilities
              </p>
              <ul className="diocese-list diocese-list--health">
                {filteredHealthPoints.map((f, idx) => (
                  <li
                    key={f.id}
                    className={`diocese-list-item${selectedId === f.id ? " active" : ""}`}
                  >
                    <button
                      type="button"
                      className="diocese-list-hit"
                      onClick={() => selectHealthFacility(f.id)}
                    >
                      <span className="diocese-num">{String(idx + 1).padStart(2, "0")}</span>
                      <span
                        className="diocese-health-type-dot"
                        style={{ background: healthFacilityMarkerStyle(f).fillColor }}
                        aria-hidden
                      />
                      <div className="diocese-list-name">
                        <strong>{f.name}</strong>
                        <span>
                          <i className="fa-solid fa-location-dot" aria-hidden />
                          {f.district}, {f.sector}
                        </span>
                        {f.facility_type ? (
                          <span className="diocese-health-list-type">{f.facility_type}</span>
                        ) : null}
                      </div>
                      <i className="fa-solid fa-chevron-right diocese-list-arrow" aria-hidden />
                    </button>
                  </li>
                ))}
                {filteredHealthPoints.length === 0 ? (
                  <li className="diocese-health-sidebar-empty">No facilities match your filters.</li>
                ) : null}
              </ul>
            </>
          )}
        </div>

        <div className="diocese-map-wrap">
          <div ref={shellRef} className="rwanda-map-shell">
            <div ref={mapDivRef} className="rwanda-map-canvas" />
            {activeTab === "map" && selectedDiocese && cardStyle ? (
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
                  {selectedDiocese.image ? (
                    <img
                      src={imgSrc(selectedDiocese.image)}
                      alt=""
                      className="lp-img"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="lp-body">
                  <div className="lp-title">
                    {selectedDiocese.name}
                    {selectedDiocese.archdiocese ? (
                      <span className="lp-arch">★ Archdiocese</span>
                    ) : null}
                  </div>
                  <div className="lp-city">
                    <i className="fa-solid fa-location-dot" aria-hidden /> {selectedDiocese.city}
                  </div>
                  {selectedDiocese.bishop ? (
                    <div className="lp-meta">
                      <i className="fa-solid fa-user-tie" aria-hidden /> {selectedDiocese.bishop}
                    </div>
                  ) : null}
                  {selectedDiocese.founded ? (
                    <div className="lp-meta">
                      <i className="fa-regular fa-calendar" aria-hidden /> Est.{" "}
                      {selectedDiocese.founded}
                    </div>
                  ) : null}
                  <div className="lp-desc">{selectedDiocese.description}</div>
                  <div className="lp-contacts">
                    {selectedDiocese.phone ? (
                      <a href={telHref(selectedDiocese.phone)} className="lp-contact-btn">
                        <i className="fa-solid fa-phone" aria-hidden /> {selectedDiocese.phone}
                      </a>
                    ) : null}
                    {selectedDiocese.website ? (
                      <a
                        href={selectedDiocese.website}
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
            {activeTab === "health" && selectedHealth && cardStyle ? (
              <div
                className="map-center-card map-center-card--health visible"
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
                <div className="lp-body lp-body--health">
                  <div className="lp-title">{selectedHealth.name}</div>
                  {selectedHealth.facility_type ? (
                    <div className="lp-health-badge">{selectedHealth.facility_type}</div>
                  ) : null}
                  <div className="lp-meta">
                    <i className="fa-solid fa-church" aria-hidden /> {selectedHealth.diocese}
                  </div>
                  <div className="lp-meta">
                    <i className="fa-solid fa-location-dot" aria-hidden /> {selectedHealth.district},{" "}
                    {selectedHealth.sector}
                  </div>
                  {selectedHealth.responsible ? (
                    <div className="lp-meta">
                      <i className="fa-solid fa-building" aria-hidden /> {selectedHealth.responsible}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div
            className={`diocese-info-bar${selectedDiocese || selectedHealth ? " has-data" : ""}`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {activeTab === "map" ? (
              !selectedDiocese ? (
                <>
                  <i
                    className="fa-solid fa-location-dot diocese-info-bar-icon-muted"
                    aria-hidden
                  />
                  <span>{c.empty_hint}</span>
                </>
              ) : (
                <>
                  {selectedDiocese.image ? (
                    <img
                      src={imgSrc(selectedDiocese.image)}
                      alt=""
                      className="diocese-info-img"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="diocese-info-bar-text">
                    <strong>
                      {selectedDiocese.name}
                      {selectedDiocese.archdiocese ? " ★" : ""}
                    </strong>
                    <p>{selectedDiocese.description}</p>
                    <div className="diocese-info-contacts">
                      {selectedDiocese.phone ? (
                        <a href={telHref(selectedDiocese.phone)} className="diocese-contact-link">
                          <i className="fa-solid fa-phone" aria-hidden /> {selectedDiocese.phone}
                        </a>
                      ) : null}
                      {selectedDiocese.website ? (
                        <a
                          href={selectedDiocese.website}
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
              )
            ) : !selectedHealth ? (
              <>
                <i className="fa-solid fa-hospital diocese-info-bar-icon-muted" aria-hidden />
                <span>{c.health_empty_hint}</span>
              </>
            ) : (
              <>
                <span
                  className="diocese-health-info-dot"
                  style={{ background: healthFacilityMarkerStyle(selectedHealth).fillColor }}
                  aria-hidden
                />
                <div className="diocese-info-bar-text">
                  <strong>{selectedHealth.name}</strong>
                  <p>
                    {selectedHealth.facility_type ? `${selectedHealth.facility_type} · ` : ""}
                    {selectedHealth.district}, {selectedHealth.sector} · {selectedHealth.diocese}
                    {selectedHealth.responsible ? ` · ${selectedHealth.responsible}` : ""}
                  </p>
                </div>
              </>
            )}
          </div>

          {activeTab === "health" ? (
            <div className="diocese-health-legend" aria-label="Facility legend">
              <span>
                <i style={{ background: "#1d6f42" }} aria-hidden /> Catholic
              </span>
              <span>
                <i style={{ background: "#2563eb" }} aria-hidden /> Public
              </span>
              <span>
                <i style={{ background: "#911313" }} aria-hidden /> Other
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
