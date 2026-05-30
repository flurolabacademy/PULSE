// netlify/functions/generate-titles.js
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { topic, niche } = JSON.parse(event.body);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Eres PULSE, experto en copywriting para ebooks.'
          },
          {
            role: 'user',
            content: `Genera 10 títulos persuasivos para un ebook sobre: ${topic}
            Nicho: ${niche || 'general'}
            
            Requisitos:
            - Usar números cuando sea posible
            - Incluir beneficio claro
            - Crear curiosidad o urgencia
            - Máximo 8 palabras por título
            - Tono: profesional pero cercano
            
            Formato: Lista numerada 1-10.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.8
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        titles: data.choices[0].message.content
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
