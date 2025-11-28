export const GOOGLE_FONTS_LINK = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&family=Playfair+Display:wght@400;700&family=Space+Mono:wght@400;700&family=Dancing+Script:wght@400;700&display=swap";
const API_KEY = process.env.REACT_APP_GEMINI_KEY;

// helper para selecionar a fonte correta no CSS
export const getFontFamily = (family) => {
  switch (family) {
    case 'serif': return '"Playfair Display", serif';
    case 'monospace': return '"Space Mono", monospace';
    case 'cursive': return '"Dancing Script", cursive';
    default: return '"Inter", sans-serif';
  }
};

// função principal de chamada à API
export async function analyzeVibeWithGemini(userInput) {
  
  
  if (!API_KEY) {
    console.error("ERRO: API Key não configurada em src/utils/configAPI.js");
    throw new Error("API_KEY_MISSING");
  }
  
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

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Descrição: "${userInput}"` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    );

    if (response.status === 403) throw new Error("API_KEY_INVALID");
    if (!response.ok) throw new Error("Falha na API");
    
    const data = await response.json();
    return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);

  } catch (error) {
    throw error;
  }
}