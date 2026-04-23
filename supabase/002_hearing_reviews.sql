-- hearing_reviews: staff/AI review comments per field
CREATE TABLE IF NOT EXISTS dnaos.hearing_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  field_name text NOT NULL,
  comment text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'staff')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, field_name)
);

-- Index for fast lookup by client
CREATE INDEX IF NOT EXISTS idx_hearing_reviews_client_id
  ON dnaos.hearing_reviews (client_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION dnaos.update_hearing_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hearing_reviews_updated_at ON dnaos.hearing_reviews;
CREATE TRIGGER trg_hearing_reviews_updated_at
  BEFORE UPDATE ON dnaos.hearing_reviews
  FOR EACH ROW
  EXECUTE FUNCTION dnaos.update_hearing_reviews_updated_at();
