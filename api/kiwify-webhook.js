// Recebe webhook da Kiwify quando pagamento é confirmado
// Configura no painel Kiwify: Webhooks → URL: https://praxi-eight.vercel.app/api/kiwify-webhook

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body;
    console.log('Kiwify webhook recebido:', JSON.stringify(body).slice(0, 500));

    // Kiwify pode enviar em vários formatos — tentamos todos
    // Formato 1: { type: 'PURCHASE_APPROVED', data: { id, status, customer } }
    // Formato 2: { order: { id, status }, customer: { name, email } }
    // Formato 3: { order_id, status, customer_email }
    const orderId = body?.data?.id || body?.order?.id || body?.order_id || body?.id;
    const status  = body?.data?.status || body?.order?.status || body?.status || body?.type || '';
    const email   = body?.data?.customer?.email || body?.customer?.email || body?.customer_email || '';
    const name    = body?.data?.customer?.name  || body?.customer?.name  || body?.customer_name  || '';

    const isPaid = ['paid', 'approved', 'active', 'complete', 'purchase_approved']
      .includes(String(status).toLowerCase());

    if (!orderId) {
      console.warn('Webhook sem order_id. Body:', JSON.stringify(body).slice(0, 300));
      return res.status(200).json({ ok: true, skipped: 'no order_id' });
    }

    if (!isPaid) {
      console.log(`Webhook ignorado: status=${status}, order=${orderId}`);
      return res.status(200).json({ ok: true, skipped: `status=${status}` });
    }

    // Grava no Supabase
    const r = await fetch(`${SUPABASE_URL}/rest/v1/figurinha_orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'resolution=ignore-duplicates',
      },
      body: JSON.stringify({ order_id: orderId, customer_email: email, customer_name: name }),
    });

    if (!r.ok) {
      const err = await r.text();
      console.error('Supabase insert error:', err);
      return res.status(500).json({ error: 'db_error', detail: err });
    }

    console.log(`✅ Ordem gravada: ${orderId} (${email})`);
    return res.status(200).json({ ok: true, order_id: orderId });

  } catch (e) {
    console.error('Webhook error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
