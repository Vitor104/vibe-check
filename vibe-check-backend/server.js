require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// --- MIDDLEWARES (A Ordem Importa Muito!) ---
app.use(cors()); 
// ESTA LINHA ABAIXO É CRÍTICA: Ela ensina o servidor a ler JSON
app.use(express.json()); 

// --- ROTAS ---
app.post('/api/analyze', async (req, res) => {
  try {
    // Log para debug: Vamos ver o que está chegando no servidor
    console.log("Recebido no Backend:", req.body); 

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'O prompt é obrigatório. O servidor recebeu: ' + JSON.stringify(req.body) });
    }

    const apiKey = process.env.REACT_APP_GEMINI_KEY;

    const systemPrompt = `
      Você é um especialista em Design UI e Cultura Pop.
      Analise o texto do usuário e retorne APENAS um JSON estrito com:
      1. "theme": { backgroundColor, textColor, buttonColor, buttonTextColor, accentColor, fontFamily }
      2. "vibeTitle": Título curto em PT-BR.
      3. "recommendations": Array com 3 objetos { type ("movie"/"music"), title, artist, reason }.
      Misture clássicos e novidades.
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
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