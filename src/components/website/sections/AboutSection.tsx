'use client';

import { motion } from 'framer-motion';
import { AiOutlineAim, AiOutlineEye } from 'react-icons/ai';
import { MdGroups } from 'react-icons/md';
import Link from 'next/link';

/* ── Static data ── */

const satellites = [
  { number: '1', label: 'Caritas Rwanda', top: '12%', left: '28%', labelPos: 'top' as const },
  { number: '10', label: 'Diocesan Caritas', top: '12%', left: '58%', labelPos: 'top' as const },
  { number: '229', label: 'Parish Caritas', top: '42%', left: '82%', labelPos: 'right' as const },
  { number: '882', label: 'Sub-Parish Caritas', top: '68%', left: '72%', labelPos: 'right' as const },
  { number: '29,141', label: 'Basic Christian Community Caritas', top: '68%', left: '30%', labelPos: 'left' as const },
  { number: '56,345+', label: 'Volunteers', top: '42%', left: '8%', labelPos: 'left' as const },
];

const values = [
  'Advocacy', 'Compassion', 'Environment Protection', 'Equity', 'Hope',
  'Human Dignity', 'Justice', 'Service', 'Solidarity',
  'Stewardship and Accountability', 'Subsidiarity and Partnership',
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

/* ── Helper: satellite label ── */

function SatelliteLabel({ pos, label }: { pos: 'top' | 'right' | 'left'; label: string }) {
  const positionStyles: Record<string, React.CSSProperties> = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '12px' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '12px' },
  };

  return (
    <span
      className="absolute text-white text-[11px] font-semibold whitespace-nowrap pointer-events-none"
      style={positionStyles[pos]}
    >
      {label}
    </span>
  );
}

/* ── Component ── */

export default function AboutSection(_props: Record<string, unknown> = {}) {
  return (
    <section className="bg-[#B5272D] py-12 md:py-16">
      <div className="container mx-auto px-6">
        {/* ── Top heading ── */}
        <div className="mb-8 md:mb-10">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            About us
          </h2>
          <p className="text-white/80 text-base md:text-lg mt-3 max-w-2xl">
            Caritas Rwanda Interventions Scale Through Its Network
          </p>
        </div>

        {/* ── Desktop: diagram ── */}
        <div className="hidden md:block relative mx-auto" style={{ maxWidth: '700px', height: '600px' }}>
          {/* SVG connector lines */}
          <svg
            viewBox="0 0 700 600"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
            aria-hidden
          >
            {satellites.map((s, i) => {
              const cx = 350;
              const cy = 300;
              const sx = (parseFloat(s.left) / 100) * 700 + 40;
              const sy = (parseFloat(s.top) / 100) * 600 + 40;
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={sx}
                  y2={sy}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>

          {/* Large circle */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E8E0D5]"
            style={{ width: '420px', height: '420px', zIndex: 1 }}
          >
            {/* Our Mission */}
            <div
              className="absolute rounded-full bg-[#8B1A1A] flex flex-col items-center justify-center text-white text-center"
              style={{ width: '110px', height: '110px', top: '22%', left: '15%' }}
            >
              <span className="text-[10px] font-bold uppercase leading-tight">OUR</span>
              <span className="text-[10px] font-bold uppercase leading-tight">MISSION</span>
            </div>

            {/* Our Values */}
            <div
              className="absolute rounded-full bg-[#8B1A1A] flex flex-col items-center justify-center text-white text-center"
              style={{ width: '110px', height: '110px', top: '22%', right: '15%' }}
            >
              <span className="text-[10px] font-bold uppercase leading-tight">OUR</span>
              <span className="text-[10px] font-bold uppercase leading-tight">VALUES</span>
            </div>

            {/* Our Vision */}
            <div
              className="absolute rounded-full bg-[#8B1A1A] flex flex-col items-center justify-center text-white text-center"
              style={{ width: '110px', height: '110px', bottom: '22%', left: '50%', transform: 'translateX(-50%)' }}
            >
              <span className="text-[10px] font-bold uppercase leading-tight">OUR</span>
              <span className="text-[10px] font-bold uppercase leading-tight">VISION</span>
            </div>
          </div>

          {/* Satellite circles + labels */}
          {satellites.map((s, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="absolute"
              style={{ top: s.top, left: s.left, zIndex: 2 }}
            >
              <div className="relative">
                <SatelliteLabel pos={s.labelPos} label={s.label} />
                <div className="w-20 h-20 rounded-full bg-[#8B1A1A] flex items-center justify-center">
                  <span className="text-white font-black text-lg leading-none">{s.number}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Left info box */}
          <div
            className="absolute top-1/2 -translate-y-1/2 rounded-lg p-4 text-white"
            style={{ left: '-260px', width: '230px', backgroundColor: 'rgba(122,21,21,0.6)', zIndex: 3 }}
          >
            <AiOutlineAim className="text-white text-2xl mb-3" />
            <p className="text-sm leading-relaxed">
              To assist people in needs and promote their integral human development, drawing on the Charity as per the World of God.
            </p>
          </div>

          {/* Right info box */}
          <div
            className="absolute rounded-lg p-4 text-white"
            style={{ top: '8%', right: '-280px', width: '250px', backgroundColor: 'rgba(122,21,21,0.6)', zIndex: 3 }}
          >
            <MdGroups className="text-white text-2xl mb-3" />
            <ul className="space-y-1.5">
              {values.map((v, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-white mr-1.5">•</span>
                  {v}
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom eye + text + Read More */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
            style={{ bottom: '-80px', zIndex: 3 }}
          >
            <div className="w-11 h-11 rounded-full border border-white/50 flex items-center justify-center">
              <AiOutlineEye className="text-white text-[28px]" />
            </div>
            <p className="text-white text-sm font-semibold whitespace-nowrap" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Promoting Human Dignity for All
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-white text-white text-sm font-bold transition-colors hover:bg-white hover:text-[#B5272D]"
            >
              Read More
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        {/* ── Mobile: pills + grid + text ── */}
        <div className="md:hidden space-y-6">

          {/* Three pill badges */}
          <div className="flex flex-wrap gap-3 justify-center">
            {['Our Mission', 'Our Values', 'Our Vision'].map((label, i) => (
              <span
                key={i}
                className="px-5 py-2 rounded-full bg-[#8B1A1A] text-white text-sm font-bold"
              >
                {label}
              </span>
            ))}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {satellites.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <span className="text-white font-black text-lg leading-none">{s.number}</span>
                <span className="text-white/80 text-xs">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Mission text */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <AiOutlineAim className="text-white text-xl mb-2" />
            <p className="text-white text-sm leading-relaxed">
              To assist people in needs and promote their integral human development, drawing on the Charity as per the World of God.
            </p>
          </div>

          {/* Values list */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <MdGroups className="text-white text-xl mb-2" />
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {values.map((v, i) => (
                <li key={i} className="flex items-start gap-2 text-white text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70 mt-1.5 flex-shrink-0" />
                  {v}
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile bottom eye + text + Read More */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <div className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center">
              <AiOutlineEye className="text-white text-xl" />
            </div>
            <p className="text-white text-sm font-semibold">Promoting Human Dignity for All</p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-white text-white text-sm font-bold transition-colors hover:bg-white hover:text-[#B5272D]"
            >
              Read More
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
