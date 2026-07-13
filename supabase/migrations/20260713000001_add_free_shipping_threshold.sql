-- The remote DB was missing site_content even though the original migration
-- is marked applied, so recreate it idempotently before adding the new column.
CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  hero_badge TEXT NOT NULL DEFAULT '',
  hero_title TEXT NOT NULL DEFAULT '',
  hero_desc TEXT NOT NULL DEFAULT '',
  hero_cta TEXT NOT NULL DEFAULT '',
  journal_badge TEXT NOT NULL DEFAULT '',
  journal_title TEXT NOT NULL DEFAULT '',
  journal_desc TEXT NOT NULL DEFAULT ''
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_site_content" ON site_content;
CREATE POLICY "anon_all_site_content" ON site_content FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE site_content ADD COLUMN IF NOT EXISTS free_shipping_threshold NUMERIC NOT NULL DEFAULT 30000;
