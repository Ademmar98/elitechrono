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
