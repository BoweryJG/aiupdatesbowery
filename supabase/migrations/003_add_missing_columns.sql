-- Add missing columns to ai_news table
ALTER TABLE ai_news 
ADD COLUMN IF NOT EXISTS news_type TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS sub_location TEXT,
ADD COLUMN IF NOT EXISTS link_status TEXT DEFAULT 'valid' 
  CHECK (link_status IN ('valid', 'invalid', 'unchecked'));

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_ai_news_news_type ON ai_news(news_type);
CREATE INDEX IF NOT EXISTS idx_ai_news_location ON ai_news(location);
CREATE INDEX IF NOT EXISTS idx_ai_news_link_status ON ai_news(link_status);

-- Update existing view to use new columns
DROP VIEW IF EXISTS todays_headlines;
CREATE OR REPLACE VIEW todays_headlines AS
SELECT * FROM ai_news
WHERE published_date >= CURRENT_DATE
  AND link_status != 'invalid'
ORDER BY importance_score DESC, published_date DESC;