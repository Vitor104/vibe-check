export const GOOGLE_FONTS_LINK = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&family=Playfair+Display:wght@400;700&family=Space+Mono:wght@400;700&family=Dancing+Script:wght@400;700&display=swap";

// Helper para mapear fontes genéricas para as do Google Fonts
export const getFontFamily = (family) => {
  switch (family) {
    case 'serif': return '"Playfair Display", serif';
    case 'monospace': return '"Space Mono", monospace';
    case 'cursive': return '"Dancing Script", cursive';
    default: return '"Inter", sans-serif';
  }
};

// Função para chamar a API do Gemini
export async function analyzeVibeWithGemini(userInput) {
  const apiKey = ""; // A chave é injetada pelo ambiente de execução
  
  const systemPrompt = `
    Você é um especialista em Design UI, Psicologia das Cores e Cultura Pop atualizada.
    Sua tarefa é analisar o texto do usuário (um humor ou descrição de cena) e retornar um JSON estrito.
    
    Baseado na descrição, defina:
    1. Uma paleta de cores CSS (hex codes) que combine perfeitamente com a 'vibe'.
    2. Uma sugestão de fonte (sans-serif, serif, monospace, ou cursive).
    3. 3 recomendações de mídia (Filmes, Músicas ou Álbuns) que combinem com o humor. 
       IMPORTANTE: Tente misturar clássicos atemporais com lançamentos recentes (últimos 5 anos) ou tendências virais atuais. Evite recomendar apenas coisas antigas.
    
    O formato da resposta DEVE ser APENAS este JSON válido, sem markdown:
    {
      "theme": {
        "backgroundColor": "#HEX",
        "textColor": "#HEX",
        "buttonColor": "#HEX",
        "buttonTextColor": "#HEX",
        "accentColor": "#HEX",
        "fontFamily": "nome da fonte genérica (sans-serif, serif, monospace, cursive)"
      },
      "vibeTitle": "Um título curto e criativo para essa vibe (em Português)",
      "recommendations": [
        { "type": "movie" ou "music", "title": "Nome da Obra", "artist": "Artista/Diretor (opcional)", "reason": "Por que combina (curto)" }
      ]
    }
  `;

  const userPrompt = `A descrição do usuário é: "${userInput}"`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    );

    if (!response.ok) throw new Error("Falha na API");
    
    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(textResult);

  } catch (error) {
    console.error("Erro ao analisar vibe:", error);
    // Fallback gracioso
    return {
      theme: {
        backgroundColor: "#1a1a1a",
        textColor: "#f0f0f0",
        buttonColor: "#3b82f6",
        buttonTextColor: "#ffffff",
        accentColor: "#60a5fa",
        fontFamily: "sans-serif"
      },
      vibeTitle: "Vibe Indefinida",
      recommendations: []
    };
  }
}