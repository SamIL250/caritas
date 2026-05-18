'use client';

import { useEffect, useRef } from 'react';

export type KpiItem = {
  id: string;
  icon: string;
  value: string;
  label: string;
  color: string;
  sort_order: number;
};

function CountUp({ target, duration = 1400 }: { target: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const numMatch = target.match(/[\d,]+/);
    if (!numMatch) {
      el.textContent = target;
      return;
    }

    const numStr = numMatch[0].replace(/,/g, '');
    const num = parseFloat(numStr);
    const prefix = target.slice(0, target.indexOf(numMatch[0]));
    const suffix = target.slice(target.indexOf(numMatch[0]) + numMatch[0].length);

    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * num);
      const formatted = current >= 1000 ? current.toLocaleString() : String(current);
      el.textContent = `${prefix}${formatted}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return <span ref={ref}>{target}</span>;
}

export default function MetricsKpiStrip({ items }: { items: KpiItem[] }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!stripRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          stripRef.current
            ?.querySelectorAll<HTMLElement>('.kpi-val')
            .forEach((el) => {
              el.dataset.animate = 'true';
            });
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(stripRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="metrics-kpi-strip" ref={stripRef}>
      <div className="metrics-kpi-inner">
        {items.map((kpi) => (
          <div className="metrics-kpi-card" key={kpi.id} style={{ '--kpi-color': kpi.color } as React.CSSProperties}>
            <div className="metrics-kpi-icon">
              <i className={`fa-solid ${kpi.icon}`} aria-hidden />
            </div>
            <div className="metrics-kpi-val kpi-val">
              <CountUp target={kpi.value} />
            </div>
            <div className="metrics-kpi-label">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
