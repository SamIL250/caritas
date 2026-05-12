"use client";

import dynamic from "next/dynamic";

const DioceseMapSectionInner = dynamic(() => import("./DioceseMapSectionClient"), {
  ssr: false,
  loading: () => (
    <section className="diocese-map-section" aria-hidden>
      <div className="diocese-map-inner">
        <div className="diocese-map-sidebar min-h-[280px] animate-pulse rounded-[28px] bg-white/70" />
        <div className="diocese-map-wrap min-h-[560px] animate-pulse rounded-[28px] bg-white/40" />
      </div>
    </section>
  ),
});

export default function DioceseMapSection(props: Record<string, unknown>) {
  return <DioceseMapSectionInner {...props} />;
}
