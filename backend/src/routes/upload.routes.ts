
import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
// FIX: Resolve `__dirname` not being available in ES modules.
import { fileURLToPath } from 'url';
// FIX: Import Buffer to resolve 'Cannot find name' error.
import { Buffer } from 'buffer';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pastikan direktori 'uploads' ada
const uploadsDir = path.join(__dirname, '../../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

router.post('/', (req, res) => {
    try {
        const { image } = req.body; // Mengharapkan string base64
        if (!image) {
            return res.status(400).json({ message: 'Tidak ada data gambar yang diberikan.' });
        }

        // Contoh: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
        const matches = image.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ message: 'Format gambar base64 tidak valid.' });
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const extension = mimeType.split('/')[1];
        
        if (!['jpeg', 'png', 'gif', 'webp', 'jpg'].includes(extension)) {
            return res.status(400).json({ message: 'Tipe gambar tidak didukung.' });
        }

        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${extension}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, buffer);

        // Mengembalikan URL yang dapat diakses publik
        const publicUrl = `/uploads/${filename}`;
        res.status(201).json({ url: publicUrl });

    } catch (error) {
        console.error('Kesalahan saat mengunggah:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server saat mengunggah file.' });
    }
});

export default router;