// api/generate-ebook.js — Vercel Serverless Function
export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, pages, niche, tone } = req.body;
    
    // Obtener API key
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'GROQ_API_KEY no configurada' 
      });
    }
    
    // Llamar a Groq API
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
            content: 'Eres PULSE, un agente IA especializado en crear ebooks de alto valor que se venden. Tu estilo es directo, práctico y orientado a resultados.'
          },
          {
            role: 'user',
            content: `Eres PULSE, un agente IA especializado en crear ebooks rentables.
            
            Crea un ebook de ${pages} páginas sobre: ${topic}
            Nicho: ${niche}
            Tono: ${tone || 'profesional pero cercano'}
            
            Estructura requerida:
            1. TÍTULO PERSUASIVO (máximo 8 palabras)
            2. SUBTÍTULO (beneficio principal)
            3. INTRODUCCIÓN (gancho emocional, 200 palabras)
            4. ${pages - 3} CAPÍTULOS de contenido práctico y accionable
            5. CONCLUSIÓN (resumen + CTA)
            6. RECURSOS ADICIONALES (checklist, plantilla, etc.)
            
            Cada capítulo debe incluir:
- Título claro
- Introducción al capítulo (150 palabras)
- 3-5 puntos clave detallados (200 palabras cada uno)
- 2 ejemplos prácticos o casos reales
- Ejercicio o acción a tomar
- Resumen del capítulo (100 palabras)

IMPORTANTE: Cada capítulo debe tener MÍNIMO 800 palabras. El ebook completo debe tener contenido sustancial, no resúmenes breves.
            
            Formato: Markdown limpio, sin emojis excesivos.`
          }
        ],
        max_tokens: 8000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({
        success: false,
        error: `Groq error: ${data.error.message}`
      });
    }

    const content = data.choices[0].message.content;
    const titleMatch = content.match(/^#\s(.+)$/m) || content.match(/^(.+)$/m);
    const title = titleMatch ? titleMatch[1] : topic;

    return res.status(200).json({
      success: true,
      content: content,
      title: title,
      niche: niche,
      pages: pages
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
