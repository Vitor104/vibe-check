import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, Palette, AlertCircle } from 'lucide-react';
import RecommendationCard from './recommendationCard';
import { analyzeVibeWithGemini, GOOGLE_FONTS_LINK, getFontFamily } from './utils/configAPI';


export default function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // tema padrão
  const defaultTheme = {
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    buttonColor: "#000000",
    buttonTextColor: "#ffffff",
    accentColor: "#6366f1",
    fontFamily: "sans-serif"
  };

  const currentTheme = data?.theme || defaultTheme;

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    console.time("⏱️ Tempo Total da Requisição");
    
    setLoading(true);
    setError(null);
    setShowResults(false);
    
    try {
      const result = await analyzeVibeWithGemini(prompt);
      
      setData(result);
      setShowResults(true);
    } catch (err) {
      console.error(err);
      if (err.message === "API_KEY_MISSING") {
        setError("Erro: Adicione sua API Key no arquivo src/utils/configAPI.js");
      } else if (err.message === "API_KEY_INVALID") {
        setError("Erro: A API Key configurada é inválida.");
      } else {
        setError("Ocorreu um erro ao conectar com a IA. Tente novamente.");
      }
    } finally {
      setLoading(false);
      console.timeEnd("⏱️ Tempo Total da Requisição");
    }
  };

  return (
    <>
      <link href={GOOGLE_FONTS_LINK} rel="stylesheet" />
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>

      <div 
        className="min-h-screen w-full transition-colors duration-1000 ease-in-out flex flex-col items-center py-10 px-4 sm:px-8 overflow-x-hidden"
        style={{ 
          backgroundColor: currentTheme.backgroundColor,
          color: currentTheme.textColor,
          fontFamily: getFontFamily(currentTheme.fontFamily)
        }}
      >
        <div className="max-w-3xl w-full mx-auto relative z-10 flex flex-col items-center">
          
          {/* header */}
          <header className="text-center mb-8 md:mb-12 transition-all duration-700 px-2 mt-8">
            <div className="inline-flex items-center justify-center p-3 rounded-full mb-6 shadow-sm"
               style={{ backgroundColor: currentTheme.accentColor + '20', color: currentTheme.accentColor }}>
              <Palette size={24} />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 tracking-tight transition-all duration-500 leading-tight">
              {showResults && data?.vibeTitle ? data.vibeTitle : "Mood & Vibe Check"}
            </h1>
            <p className="text-base sm:text-lg md:text-xl opacity-70 max-w-lg mx-auto leading-relaxed">
              {showResults 
                ? "Sua atmosfera foi traduzida em cores e recomendações." 
                : "Digite como você se sente ou descreva uma cena. O design vai se adaptar."}
            </p>
          </header>

          {/* mensagem de erro */}
          {error && (
            <div className="w-full mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 animate-pulse">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* área de input */}
          <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-1.5 sm:p-2 shadow-xl border border-white/20 transition-all duration-500 hover:shadow-2xl">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Estou lendo um livro antigo em uma biblioteca empoeirada enquanto chove lá fora..."
                className="w-full bg-transparent p-4 sm:p-6 text-base sm:text-xl outline-none resize-none min-h-[120px] rounded-xl transition-colors placeholder:opacity-50"
                style={{ color: currentTheme.textColor }}
                disabled={loading}
              />
              
              <div className="flex flex-col sm:flex-row justify-between items-center px-2 sm:px-4 pb-2 sm:pb-4 gap-4">
                <span className="text-xs opacity-50 flex items-center gap-1 order-2 sm:order-1">
                  <Sparkles size={12} /> Made by Vitor
                </span>
                
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !prompt.trim()}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
                  style={{ 
                    backgroundColor: currentTheme.buttonColor, 
                    color: currentTheme.buttonTextColor 
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Sentindo...
                    </>
                  ) : (
                    <>
                      Transformar Vibe
                      <Sparkles size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* resultados */}
          {showResults && data && (
            <div className="mt-12 sm:mt-16 grid gap-8 animate-fade-in-up w-full">
              
              <div className="flex items-center gap-4 opacity-30 px-4">
                <div className="h-px bg-current flex-1" />
                <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-center">Recomendações Curadas</span>
                <div className="h-px bg-current flex-1" />
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {data.recommendations.map((item, index) => (
                  <RecommendationCard 
                    key={index} 
                    item={item} 
                    theme={currentTheme} 
                    delay={index * 200}
                  />
                ))}
              </div>

              <div className="flex justify-center mt-4 sm:mt-8">
                <button
                  onClick={() => {
                    setPrompt("");
                    setShowResults(false);
                    setData(null);
                  }}
                  className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity p-3"
                >
                  <RefreshCw size={14} />
                  Resetar Experiência
                </button>
              </div>
            </div>
          )}
          
          {/* sugestões */}
          {!showResults && !loading && (
            <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 opacity-60 w-full">
              {["Cyberpunk Neon City", "Café calmo domingo", "Floresta mística", "Festa anos 80"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="text-xs sm:text-sm p-3 rounded-lg border border-current hover:bg-current hover:bg-opacity-10 transition-all text-center truncate"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}