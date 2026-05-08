import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTts = async (req: Request, res: Response) => {
  try {
    // 1. Ambil konfigurasi index dari query parameter (default: 0)
    const ttsIndex = parseInt(req.query.tts_index as string) || 0;

    // 2. Query SQL dari User (Menggunakan String.raw agar regex backslash aman)
    const query = String.raw`
WITH parsed_orders AS (
  SELECT
    o.id AS order_id,
    o.notes,
    (regexp_match(COALESCE(o.notes, ''), '^\s*\[(.*?)\]\s*(.*)$'))[1] AS order_bracket_value,
    (regexp_match(COALESCE(o.notes, ''), '^\s*\[(.*?)\]\s*(.*)$'))[2] AS chef_notes,
    o.created_at
  FROM public.orders o
  WHERE o.status IN ('pending','preparing','ready')
),
items_by_order AS (
  SELECT
    oi.order_id,
    SUM(COALESCE(oi.quantity,0)) AS total_qty,
    string_agg(
      COALESCE(oi.quantity::text,'')
      || CASE WHEN COALESCE(oi.quantity,0) > 0 THEN ' ' ELSE '' END
      || COALESCE(oi.menu_name,'Menu'),
      ', '
      ORDER BY oi.created_at
    ) AS item_list
  FROM public.order_items oi
  GROUP BY oi.order_id
)
SELECT
  (
    CASE
      WHEN lower(COALESCE(po.order_bracket_value,'')) LIKE '%take%' THEN 'Take away'
      WHEN lower(COALESCE(po.order_bracket_value,'')) LIKE '%dine%' THEN 'Dine in'
      ELSE 'Pesanan'
    END
  )
  || '. Total item: '
  || COALESCE(ibo.total_qty,0)::text
  || '. Isi: '
  || COALESCE(NULLIF(trim(ibo.item_list),''),'tidak ada item')
  || COALESCE(
       CASE WHEN NULLIF(trim(po.chef_notes), '') IS NULL THEN ''
            ELSE '. Catatan chef: ' || trim(po.chef_notes)
       END,
       ''
     ) AS tts_text
FROM parsed_orders po
LEFT JOIN items_by_order ibo ON ibo.order_id = po.order_id
ORDER BY po.created_at DESC
LIMIT 10;
    `;

    // 3. Jalankan query
    const results = await prisma.$queryRawUnsafe<{ tts_text: string }[]>(query);

    // Logging jumlah baris yang dihasilkan
    console.log(`[TTS] Query menghasilkan ${results.length} baris.`);

    // 4. Pilih teks berdasarkan index
    let textToRead = "Pesanan baru tersedia."; // Fallback default
    
    if (results.length > 0) {
      const selectedRow = results[ttsIndex] || results[0]; // Fallback ke index 0 jika input index out of bounds
      if (selectedRow && selectedRow.tts_text) {
        // Normalisasi whitespace
        textToRead = selectedRow.tts_text.replace(/\s+/g, ' ').trim();
      }
    }

    // Logging teks yang dibaca (sebagian untuk keamanan/estetika log)
    console.log(`[TTS] Teks yang dibaca: "${textToRead.substring(0, 50)}..."`);

    // 5. Generate Google Translate TTS URL
    // Format: https://translate.google.com/translate_tts?ie=UTF-8&q=TEKS&tl=id&client=tw-ob
    const encodedText = encodeURIComponent(textToRead);
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=id&client=tw-ob`;

    // 6. Kembalikan hasil ke frontend
    res.json({
      success: true,
      text: textToRead,
      audioUrl: audioUrl
    });

  } catch (error) {
    console.error('[TTS] Error generating TTS:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghasilkan audio TTS',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
