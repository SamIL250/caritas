import { formatInlineBold } from "@/lib/text-format";

export type FeaturedQuoteTone = "dark" | "warm";

type Props = {
  name?: string;
  subtitle?: string;
  quote?: string;
  meta?: string;
  photo_url?: string;
  /** Dark gradient (about page default) or warm cream block */
  tone?: FeaturedQuoteTone;
};

export default function FeaturedQuoteSection({
  name = "",
  subtitle = "",
  quote = "",
  meta = "",
  photo_url = "",
  tone = "dark",
}: Props) {
  const paras = quote.split(/\n\s*\n/).filter(Boolean);
  const resolvedTone = tone === "warm" ? "warm" : "dark";
  const toneClass =
    resolvedTone === "warm" ? "chairperson-section--warm" : "chairperson-section--dark";
  return (
    <section className={`chairperson-section ${toneClass}`}>
      <div className="chairperson-inner container">
        <div className="chairperson-visual">
          <div className="chairperson-photo">
            {photo_url ? (
              <img src={photo_url} alt="" className="h-full w-full object-cover rounded-full" />
            ) : (
              <i className="fa-solid fa-user-tie" aria-hidden />
            )}
          </div>
          {name ? <div className="chairperson-name">{name}</div> : null}
          {subtitle ? (
            <div
              className="chairperson-title"
              dangerouslySetInnerHTML={{ __html: subtitle.replace(/\n/g, "<br />") }}
            />
          ) : null}
        </div>
        <div className="chairperson-content">
          <span className="quote-mark">&ldquo;</span>
          <div className="chairperson-quote">
            {paras.map((p, idx) => (
              <p key={idx}>{formatInlineBold(p.trim())}</p>
            ))}
          </div>
          {meta ? (
            <>
              <div className="chairperson-divider" />
              <div className="chairperson-meta">{meta}</div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
