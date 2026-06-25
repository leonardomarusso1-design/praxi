// Vercel Serverless Function — proxy para Z-API
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const instance     = process.env.ZAPI_INSTANCE;
  const token        = process.env.ZAPI_TOKEN;
  const clientToken  = process.env.ZAPI_CLIENT_TOKEN;

  if (!instance || !token) return res.status(500).json({ error: 'Z-API não configurada no Vercel' });

  try {
    const upstream = await fetch(
      `https://api.z-api.io/instances/${instance}/token/${token}/send-image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': clientToken || '',
        },
        body: JSON.stringify(req.body),
      }
    );
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
