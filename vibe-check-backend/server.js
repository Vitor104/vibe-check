require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'O prompt é obrigatório' });
    }   

    try {
        const apiKey = process.env.REACT_APP_GEMINI_KEY;

        const systemPrompt = `
    Você é um especialista em Design UI, Psicologia das Cores e Cultura Pop atualizada.
    Sua tarefa é analisar o texto do usuário (um humor ou descrição de cena) e retornar um JSON estrito.
    
    Baseado na descrição, defina:
    1. Uma paleta de cores CSS (hex codes) que combine perfeitamente com a 'vibe'.
    2. Uma sugestão de fonte (sans-serif, serif, monospace, ou cursive).
    3. 3 recomendações de mídia (Filmes, Músicas ou Álbuns) que combinem com o humor. 
       IMPORTANTE: Misture clássicos com lançamentos recentes (últimos 5 anos).
    
    O formato da resposta DEVE ser APENAS este JSON válido, sem markdown:
    {
      "theme": {
        "backgroundColor": "#HEX",
        "textColor": "#HEX",
        "buttonColor": "#HEX",
        "buttonTextColor": "#HEX",
        "accentColor": "#HEX",
        "fontFamily": "nome da fonte genérica"
      },
      "vibeTitle": "Título curto (PT-BR)",
      "recommendations": [
        { "type": "movie" ou "music", "title": "Nome", "artist": "Artista/Diretor", "reason": "Motivo curto" }
      ]
    }
  `;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Descrição: "${text}"` }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: { responseMimeType: "application/json" }
                }),
            }
        );

        const data = await response.json();
        if (!response.ok) {
            return res.status(500).json({ error: 'Erro ao comunicar com a API de IA' });
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
    console.log(`Server is running on http://localhost:${PORT}`);
});