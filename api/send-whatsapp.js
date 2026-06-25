// Vercel Serverless Function — proxy para Z-API send-image
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const instance    = process.env.ZAPI_INSTANCE;
  const token       = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;

  if (!instance || !token) return res.status(500).json({ error: 'Z-API não configurada' });

  const { phone, image, caption } = req.body;

  // Z-API aceita base64 puro (sem o prefixo "data:image/...;base64,")
  const base64clean = image
    ? image.replace(/^data:image\/\w+;base64,/, '')
    : null;

  const zapiBody = {
    phone,
    image: base64clean,
    caption: caption || '',
  };

  try {
    const upstream = await fetch(
      `https://api.z-api.io/instances/${instance}/token/${token}/send-image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': clientToken || '',
        },
        body: JSON.stringify(zapiBody),
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error('Z-API error:', JSON.stringify(data));
    }

    res.status(upstream.status).json(data);
  } catch (e) {
    console.error('send-whatsapp proxy error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
