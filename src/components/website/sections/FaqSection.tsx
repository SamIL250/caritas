"use client";

import React, { useState } from "react";
import Link from "next/link";
import "./faq-section.css";

const FAQS = [
  {
    q: "How can I donate to Caritas Rwanda?",
    a: "You can donate by contacting our office directly via phone at +250 252 574 344 or email at info@caritasrwanda.org. We also accept contributions through bank transfer — our team will provide full banking details upon request. All donations are acknowledged and used transparently for humanitarian programs."
  },
  {
    q: "How can I volunteer with Caritas Rwanda?",
    a: "We welcome volunteers at both our national headquarters in Kigali and through our 10 Diocesan Caritas offices across the country. Send us a message using the form on this page, selecting \"Volunteering\" as the subject, and include details about your skills and availability."
  },
  {
    q: "How can my organization partner with Caritas Rwanda?",
    a: "Caritas Rwanda actively partners with NGOs, faith-based organizations, government agencies, and international donors. Select \"Partnership\" in the contact form and describe your organization and the nature of the proposed collaboration. Our partnerships team will respond within two business days."
  },
  {
    q: "How can I access Caritas Rwanda's annual reports and publications?",
    a: (
      <>
        All annual reports, quarterly newsletters, and strategic plans are freely available on our <Link href="/publications" style={{color:"#911313",fontWeight:600}}>Publications page</Link>. You can download PDFs directly — no registration required. For older archives not listed online, please contact us by email.
      </>
    )
  },
  {
    q: "Where are Caritas Rwanda's Diocesan offices located?",
    a: (
      <>
        Caritas Rwanda has 10 Diocesan Caritas offices covering all provinces of Rwanda: Kabgayi, Nyundo, Butare, Ruhengeri, Kibungo, Byumba, Cyangugu, Gikongoro, Kigali, and Kibuye. You can find contact details for each Diocese on our <Link href="/about#network" style={{color:"#911313",fontWeight:600}}>About page</Link>.
      </>
    )
  }
];

export type FaqItem = {
  q: string;
  a: React.ReactNode;
};

export type FaqSectionProps = {
  eyebrow?: string;
  title?: string;
  faqs?: FaqItem[];
};

export default function FaqSection({ 
  eyebrow = "FAQ", 
  title = "Frequently Asked Questions", 
  faqs = FAQS 
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(prev => prev === index ? null : index);
  };

  return (
    <div className="ct-faq-section">
        <div className="ct-faq-inner">
            <div className="ct-faq-head">
                <div className="ct-faq-eyebrow"><i className="fa-solid fa-circle-question" aria-hidden></i> {eyebrow}</div>
                <div className="ct-faq-title">{title}</div>
            </div>
            <div className="ct-faq-list">
                {faqs.map((faq, idx) => {
                  const isOpen = openIndex === idx;
                  return (
                    <div key={idx} className={`ct-faq-item ${isOpen ? 'open' : ''}`}>
                        <div className="ct-faq-q" onClick={() => toggleFaq(idx)} role="button" tabIndex={0} onKeyDown={(e) => { if(e.key==='Enter'||e.key===' ') { e.preventDefault(); toggleFaq(idx); } }}>
                            <span className="ct-faq-q-text">{faq.q}</span>
                            <span className="ct-faq-icon"><i className="fa-solid fa-plus" aria-hidden></i></span>
                        </div>
                        <div className="ct-faq-a"><p>{faq.a}</p></div>
                    </div>
                  );
                })}
            </div>
        </div>
    </div>
  );
}
}
