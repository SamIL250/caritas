/** Allowed contact form topics — aligned with Contact section pills and server validation. */

export const CONTACT_TOPICS = [
  "General Inquiry",
  "Partnership",
  "Volunteering",
  "Donation",
  "Media",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export function isContactTopic(value: string): value is ContactTopic {
  return (CONTACT_TOPICS as readonly string[]).includes(value);
}
