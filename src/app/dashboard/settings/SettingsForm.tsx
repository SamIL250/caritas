"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { updateSiteSettings } from "@/app/actions/site-settings";
import type { FooterSettings, FooterNavLink, FooterProgramLink, FooterLegalLink } from "@/lib/footer-settings";
import { Loader2, Plus, Trash2 } from "lucide-react";

export type SettingsFormInitial = {
  site_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  footer: FooterSettings;
};

export function SettingsForm({ initial }: { initial: SettingsFormInitial }) {
  const [siteName, setSiteName] = useState(initial.site_name);
  const [tagline, setTagline] = useState(initial.tagline);
  const [logoUrl, setLogoUrl] = useState(initial.logo_url);
  const [faviconUrl, setFaviconUrl] = useState(initial.favicon_url);
  const [footer, setFooter] = useState<FooterSettings>(initial.footer);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const result = await updateSiteSettings({
      site_name: siteName.trim() || "Caritas Rwanda",
      tagline: tagline.trim() || null,
      contact_email: footer.contact.email.trim() || null,
      logo_url: logoUrl.trim() || null,
      favicon_url: faviconUrl.trim() || null,
      footer,
    });
    setSaving(false);
    if (result.success) {
      setMessage({ type: "ok", text: "Settings saved." });
    } else {
      setMessage({ type: "err", text: result.error ?? "Save failed." });
    }
  }

  return (
    <div className="mt-6 max-w-4xl space-y-8 pb-10">
      {message && (
        <p
          className={
            message.type === "ok"
              ? "text-sm text-emerald-700"
              : "text-sm text-red-600"
          }
        >
          {message.text}
        </p>
      )}

      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Site & branding</h2>
        <Card className="space-y-4 p-4 sm:p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Site name</label>
              <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tagline (optional)</label>
              <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Logo URL (optional)</label>
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://… or leave empty for default"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Favicon URL (optional)</label>
              <Input value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} />
            </div>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Footer — top banner</h2>
        <Card className="space-y-3 p-4 sm:p-6">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Text before highlight</label>
              <Input
                value={footer.banner.lineBefore}
                onChange={(e) =>
                  setFooter((f) => ({ ...f, banner: { ...f.banner, lineBefore: e.target.value } }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Highlight (e.g. Faith, Hope)</label>
              <Input
                value={footer.banner.accent}
                onChange={(e) =>
                  setFooter((f) => ({ ...f, banner: { ...f.banner, accent: e.target.value } }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Text after</label>
              <Input
                value={footer.banner.lineAfter}
                onChange={(e) =>
                  setFooter((f) => ({ ...f, banner: { ...f.banner, lineAfter: e.target.value } }))
                }
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Button label</label>
              <Input
                value={footer.banner.ctaLabel}
                onChange={(e) =>
                  setFooter((f) => ({ ...f, banner: { ...f.banner, ctaLabel: e.target.value } }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Button link (e.g. #contact)</label>
              <Input
                value={footer.banner.ctaHref}
                onChange={(e) =>
                  setFooter((f) => ({ ...f, banner: { ...f.banner, ctaHref: e.target.value } }))
                }
              />
            </div>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Footer — brand column</h2>
        <Card className="space-y-3 p-4 sm:p-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">Mission text</label>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-sm"
              value={footer.brand.mission}
              onChange={(e) =>
                setFooter((f) => ({ ...f, brand: { ...f.brand, mission: e.target.value } }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Footer logo override URL</label>
            <Input
              value={footer.brand.logoUrl ?? ""}
              onChange={(e) =>
                setFooter((f) => ({
                  ...f,
                  brand: { ...f.brand, logoUrl: e.target.value.trim() || null },
                }))
              }
              placeholder="Empty = /img/logo_caritas.png"
            />
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Footer — social links</h2>
        <Card className="space-y-3 p-4 sm:p-6">
          {(
            [
              ["twitter", "Twitter / X"] as const,
              ["youtube", "YouTube"] as const,
              ["facebook", "Facebook"] as const,
              ["linkedin", "LinkedIn"] as const,
              ["flickr", "Flickr"] as const,
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1">
              <label className="text-sm font-medium">{label}</label>
              <Input
                value={footer.social[key]}
                onChange={(e) =>
                  setFooter((f) => ({
                    ...f,
                    social: { ...f.social, [key]: e.target.value },
                  }))
                }
                placeholder="Empty = hide this icon"
              />
            </div>
          ))}
        </Card>
      </section>

      <LinkListEditor
        title="Footer — quick links (column 2)"
        items={footer.quickLinks}
        onChange={(next) => setFooter((f) => ({ ...f, quickLinks: next }))}
        kind="nav"
        maxBehavior
      />

      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Footer — programs column</h2>
        <Card className="space-y-3 p-4 sm:p-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">Column heading</label>
            <Input
              value={footer.programColumn.heading}
              onChange={(e) =>
                setFooter((f) => ({
                  ...f,
                  programColumn: { ...f.programColumn, heading: e.target.value },
                }))
              }
            />
          </div>
          <ProgramLinkList
            items={footer.programColumn.links}
            onChange={(links) =>
              setFooter((f) => ({ ...f, programColumn: { ...f.programColumn, links } }))
            }
          />
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Footer — newsletter</h2>
        <Card className="space-y-3 p-4 sm:p-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">Heading</label>
            <Input
              value={footer.newsletter.heading}
              onChange={(e) =>
                setFooter((f) => ({ ...f, newsletter: { ...f.newsletter, heading: e.target.value } }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-[var(--color-border-default)] bg-transparent px-3 py-2 text-sm"
              value={footer.newsletter.description}
              onChange={(e) =>
                setFooter((f) => ({ ...f, newsletter: { ...f.newsletter, description: e.target.value } }))
              }
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email placeholder</label>
              <Input
                value={footer.newsletter.placeholder}
                onChange={(e) =>
                  setFooter((f) => ({ ...f, newsletter: { ...f.newsletter, placeholder: e.target.value } }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Subscribe button label</label>
              <Input
                value={footer.newsletter.buttonLabel}
                onChange={(e) =>
                  setFooter((f) => ({ ...f, newsletter: { ...f.newsletter, buttonLabel: e.target.value } }))
                }
              />
            </div>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Footer — contact row</h2>
        <Card className="grid sm:grid-cols-2 gap-3 p-4 sm:p-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">Address label</label>
            <Input
              value={footer.contact.addressLabel}
              onChange={(e) =>
                setFooter((f) => ({ ...f, contact: { ...f.contact, addressLabel: e.target.value } }))
              }
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Address</label>
            <Input
              value={footer.contact.address}
              onChange={(e) =>
                setFooter((f) => ({ ...f, contact: { ...f.contact, address: e.target.value } }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone label</label>
            <Input
              value={footer.contact.phoneLabel}
              onChange={(e) =>
                setFooter((f) => ({ ...f, contact: { ...f.contact, phoneLabel: e.target.value } }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone</label>
            <Input
              value={footer.contact.phone}
              onChange={(e) =>
                setFooter((f) => ({ ...f, contact: { ...f.contact, phone: e.target.value } }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email label</label>
            <Input
              value={footer.contact.emailLabel}
              onChange={(e) =>
                setFooter((f) => ({ ...f, contact: { ...f.contact, emailLabel: e.target.value } }))
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={footer.contact.email}
              onChange={(e) =>
                setFooter((f) => ({ ...f, contact: { ...f.contact, email: e.target.value } }))
              }
            />
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Footer — bottom bar</h2>
        <Card className="space-y-3 p-4 sm:p-6">
          <div className="space-y-1">
            <label className="text-sm font-medium">Organization name (copyright)</label>
            <Input
              value={footer.bottom.orgName}
              onChange={(e) =>
                setFooter((f) => ({ ...f, bottom: { ...f.bottom, orgName: e.target.value } }))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={footer.bottom.showDeveloperCredit}
              onChange={(e) =>
                setFooter((f) => ({
                  ...f,
                  bottom: { ...f.bottom, showDeveloperCredit: e.target.checked },
                }))
              }
            />
            Show “Designed & developed by” line
          </label>
          <div className="space-y-1">
            <label className="text-sm font-medium">Developer / agency name</label>
            <Input
              value={footer.bottom.developerCredit}
              onChange={(e) =>
                setFooter((f) => ({ ...f, bottom: { ...f.bottom, developerCredit: e.target.value } }))
              }
            />
          </div>
        </Card>
      </section>

      <LinkListEditor
        title="Footer — legal links"
        items={footer.legalLinks as unknown as FooterNavLink[]}
        onChange={(next) => setFooter((f) => ({ ...f, legalLinks: next as unknown as FooterLegalLink[] }))}
        kind="legal"
        maxBehavior={false}
      />

      <div className="flex gap-3">
        <Button variant="primary" className="h-10" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
              Saving…
            </>
          ) : (
            "Save all settings"
          )}
        </Button>
      </div>
    </div>
  );
}

function ProgramLinkList({
  items,
  onChange,
}: {
  items: FooterProgramLink[];
  onChange: (l: FooterProgramLink[]) => void;
}) {
  function update(i: number, field: keyof FooterProgramLink, value: string) {
    const next = items.map((row, j) => (j === i ? { ...row, [field]: value } : row));
    onChange(next);
  }
  return (
    <div className="space-y-2">
      {items.map((row, i) => (
        <div key={i} className="flex flex-col sm:flex-row gap-2">
          <Input
            className="flex-1"
            value={row.label}
            onChange={(e) => update(i, "label", e.target.value)}
            placeholder="Label"
          />
          <Input
            className="flex-1"
            value={row.href}
            onChange={(e) => update(i, "href", e.target.value)}
            placeholder="Link"
          />
          <Button
            type="button"
            variant="secondary"
            className="h-9 px-2 shrink-0"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label="Remove row"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        className="h-9 w-fit"
        onClick={() => onChange([...items, { label: "New link", href: "#programs" }])}
      >
        <Plus className="w-4 h-4 mr-1" />
        Add program link
      </Button>
    </div>
  );
}

function LinkListEditor({
  title,
  items,
  onChange,
  kind,
  maxBehavior,
}: {
  title: string;
  items: FooterNavLink[];
  onChange: (l: FooterNavLink[]) => void;
  kind: "nav" | "legal";
  maxBehavior: boolean;
}) {
  if (kind === "legal") {
    const legal = items as unknown as FooterLegalLink[];
    return (
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">{title}</h2>
        <Card className="space-y-2 p-4 sm:p-6">
          {legal.map((row, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2">
              <Input
                className="flex-1"
                value={row.label}
                onChange={(e) => {
                  const n = legal.map((r, j) => (j === i ? { ...r, label: e.target.value } : r));
                  onChange(n as unknown as FooterNavLink[]);
                }}
                placeholder="Label"
              />
              <Input
                className="flex-1"
                value={row.href}
                onChange={(e) => {
                  const n = legal.map((r, j) => (j === i ? { ...r, href: e.target.value } : r));
                  onChange(n as unknown as FooterNavLink[]);
                }}
                placeholder="/path"
              />
              <Button
                type="button"
                variant="secondary"
                className="h-9 px-2"
                onClick={() =>
                  onChange(legal.filter((_, j) => j !== i) as unknown as FooterNavLink[])
                }
                aria-label="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            className="h-9 w-fit"
            onClick={() =>
              onChange([...legal, { label: "New page", href: "/privacy" }] as unknown as FooterNavLink[])
            }
          >
            <Plus className="w-4 h-4 mr-1" />
            Add link
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">{title}</h2>
      <Card className="space-y-2 p-4 sm:p-6">
        {items.map((row, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 border-b border-[var(--color-border-default)] pb-3 last:border-0"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                className="flex-1"
                value={row.label}
                onChange={(e) => {
                  const n = items.map((r, j) => (j === i ? { ...r, label: e.target.value } : r));
                  onChange(n);
                }}
                placeholder="Label"
              />
              <Input
                className="flex-1"
                value={row.href}
                onChange={(e) => {
                  const n = items.map((r, j) => (j === i ? { ...r, href: e.target.value } : r));
                  onChange(n);
                }}
                placeholder="/ or #section"
                disabled={row.behavior === "donate"}
              />
            </div>
            {maxBehavior && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-[var(--color-text-muted)]">Behavior:</label>
                <select
                  className="h-9 rounded-md border border-[var(--color-border-default)] bg-transparent px-2 text-sm"
                  value={row.behavior === "donate" ? "donate" : "nav"}
                  onChange={(e) => {
                    const v = e.target.value;
                    const n = items.map((r, j) =>
                      j === i
                        ? {
                            ...r,
                            behavior: (v === "donate" ? "donate" : "nav") as FooterNavLink["behavior"],
                            href: v === "donate" ? "#" : r.href,
                          }
                        : r
                    );
                    onChange(n);
                  }}
                >
                  <option value="nav">Normal link</option>
                  <option value="donate">Open donation</option>
                </select>
              </div>
            )}
            <div>
              <Button
                type="button"
                variant="secondary"
                className="h-8"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          className="h-9 w-fit"
          onClick={() =>
            onChange([...items, { label: "New item", href: "/", behavior: "nav" }])
          }
        >
          <Plus className="w-4 h-4 mr-1" />
          Add link
        </Button>
      </Card>
    </section>
  );
}
