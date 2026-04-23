-- treatment_categories: editable treatment category master with subcategories
CREATE TABLE IF NOT EXISTS dnaos.treatment_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name text NOT NULL UNIQUE,
  subcategories jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION dnaos.update_treatment_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_treatment_categories_updated_at ON dnaos.treatment_categories;
CREATE TRIGGER trg_treatment_categories_updated_at
  BEFORE UPDATE ON dnaos.treatment_categories
  FOR EACH ROW
  EXECUTE FUNCTION dnaos.update_treatment_categories_updated_at();

-- Permissions
GRANT ALL ON dnaos.treatment_categories TO service_role;
GRANT ALL ON dnaos.treatment_categories TO authenticated;
GRANT ALL ON dnaos.treatment_categories TO anon;
