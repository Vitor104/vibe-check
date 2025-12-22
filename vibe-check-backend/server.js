require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('✅ Backend do VibeCheck Online (Gemini Pro Stable)!');
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

    // 🚀 CORREÇÃO FINAL: Usando 'gemini-pro'
    // Este é o modelo padrão estável. Abandonamos o Flash temporariamente
    // para garantir que a aplicação funcione sem erros 404/503.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            role: "user",
            // O gemini-pro 1.0 prefere instruções no próprio prompt do usuário
            parts: [{ text: `System: ${systemPrompt}\nUser Vibe: ${prompt}` }] 
          }],
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

    // Tratamento de segurança caso o modelo retorne sem 'content' (raro, mas possível)
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error("Resposta inesperada do Google:", data);
        return res.status(500).json({ error: 'A IA não retornou um conteúdo válido.' });
    }

    const textResult = data.candidates[0].content.parts[0].text;
    
    // Limpeza extra caso o modelo devolva markdown (```json ... ```)
    const cleanedText = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    
    res.json(JSON.parse(cleanedText));

  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando seguro na porta ${PORT}`);
});