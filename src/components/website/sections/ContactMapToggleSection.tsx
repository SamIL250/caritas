"use client";

import { useState, useRef, useEffect } from "react";
import ContactInfo from "@/components/website/sections/ContactInfo";
import OurLocationSection from "@/components/website/sections/OurLocationSection";

type ContactMapToggleProps = {
  contactProps?: Record<string, unknown>;
  mapProps?: Record<string, unknown>;
};

export default function ContactMapToggleSection({
  contactProps,
  mapProps,
}: ContactMapToggleProps) {
  const [showMap, setShowMap] = useState(false);
  const [trackHeight, setTrackHeight] = useState<number | 'auto'>('auto');
  const panel1Ref = useRef<HTMLDivElement>(null);
  const panel2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;
    
    const updateHeight = () => {
      const activeEl = showMap ? panel2Ref.current : panel1Ref.current;
      if (activeEl) {
        setTrackHeight(activeEl.offsetHeight);
      }
    };
    
    updateHeight();
    
    const activeEl = showMap ? panel2Ref.current : panel1Ref.current;
    if (activeEl && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });
      resizeObserver.observe(activeEl);
    }
    
    window.addEventListener("resize", updateHeight);
    
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [showMap]);

  return (
    <section className="cm-toggle-section" id="contact-find">
      <div className="cm-toggle-header">
        <button
          type="button"
          className={`cm-toggle-btn${!showMap ? " active" : ""}`}
          onClick={() => setShowMap(false)}
        >
          <i className="fa-solid fa-envelope" aria-hidden />
          Get in Touch
        </button>
        <button
          type="button"
          className={`cm-toggle-btn${showMap ? " active" : ""}`}
          onClick={() => setShowMap(true)}
        >
          <i className="fa-solid fa-location-dot" aria-hidden />
          Find Us
        </button>
      </div>

      <div 
        className="cm-toggle-track-wrap"
        style={{ 
          height: trackHeight, 
          transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
        }}
      >
        <div
          className="cm-toggle-track"
          style={{ transform: showMap ? "translateX(-50%)" : "translateX(0)", alignItems: 'flex-start' }}
        >
          <div className="cm-toggle-panel" ref={panel1Ref}>
            <div className="cm-toggle-panel-inner">
              <ContactInfo {...(contactProps ?? {})} />
            </div>
          </div>
          <div className="cm-toggle-panel" ref={panel2Ref}>
            <div className="cm-toggle-panel-inner cm-toggle-panel-inner--map">
              <OurLocationSection {...(mapProps ?? {})} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
