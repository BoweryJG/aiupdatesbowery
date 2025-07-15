import { useState, useEffect } from 'react';
import type { AINews } from '../../types/ai';
import { formatDistanceToNow } from '../../utils/dateUtils';
import '../../styles/mobile-prismatic-stream.css';

interface MobilePrismaticStreamProps {
  articles: AINews[];
  onVoiceCommand?: (command: any) => void;
}

export function MobilePrismaticStream({ articles, onVoiceCommand }: MobilePrismaticStreamProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Filter articles by category if selected
  const filteredArticles = selectedCategory 
    ? articles.filter(article => article.news_type === selectedCategory)
    : articles;

  // Group articles by importance for better visual hierarchy
  const sortedArticles = [...filteredArticles].sort((a, b) => 
    (b.importance_score || 0) - (a.importance_score || 0)
  );

  return (
    <div className="prismatic-container">
      {/* Category navigation */}
      <nav className="category-nav">
        <div className="category-scroll">
          <button 
            className={`category-pill ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          <button 
            className="category-pill"
            onClick={() => setSelectedCategory('ai')}
          >
            🤖 AI
          </button>
          <button 
            className="category-pill"
            onClick={() => setSelectedCategory('world')}
          >
            🌍 World
          </button>
          <button 
            className="category-pill"
            onClick={() => setSelectedCategory('business')}
          >
            💼 Business
          </button>
          <button 
            className="category-pill"
            onClick={() => setSelectedCategory('nyc')}
          >
            🗽 NYC
          </button>
          <button 
            className="category-pill"
            onClick={() => setSelectedCategory('costa-rica')}
          >
            🌴 Costa Rica
          </button>
        </div>
      </nav>

      {/* News strips */}
      {sortedArticles.map((article, index) => (
        <a 
          key={article.id}
          href={`#article-${article.id}`}
          id={`article-${article.id}`}
          className="news-strip"
          style={{ '--strip-delay': `${index * 50}ms` } as any}
        >
          <div 
            className="strip-content" 
            data-type={article.news_type || 'ai'}
          >
            {/* Micro thumbnail */}
            {article.image_url && (
              <img 
                className="strip-thumbnail"
                src={article.image_url}
                alt=""
                loading="lazy"
                decoding="async"
              />
            )}
            
            {/* Text content */}
            <div className="strip-text">
              <h3 className="strip-headline">{article.title}</h3>
              <div className="strip-meta">
                <span>{article.source}</span>
                <span>{formatDistanceToNow(new Date(article.published_date))}</span>
              </div>
            </div>

            {/* Importance indicator */}
            {article.importance_score && article.importance_score >= 8 && (
              <div 
                className="strip-importance" 
                data-level="high"
                aria-label="Breaking news"
              />
            )}

            {/* Hidden expanded content */}
            <div className="strip-full-content">
              <p>{article.summary || article.content}</p>
              <div className="article-meta">
                <span>{article.location}</span>
                {article.sub_location && <span> • {article.sub_location}</span>}
                {article.companies.length > 0 && (
                  <div className="companies">
                    {article.companies.join(' • ')}
                  </div>
                )}
              </div>
              <a 
                href={article.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="read-more"
              >
                Read full article →
              </a>
            </div>
          </div>
        </a>
      ))}

      {/* Voice input FAB */}
      <button 
        className="voice-fab"
        onClick={() => onVoiceCommand?.({ type: 'toggle' })}
        aria-label="Voice commands"
      >
        🎤
      </button>
    </div>
  );
}