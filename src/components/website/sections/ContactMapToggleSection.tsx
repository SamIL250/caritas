"use client";

import { useState } from "react";
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

      <div className="cm-toggle-track-wrap">
        <div
          className="cm-toggle-track"
          style={{ transform: showMap ? "translateX(-50%)" : "translateX(0)" }}
        >
          <div className="cm-toggle-panel">
            <div className="cm-toggle-panel-inner">
              <ContactInfo {...(contactProps ?? {})} />
            </div>
          </div>
          <div className="cm-toggle-panel">
            <div className="cm-toggle-panel-inner cm-toggle-panel-inner--map">
              <OurLocationSection {...(mapProps ?? {})} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
