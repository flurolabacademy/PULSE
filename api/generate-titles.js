// api/generate-titles.js — Vercel
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, niche } = req.body;
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
      return res.status(500).json({ success: false, error: data.error.message });
    }

    return res.status(200).json({
      success: true,
      titles: data.choices[0].message.content
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
