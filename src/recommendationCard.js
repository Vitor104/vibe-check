import React from 'react';
import { Music, Film } from 'lucide-react';


const RecommendationCard = ({ item, theme, delay }) => {
  const Icon = item.type === 'music' ? Music : Film;
  
  return (
    <div 
      className="p-4 rounded-xl border backdrop-blur-sm transform transition-all duration-700 hover:-translate-y-1 hover:shadow-lg opacity-0 animate-fade-in-up w-full"
      style={{ 
        borderColor: theme.accentColor + '40',
        backgroundColor: theme.backgroundColor === '#000000' || theme.backgroundColor < '#333' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        color: theme.textColor,
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards'
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-lg shrink-0"
          style={{ backgroundColor: theme.accentColor + '20', color: theme.accentColor }}
        >
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-lg leading-tight truncate">{item.title}</h3>
          {item.artist && <p className="text-sm opacity-80 mb-1 truncate">{item.artist}</p>}
          <p className="text-xs opacity-70 italic mt-2 line-clamp-3">"{item.reason}"</p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;