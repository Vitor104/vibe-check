import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, Palette } from 'lucide-react';
import RecommendationCard from './recommendationCard';
import { analyzeVibeWithGemini, GOOGLE_FONTS_LINK, getFontFamily } from './utils/configAPI';

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Tema padrão inicial (neutro/dark clean)
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
    
    setLoading(true);
    setShowResults(false);
    
    // Pequeno delay artificial para a UI não "piscar"
    const minTime = new Promise(resolve => setTimeout(resolve, 800));
    const apiCall = analyzeVibeWithGemini(prompt);
    
    const [_, result] = await Promise.all([minTime, apiCall]);
    
    setData(result);
    setLoading(false);
    setShowResults(true);
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
        className="min-h-screen w-full transition-colors duration-1000 ease-in-out flex flex-col items-center justify-center p-4 sm:p-8"
        style={{ 
          backgroundColor: currentTheme.backgroundColor,
          color: currentTheme.textColor,
          fontFamily: getFontFamily(currentTheme.fontFamily)
        }}
      >
        <div className="max-w-3xl w-full mx-auto relative z-10">
          
          {/* Header */}
          <header className="text-center mb-12 transition-all duration-700">
            <div className="inline-flex items-center justify-center p-3 rounded-full mb-6 shadow-sm"
               style={{ backgroundColor: currentTheme.accentColor + '20', color: currentTheme.accentColor }}>
              <Palette size={24} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight transition-all duration-500">
              {showResults && data?.vibeTitle ? data.vibeTitle : "Mood & Vibe Check"}
            </h1>
            <p className="text-lg md:text-xl opacity-70 max-w-lg mx-auto">
              {showResults 
                ? "Sua atmosfera foi traduzida em cores e recomendações." 
                : "Digite como você se sente ou descreva uma cena. O design vai se adaptar."}
            </p>
          </header>

          {/* Input Area */}
          <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-white/20 transition-all duration-500 hover:shadow-2xl">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Estou lendo um livro antigo em uma biblioteca empoeirada enquanto chove lá fora..."
                className="w-full bg-transparent p-6 text-lg md:text-xl outline-none resize-none min-h-[120px] rounded-xl transition-colors placeholder:opacity-50"
                style={{ color: currentTheme.textColor }}
                disabled={loading}
              />
              
              <div className="flex justify-between items-center px-4 pb-4">
                <span className="text-xs opacity-50 flex items-center gap-1">
                  <Sparkles size={12} /> Made by Vitor
                </span>
                
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !prompt.trim()}
                  className="px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

          {/* Results Section */}
          {showResults && data && (
            <div className="mt-16 grid gap-8 animate-fade-in-up">
              
              {/* Divider */}
              <div className="flex items-center gap-4 opacity-30">
                <div className="h-px bg-current flex-1" />
                <span className="text-sm font-mono uppercase tracking-widest">Recomendações Curadas</span>
                <div className="h-px bg-current flex-1" />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.recommendations.map((item, index) => (
                  <RecommendationCard 
                    key={index} 
                    item={item} 
                    theme={currentTheme} 
                    delay={index * 200}
                  />
                ))}
              </div>

              {/* Reset Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => {
                    setPrompt("");
                    setShowResults(false);
                    setData(null);
                  }}
                  className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-opacity p-2"
                >
                  <RefreshCw size={14} />
                  Resetar Experiência
                </button>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {!showResults && !loading && (
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-60">
              {["Cyberpunk Neon City", "Café da manhã calmo domingo", "Floresta sombria e mística", "Festa na piscina anos 80"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="text-xs p-3 rounded-lg border border-current hover:bg-current hover:bg-opacity-10 transition-all text-center truncate"
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