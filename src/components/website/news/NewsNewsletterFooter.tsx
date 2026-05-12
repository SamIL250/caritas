import React from "react";

export default function NewsNewsletterFooter({ title, body }: { title: string; body: string }) {
  return (
    <aside className="news-newsletter" aria-labelledby="newsletter-heading">
      <h3 id="newsletter-heading">{title}</h3>
      <p>{body}</p>
    </aside>
  );
}
