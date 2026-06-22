CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  phone TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  "wilayaCode" INTEGER NOT NULL,
  commune TEXT NOT NULL,
  address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  total NUMERIC NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_orders" ON orders FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE TO anon USING (true);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  img TEXT,
  images JSONB DEFAULT '[]',
  "new" BOOLEAN DEFAULT false,
  "originalPrice" NUMERIC,
  specs JSONB DEFAULT '{}',
  sections JSONB DEFAULT '[]',
  in_stock BOOLEAN DEFAULT true,
  visible BOOLEAN DEFAULT true
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_products" ON products FOR ALL TO anon USING (true) WITH CHECK (true);

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "anon_select_product_images" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'product-images');
CREATE POLICY "anon_insert_product_images" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "anon_update_product_images" ON storage.objects FOR UPDATE TO anon USING (bucket_id = 'product-images');
CREATE POLICY "anon_delete_product_images" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'product-images');

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
CREATE POLICY "anon_all_site_content" ON site_content FOR ALL TO anon USING (true) WITH CHECK (true);
