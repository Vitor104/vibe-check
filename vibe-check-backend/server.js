require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();


app.use(cors()); 
app.use(express.json()); 

// --- ROTAS ---
app.post('/api/analyze', async (req, res) => {
  try {
    
   // console.log("Recebido no Backend:", req.body); 

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'O prompt é obrigatório. O servidor recebeu: ' + JSON.stringify(req.body) });
    }

    const apiKey = process.env.REACT_APP_GEMINI_KEY;

    const systemPrompt = `
      Gere um JSON estrito para uma UI baseada nesta vibe.
      Responda APENAS o JSON. Sem markdown.
      
      {
        "theme": { "backgroundColor": "#HEX", "textColor": "#HEX", "buttonColor": "#HEX", "buttonTextColor": "#HEX", "accentColor": "#HEX", "fontFamily": "serif/sans-serif/monospace/cursive" },
        "vibeTitle": "Título curto (max 3 palavras) PT-PT",
        "recommendations": [
          { "type": "movie/music", "title": "Nome", "artist": "Autor", "reason": "Max 5 palavras" }
        ]
      }
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Descrição: "${prompt}"` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("Erro no Google:", data);
        return res.status(500).json({ error: 'Falha ao processar com IA' });
    }

    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json(JSON.parse(textResult));

  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando seguro na porta ${PORT}`);
});