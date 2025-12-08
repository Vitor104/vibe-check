require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('✅ Backend do VibeCheck Online (v1.5 Stable Fix)!');
});

app.post('/api/analyze', async (req, res) => {
  try {
    console.log("Recebido no Backend:", req.body); 

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'O prompt é obrigatório.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("ERRO CRÍTICO: Chave API não encontrada no .env");
      return res.status(500).json({ error: 'Configuração do servidor inválida (API Key ausente).' });
    }

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

    // 🚀 CORREÇÃO CRÍTICA:
    // A URL para o gemini-1.5-flash na v1beta mudou ligeiramente ou requer essa estrutura exata.
    // Se o 1.5-flash continuar falhando, o fallback seguro é o 'gemini-pro'.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            role: "user",
            parts: [{ text: `System: ${systemPrompt}\nUser Vibe: ${prompt}` }] 
          }],
          // Removemos o systemInstruction separado para garantir compatibilidade
          // e embutimos no prompt do usuário acima.
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("Erro no Google:", data);
        const errorMessage = data.error?.message || 'Falha ao processar com IA';
        return res.status(500).json({ error: errorMessage });
    }

    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json(JSON.parse(textResult));

  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando seguro na porta ${PORT}`);
});