export type AccessRequest = {
  id: string;
  publication_id: string;
  requester_email: string;
  status: 'pending' | 'granted' | 'denied';
  created_at: string;
  updated_at: string;
};

export type AccessRequestWithPubTitle = AccessRequest & {
  publication_title: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export const ACCESS_REQUESTS_TABLE = 'publication_access_requests' as const;
