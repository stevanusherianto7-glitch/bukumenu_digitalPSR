-- SQL SEED: Initial Ingredients & Recipes for ERP Engine
-- Copy and run this in Supabase SQL Editor: https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new

-----------------------------------------------------------
-- 1. SEED INGREDIENTS (BAHAN BAKU)
-----------------------------------------------------------
INSERT INTO ingredients (id, name, unit, current_stock, min_stock)
VALUES
    ('ing_001', 'Ayam Potong', 'pcs', 50, 10),
    ('ing_002', 'Telur Ayam', 'pcs', 100, 20),
    ('ing_003', 'Nasi Putih', 'gr', 10000, 2000),
    ('ing_004', 'Daging Sapi', 'gr', 5000, 1000),
    ('ing_005', 'Mie Basah', 'gr', 5000, 1000),
    ('ing_006', 'Es Batu', 'kg', 20, 5)
ON CONFLICT (id) DO UPDATE SET 
    current_stock = EXCLUDED.current_stock,
    min_stock = EXCLUDED.min_stock;

-----------------------------------------------------------
-- 2. SEED RECIPES (PEMETAAN MENU KE BAHAN)
-----------------------------------------------------------

-- Nasi Goreng Jawa (menu_001)
-- Menggunakan: 200gr Nasi, 1 Telur, 0.5 Ayam
INSERT INTO recipes (menu_id, ingredient_id, quantity)
VALUES
    ('menu_001', 'ing_003', 200), -- 200gr Nasi
    ('menu_002', 'ing_003', 150), -- 150gr Nasi (Soto pakai nasi)
    ('menu_001', 'ing_002', 1),   -- 1 Telur
    ('menu_001', 'ing_001', 0.5)  -- 0.5 Ayam
ON CONFLICT (menu_id, ingredient_id) DO UPDATE SET 
    quantity = EXCLUDED.quantity;

-- Soto Ayam Semarang (menu_002)
-- Menggunakan: 1 Ayam, 150gr Nasi
INSERT INTO recipes (menu_id, ingredient_id, quantity)
VALUES
    ('menu_002', 'ing_001', 1)
ON CONFLICT (menu_id, ingredient_id) DO UPDATE SET 
    quantity = EXCLUDED.quantity;

-- Rawon Semarang (menu_003)
-- Menggunakan: 150gr Daging Sapi, 150gr Nasi
INSERT INTO recipes (menu_id, ingredient_id, quantity)
VALUES
    ('menu_003', 'ing_004', 150),
    ('menu_003', 'ing_003', 150)
ON CONFLICT (menu_id, ingredient_id) DO UPDATE SET 
    quantity = EXCLUDED.quantity;

-- Es Teler (menu_004)
-- Menggunakan: 0.5kg Es Batu
INSERT INTO recipes (menu_id, ingredient_id, quantity)
VALUES
    ('menu_004', 'ing_006', 0.5)
ON CONFLICT (menu_id, ingredient_id) DO UPDATE SET 
    quantity = EXCLUDED.quantity;
