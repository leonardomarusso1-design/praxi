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
        return { type: 'image', mime_type: d.mime_type || d.mimeType, data: d.data };
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
    console.log('Gemini status:', upstream.status, '| Keys:', Object.keys(data));

    if (!upstream.ok) {
      console.error('Gemini error:', JSON.stringify(data).slice(0, 500));
      return res.status(upstream.status).json(data);
    }

    // Extrai imagem de steps[N].content[M].data (confirmado via gemini-debug.js)
    for (const step of data.steps || []) {
      const contents = step?.content || step?.modelOutput?.content || [];
      for (const c of contents) {
        if (c.data && typeof c.data === 'string' && c.data.length > 200) {
          const mime = c.mime_type || c.mimeType || 'image/png';
          console.log('✅ Imagem extraída:', mime, '| tamanho base64:', c.data.length);
          return res.json({ image: `data:${mime};base64,${c.data}` });
        }
      }
    }

    // Nenhuma imagem encontrada — loga estrutura sem o base64
    const safe = JSON.parse(JSON.stringify(data));
    (safe.steps || []).forEach(step => {
      (step.content || []).forEach(c => {
        if (c.data && c.data.length > 100) c.data = '[BASE64 ' + c.data.length + ' chars]';
      });
    });
    console.warn('⚠️ Sem imagem na resposta. Estrutura:', JSON.stringify(safe).slice(0, 2000));
    return res.status(422).json({ error: 'Gemini não gerou imagem', structure: safe });

  } catch (e) {
    console.error('Proxy error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
