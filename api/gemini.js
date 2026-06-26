export const config = { api: { bodyParser: { sizeLimit: '10mb' } }, maxDuration: 60 };

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-image';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_KEY ou GEMINI_API_KEY não configurada' });

  const url = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${key}`;

  try {
    const body = req.body;

    const rawParts = body.contents?.[0]?.parts || body.input?.parts || body.input;
    if (!rawParts || !rawParts.length) {
      return res.status(400).json({ error: 'Payload inválido: envie contents[0].parts ou input' });
    }

    const input = rawParts.map(p => {
      if (p.text) return { type: 'text', text: p.text };
      if (p.inline_data || p.inlineData) {
        const d = p.inline_data || p.inlineData;
        return {
          type: 'image',
          mime_type: d.mime_type || d.mimeType,
          data: d.data
        };
      }
      return null;
    }).filter(Boolean);

    const payload = { model: MODEL, input };

    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await upstream.json();

    // Loga a resposta completa no Vercel para debug
    console.log('Gemini response keys:', Object.keys(data));
    if (data.steps) {
      console.log('Gemini steps:', JSON.stringify(data.steps, null, 2));
    } else {
      console.log('Gemini full response:', JSON.stringify(data).slice(0, 5000));
    }

    if (!upstream.ok) {
      console.error('Gemini error:', JSON.stringify(data));
    }

    res.status(upstream.status).json(data);
  } catch (e) {
    console.error('Proxy error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
