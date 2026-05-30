// netlify/functions/generate-ebook.js
exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { topic, pages, niche, tone } = JSON.parse(event.body);
    
    // Llamar a Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
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
            - 2-3 puntos clave
            - Ejemplo práctico o caso
            - Acción a tomar
            
            Formato: Markdown limpio, sin emojis excesivos.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const content = data.choices[0].message.content;
    
    // Extraer título del contenido
    const titleMatch = content.match(/^#\s(.+)$/m) || content.match(/^(.+)$/m);
    const title = titleMatch ? titleMatch[1] : topic;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        content: content,
        title: title,
        niche: niche,
        pages: pages
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
