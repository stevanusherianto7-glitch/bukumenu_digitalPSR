-- SQL MIGRATION Sync Database with Waiter Module & Inventory Engine
-- Copy and run this in Supabase SQL Editor: https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new

-----------------------------------------------------------
-- 1. CLEANUP & PREPARATION
-----------------------------------------------------------
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;

-----------------------------------------------------------
-- 2. CORE TABLES (SNAKE_CASE STANDARDIZATION)
-----------------------------------------------------------

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    image_url TEXT,
    category TEXT REFERENCES categories(name),
    is_favorite BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    rating DOUBLE PRECISION DEFAULT 0,
    prep_time INTEGER,
    calories INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    table_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    order_type TEXT DEFAULT 'dine-in',    -- 'dine-in', 'take-away'
    total DOUBLE PRECISION DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items Table (Crucial for Inventory)
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    menu_id TEXT REFERENCES menu_items(id),
    menu_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DOUBLE PRECISION NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-----------------------------------------------------------
-- 3. INVENTORY & ERP ENGINE TABLES
-----------------------------------------------------------

-- Ingredients Table (Bahan Baku)
CREATE TABLE IF NOT EXISTS ingredients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    unit TEXT NOT NULL, -- 'gr', 'ml', 'pcs', 'slice'
    current_stock DOUBLE PRECISION DEFAULT 0,
    min_stock DOUBLE PRECISION DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes Table (Linking Menu to Ingredients)
CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    menu_id TEXT REFERENCES menu_items(id) ON DELETE CASCADE,
    ingredient_id TEXT REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity DOUBLE PRECISION NOT NULL, -- Berapa banyak bahan yang digunakan per 1 porsi menu
    UNIQUE(menu_id, ingredient_id)
);

-----------------------------------------------------------
-- 4. SECURITY (RLS POLICIES)
-----------------------------------------------------------

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Permissive Policies (Public access for Guest/Waiter)
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Menu" ON menu_items;
CREATE POLICY "Public Read Menu" ON menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow All Orders" ON orders;
CREATE POLICY "Allow All Orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Order Items" ON order_items;
CREATE POLICY "Allow All Order Items" ON order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Ingredients" ON ingredients;
CREATE POLICY "Allow All Ingredients" ON ingredients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Recipes" ON recipes;
CREATE POLICY "Allow All Recipes" ON recipes FOR ALL USING (true) WITH CHECK (true);

-----------------------------------------------------------
-- 5. REAL-TIME CONFIGURATION
-----------------------------------------------------------

-- Enable real-time for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE ingredients;

-----------------------------------------------------------
-- 6. AUTOMATION (TRUNCATE UPDATED_AT)
-----------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
