export const config = { api: { bodyParser: { sizeLimit: '10mb' } }, maxDuration: 60 };

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp-image-generation';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_KEY ou GEMINI_API_KEY não configurada' });

  const url = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${key}`;

  try {
    const body = req.body;

    const payload = {
      model: MODEL,
      input: {
        type: 'text',
        parts: []
      },
      response_modalities: ['text', 'image']
    };

    const rawParts = body.contents?.[0]?.parts || body.input?.parts;
    if (!rawParts || !rawParts.length) {
      return res.status(400).json({ error: 'Payload inválido: envie contents[0].parts ou input.parts' });
    }

    payload.input.parts = rawParts.map(p => {
      if (p.text) return { type: 'text', text: p.text };
      if (p.inline_data || p.inlineData) {
        const d = p.inline_data || p.inlineData;
        return {
          type: 'image',
          source: {
            type: 'base64',
            media_type: d.mime_type || d.mimeType,
            data: d.data
          }
        };
      }
      return null;
    }).filter(Boolean);

    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error('Gemini error:', JSON.stringify(data));
    }

    res.status(upstream.status).json(data);
  } catch (e) {
    console.error('Proxy error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
