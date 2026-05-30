// api/generate-niches.js — Vercel
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, count } = req.body;
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'GROQ_API_KEY no configurada' });
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Eres PULSE, investigador de nichos rentables para ebooks.'
          },
          {
            role: 'user',
            content: `Genera ${count || 20} ideas de nichos rentables para ebooks en la categoría: ${category}
            
            Para cada nicho incluir:
            - Nombre del nicho
            - Sub-nicho específico
            - Dificultad (Baja/Media/Alta)
            - Potencial de ingresos (Bajo/Medio/Alto)
            - Por qué funciona ahora
            
            Formato: Tabla markdown.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ success: false, error: data.error.message });
    }

    return res.status(200).json({
      success: true,
      niches: data.choices[0].message.content
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
