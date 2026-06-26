export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const instance    = process.env.ZAPI_INSTANCE;
  const token       = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;

  if (!instance || !token) return res.status(500).json({ error: 'Z-API não configurada' });

  const { phone, image, caption } = req.body;

  // Z-API /send-image aceita base64 COM o prefixo data URI completo
  // Garante que tem o prefixo correto
  let imageForZapi = null;
  if (image) {
    if (image.startsWith('data:')) {
      // Já tem prefixo — usa direto
      imageForZapi = image;
    } else {
      // Base64 puro — adiciona prefixo
      imageForZapi = 'data:image/jpeg;base64,' + image;
    }
  }

  const zapiBody = {
    phone,
    image: imageForZapi,
    caption: caption || '',
  };

  console.log('Z-API payload size:', JSON.stringify(zapiBody).length, 'bytes');
  console.log('Z-API phone:', phone);
  console.log('Z-API image prefix:', imageForZapi ? imageForZapi.slice(0, 40) : 'null');

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
      console.error('Z-API error:', upstream.status, JSON.stringify(data));
    } else {
      console.log('Z-API success:', JSON.stringify(data));
    }

    res.status(upstream.status).json(data);
  } catch (e) {
    console.error('send-whatsapp proxy error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
