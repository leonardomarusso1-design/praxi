export const config = { api: { bodyParser: { sizeLimit: '10mb' } }, maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_KEY ou GEMINI_API_KEY não configurada' });

  const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-image';
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

    if (!upstream.ok) {
      return res.status(upstream.status).json(data);
    }

    // Salva o resultado em um arquivo temporário acessível
    const resultId = 'debug-' + Date.now();
    // Guarda só a estrutura da resposta (sem a imagem base64 gigante)
    const structure = JSON.parse(JSON.stringify(data));
    if (structure.steps) {
      structure.steps.forEach((step, i) => {
        if (step.content) {
          step.content.forEach((c, j) => {
            if (c.data && typeof c.data === 'string') {
              c.data = c.data.slice(0, 100) + '... [TRUNCADO ' + c.data.length + ' chars]';
            }
          });
        }
      });
    }

    res.status(200).json({
      ok: true,
      structure,
      rawPreview: JSON.stringify(data).slice(0, 3000) + '...',
      keys: Object.keys(data)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
