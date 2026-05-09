-- Migration: Restrict RLS policies for security
-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all for menu_items" ON "menu_items";
DROP POLICY IF EXISTS "Allow all for categories" ON "categories";
DROP POLICY IF EXISTS "Allow all for orders" ON "orders";

-- Policies for menu_items
CREATE POLICY "Enable read access for all users" ON "menu_items"
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "menu_items"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON "menu_items"
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON "menu_items"
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for categories
CREATE POLICY "Enable read access for all users" ON "categories"
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "categories"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON "categories"
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON "categories"
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for orders
CREATE POLICY "Enable insert for all users" ON "orders"
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for authenticated users only" ON "orders";
CREATE POLICY "Enable read for all users" ON "orders"
    FOR SELECT USING (true);

CREATE POLICY "Enable update for authenticated users only" ON "orders"
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');