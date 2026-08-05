"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { encodePublicationAssetUrl } from "@/lib/publications";
import { PublicationLockContent } from "./PublicationLockContent";

type Props = {
  publicationId: string;
  publicationTitle: string;
  categoryLabel?: string;
  excerpt?: string;
  coverImageUrl?: string;
  onUnlock: () => void;
};

export function PublicationLockPage({
  publicationId,
  publicationTitle,
  categoryLabel,
  excerpt,
  coverImageUrl,
  onUnlock,
}: Props) {
  const cover = coverImageUrl?.trim();

  return (
    <div className="pub-lock-page">
      <header className="pub-lock-page-hero">
        {cover ? (
          <div className="pub-lock-page-hero-bg" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={encodePublicationAssetUrl(cover)} alt="" />
          </div>
        ) : null}
        <div className="pub-lock-page-hero-inner">
          <nav className="pub-lock-page-breadcrumb" aria-label="Breadcrumb">
            <Link href="/publications">Publications</Link>
            <span aria-hidden> / </span>
            <span>{publicationTitle}</span>
          </nav>
          {categoryLabel ? <span className="pub-lock-page-eyebrow">{categoryLabel}</span> : null}
          <div className="pub-lock-page-title-row">
            <h1 className="pub-lock-page-title">{publicationTitle}</h1>
            <span className="pub-lock-page-badge">
              <Lock size={14} aria-hidden />
              Protected
            </span>
          </div>
          {excerpt ? <p className="pub-lock-page-deck">{excerpt}</p> : null}
        </div>
      </header>

      <section className="pub-lock-page-body" aria-labelledby="pub-lock-access-heading">
        <div className="pub-lock-page-card">
          <PublicationLockContent
            publicationId={publicationId}
            onUnlock={onUnlock}
            headingId="pub-lock-access-heading"
          />
        </div>
      </section>
    </div>
  );
}
