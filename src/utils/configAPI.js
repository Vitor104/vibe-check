/**
 * src/utils/configAPI.js
 * Agora conecta ao NOSSO backend (localhost:3001), 
 * o Front não sabe mais nada sobre chaves de API ou Google.
 */

export const GOOGLE_FONTS_LINK = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&family=Playfair+Display:wght@400;700&family=Space+Mono:wght@400;700&family=Dancing+Script:wght@400;700&display=swap";

export const getFontFamily = (family) => {
  switch (family) {
    case 'serif': return '"Playfair Display", serif';
    case 'monospace': return '"Space Mono", monospace';
    case 'cursive': return '"Dancing Script", cursive';
    default: return '"Inter", sans-serif';
  }
};

// Função refatorada para chamar o Backend Local
export async function analyzeVibeWithGemini(userInput) {
  
  // LOG DE DEBUG: Vamos ver o que está chegando aqui
  console.log("--- DEBUG FRONTEND ---");
  console.log("1. Texto digitado:", userInput);

  // O endereço do seu servidor local (que criamos no Dia 2)
  const BACKEND_URL = "http://localhost:3001/api/analyze";
  
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      // Agora mandamos um JSON simples com a propriedade 'prompt'
      // O server.js espera req.body.prompt, lembra?
      body: JSON.stringify({ prompt: userInput }),
    });

    if (!response.ok) {
      // Se o servidor der erro (500 ou 400), tentamos ler a mensagem
      const errorData = await response.json().catch(() => ({}));
      console.error("Erro retornado pelo Backend:", errorData);
      throw new Error(errorData.error || "Falha na comunicação com o servidor");
    }
    
    // O backend já nos devolve o JSON pronto e limpo.
    // Não precisamos mais fazer JSON.parse aqui, pois o server já fez.
    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Erro capturado no frontend:", error);
    throw error; // Repassa o erro para o App.js mostrar o alerta vermelho na tela
  }
}