
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: { sizeLimit: '15mb' } } };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { order_id, png_base64, pdf_base64, figurinha_name } = req.body;

    if (!order_id) return res.status(400).json({ error: 'order_id is required' });

    let png_url = '';
    let pdf_url = '';

    // Upload PNG
    if (png_base64) {
      const pngBuffer = Buffer.from(png_base64.split(',')[1], 'base64');
      const { data: pngData, error: pngError } = await supabase.storage
        .from('figurinhas')
        .upload(`${order_id}/figurinha.png`, pngBuffer, {
          contentType: 'image/png',
          upsert: true
        });
      
      if (pngError) throw pngError;
      const { data: { publicUrl } } = supabase.storage.from('figurinhas').getPublicUrl(`${order_id}/figurinha.png`);
      png_url = publicUrl;
    }

    // Upload PDF
    if (pdf_base64) {
      const pdfBuffer = Buffer.from(pdf_base64.split(',')[1], 'base64');
      const { data: pdfData, error: pdfError } = await supabase.storage
        .from('figurinhas')
        .upload(`${order_id}/figurinha.pdf`, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });
      
      if (pdfError) throw pdfError;
      const { data: { publicUrl } } = supabase.storage.from('figurinhas').getPublicUrl(`${order_id}/figurinha.pdf`);
      pdf_url = publicUrl;
    }

    // Update figurinha_orders
    const { error: dbError } = await supabase
      .from('figurinha_orders')
      .update({
        png_url,
        pdf_url,
        figurinha_name: figurinha_name || ''
      })
      .eq('order_id', order_id);

    if (dbError) throw dbError;

    return res.status(200).json({ ok: true, png_url, pdf_url });

  } catch (e) {
    console.error('Upload error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
