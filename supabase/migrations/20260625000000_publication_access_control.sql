-- ═══════════════════════════════════════════════════════════
-- PUBLICATION ACCESS CONTROL
-- Adds password locking to publications + access request table
-- ═══════════════════════════════════════════════════════════

ALTER TABLE publications
  ADD COLUMN IF NOT EXISTS is_locked        bool NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS access_password  text;

CREATE TABLE IF NOT EXISTS publication_access_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id  uuid NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  requester_email text NOT NULL,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'granted', 'denied')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pub_access_req_pub ON publication_access_requests(publication_id);
CREATE INDEX IF NOT EXISTS idx_pub_access_req_status ON publication_access_requests(status);

ALTER TABLE publication_access_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can create a request
CREATE POLICY "Public insert publication_access_requests"
  ON publication_access_requests FOR INSERT
  WITH CHECK (true);

-- Authenticated staff can view and manage all
CREATE POLICY "Staff select publication_access_requests"
  ON publication_access_requests FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Staff update publication_access_requests"
  ON publication_access_requests FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff delete publication_access_requests"
  ON publication_access_requests FOR DELETE
  USING (auth.role() = 'authenticated');
