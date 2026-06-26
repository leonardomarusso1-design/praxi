// Verifica se um order_id da Kiwify está pago (consultando Supabase)
// Chamado pelo frontend após redirect do checkout

export const config = { api: { bodyParser: false } };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const orderId = req.query.order_id;
  if (!orderId) return res.status(400).json({ paid: false, error: 'missing order_id' });

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/figurinha_orders?order_id=eq.${encodeURIComponent(orderId)}&select=order_id&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!r.ok) {
      const err = await r.text();
      console.error('Supabase query error:', err);
      return res.status(500).json({ paid: false, error: 'db_error' });
    }

    const rows = await r.json();
    const paid = Array.isArray(rows) && rows.length > 0;

    console.log(`verify-order: ${orderId} → paid=${paid}`);
    return res.json({ paid });

  } catch (e) {
    console.error('verify-order error:', e.message);
    return res.status(500).json({ paid: false, error: e.message });
  }
}
