-- Create function to increment view count for a news article
CREATE OR REPLACE FUNCTION increment_view_count(news_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE ai_news
    SET view_count = COALESCE(view_count, 0) + 1,
        updated_at = NOW()
    WHERE id = news_id;
END;
$$ LANGUAGE 'plpgsql';
