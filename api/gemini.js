export const config = { api: { bodyParser: { sizeLimit: '10mb' } }, maxDuration: 60 };

// Vercel Serverless Function — proxy para Gemini image generation
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GEMINI_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_KEY não configurada' });

  // Modelo correto para geração de imagem com input de imagem
  // gemini-2.0-flash-exp ou gemini-2.0-pro-exp-02-05
  // O modelo flash é mais rápido, mas o pro pode ser mais robusto para imagens
  const MODEL = req.body.model || 'gemini-2.0-flash-exp';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

  try {
    const body = req.body;

    // Garante que responseModalities está presente
    if (body.generationConfig) {
      body.generationConfig.responseModalities = ['IMAGE', 'TEXT'];
    } else {
      body.generationConfig = { responseModalities: ['IMAGE', 'TEXT'] };
    }

    // Garante role: user nos contents
    if (body.contents && body.contents[0] && !body.contents[0].role) {
      body.contents[0].role = 'user';
    }

    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();

    // Log para debug nos Vercel Logs
    if (!upstream.ok) {
      console.error('Gemini error:', JSON.stringify(data));
    }

    res.status(upstream.status).json(data);
  } catch (e) {
    console.error('Proxy error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
