-- Create AI news articles table
CREATE TABLE IF NOT EXISTS ai_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    source TEXT NOT NULL,
    source_url TEXT NOT NULL,
    published_date TIMESTAMP WITH TIME ZONE NOT NULL,
    scraped_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    companies TEXT[] DEFAULT '{}',
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    importance_score INTEGER CHECK (importance_score >= 1 AND importance_score <= 10),
    image_url TEXT,
    author TEXT,
    reading_time_minutes INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ai_news_published_date ON ai_news(published_date DESC);
CREATE INDEX idx_ai_news_category ON ai_news(category);
CREATE INDEX idx_ai_news_importance_score ON ai_news(importance_score DESC);
CREATE INDEX idx_ai_news_companies ON ai_news USING GIN(companies);
CREATE INDEX idx_ai_news_tags ON ai_news USING GIN(tags);
CREATE INDEX idx_ai_news_source ON ai_news(source);

-- Create full-text search index
CREATE INDEX idx_ai_news_search ON ai_news USING GIN(
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(summary, ''))
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_ai_news_updated_at BEFORE UPDATE ON ai_news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for today's headlines
CREATE OR REPLACE VIEW todays_headlines AS
SELECT * FROM ai_news
WHERE published_date >= CURRENT_DATE
ORDER BY importance_score DESC, published_date DESC;

-- Create view for trending topics (last 7 days)
CREATE OR REPLACE VIEW trending_topics AS
SELECT 
    unnest(tags) as tag,
    COUNT(*) as mention_count
FROM ai_news
WHERE published_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY tag
ORDER BY mention_count DESC
LIMIT 20;