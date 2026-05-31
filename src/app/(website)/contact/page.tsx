import type { Metadata } from "next";
import ContactInfo from "@/components/website/sections/ContactInfo";
import OurLocationSection from "@/components/website/sections/OurLocationSection";

export const metadata: Metadata = {
  title: "Contact Us | Caritas Rwanda",
  description:
    "Get in touch with Caritas Rwanda — reach our headquarters in Kigali, send us a message, or find us on the map.",
};

export default function ContactPage() {
  return (
    <>
      {/* ── Page Hero ── */}
      <section
        className="page-hero"
        style={
          {
            ["--page-hero-image" as string]: `url("/img/slide1.png")`,
          } as React.CSSProperties
        }
      >
        <div className="page-hero-container">
          <div className="page-hero-inner">
            <div className="hero-eyebrow">
              <i className="fa-solid fa-envelope" aria-hidden />
              Get In Touch
            </div>
            <h1>
              We&rsquo;d Love to <span>Hear From You</span>
            </h1>
            <p>
              Have a question, want to partner with us, or simply want to learn
              more about our work across Rwanda? Reach out — we&rsquo;re here to
              help.
            </p>
            <nav className="hero-breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span aria-hidden>›</span>
              <span>Contact</span>
            </nav>
          </div>
        </div>
      </section>

      {/* ── Contact Info & Form ── */}
      <ContactInfo />

      {/* ── Our Location on The Map ── */}
      <OurLocationSection />
    </>
  );
}
