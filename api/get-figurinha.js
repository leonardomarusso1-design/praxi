
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  const { order_id } = req.query;

  if (!order_id) return res.status(400).json({ error: 'order_id is required' });

  try {
    const { data, error } = await supabase
      .from('figurinha_orders')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
