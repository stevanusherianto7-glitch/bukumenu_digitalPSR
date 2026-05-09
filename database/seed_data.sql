-- Seed Data: Initial menu items and categories
-- Run this AFTER creating tables (001_create_tables.sql)
-- In Supabase SQL Editor: https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new

-- Insert sample menu items
INSERT INTO "menu_items" ("id", "name", "description", "price", "imageUrl", "category", "isFavorite", "isNew", "rating", "prepTime", "calories", "createdAt", "updatedAt")
VALUES
    ('menu_001', 'Nasi Goreng Jawa', 'Nasi goreng dengan bumbu khas Jawa, dilengkapi telur, ayam, dan kerupuk', 25000, 'https://res.cloudinary.com/dwdaydzsh/image/upload/v1768235951/Nasi_Goreng_Jawa_mqtalj.jpg', 'Makanan', true, false, 4.5, 15, 450, NOW(), NOW()),
    ('menu_002', 'Soto Ayam Semarang', 'Soto ayam dengan bumbu khas Semarang, dilengkapi tauge, soun, dan kerupuk', 28000, 'https://res.cloudinary.com/dwdaydzsh/image/upload/v1768287616/Soto_Ayam_Semarang_m4xtel.webp', 'Makanan', true, false, 4.7, 20, 380, NOW(), NOW()),
    ('menu_003', 'Rawon Semarang', 'Rawon daging dengan bumbu khas, dilengkapi tauge, sambal, dan kerupuk', 32000, 'https://res.cloudinary.com/dwdaydzsh/image/upload/v1768287617/Rawon_Semarang_vaxfch.webp', 'Makanan', false, true, 4.6, 25, 420, NOW(), NOW()),
    ('menu_004', 'Es Teler', 'Es campur dengan kelapa muda, alpukat, nangka, dan sirup', 15000, 'https://res.cloudinary.com/dwdaydzsh/image/upload/v1768368394/Es_Teler_vyc2aq.jpg', 'Minuman', true, false, 4.8, 5, 200, NOW(), NOW()),
    ('menu_005', 'Tahu Gimbal Semarang', 'Tahu goreng dengan bumbu kacang khas Semarang', 18000, 'https://res.cloudinary.com/dwdaydzsh/image/upload/v1768287613/Tahu_Gimbal_Semarang_tjtpa0.webp', 'Snack', false, true, 4.4, 10, 250, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Insert categories
INSERT INTO "categories" ("id", "name", "order", "createdAt", "updatedAt")
VALUES
    ('cat_001', 'Terlaris', 1, NOW(), NOW()),
    ('cat_002', 'Menu Baru', 2, NOW(), NOW()),
    ('cat_003', 'Makanan', 3, NOW(), NOW()),
    ('cat_004', 'Minuman', 4, NOW(), NOW()),
    ('cat_005', 'Snack', 5, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;



