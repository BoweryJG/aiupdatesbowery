-- Migration script to expand ai_news table for multi-category news aggregation
-- Run this in Supabase SQL editor

-- First, rename the table from ai_news to news
ALTER TABLE ai_news RENAME TO news;

-- Add new columns for expanded news categories
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS news_type VARCHAR(50) DEFAULT 'ai',
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS sub_location VARCHAR(100),
ADD COLUMN IF NOT EXISTS link_status VARCHAR(20) DEFAULT 'unchecked',
ADD COLUMN IF NOT EXISTS last_validated TIMESTAMP,
ADD COLUMN IF NOT EXISTS alternate_url TEXT,
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_news_type ON news(news_type);
CREATE INDEX IF NOT EXISTS idx_news_location ON news(location);
CREATE INDEX IF NOT EXISTS idx_news_link_status ON news(link_status);
CREATE INDEX IF NOT EXISTS idx_news_published_date ON news(published_date DESC);

-- Update existing AI news entries
UPDATE news SET news_type = 'ai' WHERE news_type IS NULL;

-- Create a view for backwards compatibility
CREATE OR REPLACE VIEW ai_news AS 
SELECT * FROM news WHERE news_type = 'ai';

-- Add new categories to the category enum if using one
-- If category column exists, we might need to expand it
DO $$ 
BEGIN
    -- Check if we need to add new category values
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'news' 
        AND column_name = 'category'
    ) THEN
        -- Add new categories for different news types
        -- This assumes category is TEXT, not an ENUM
        -- If it's an ENUM, we'd need to recreate it
        NULL; -- Categories will be handled by news_type and existing category field
    END IF;
END $$;

-- Create a function to validate URLs
CREATE OR REPLACE FUNCTION validate_news_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic URL validation
    RETURN url IS NOT NULL 
        AND url != '' 
        AND (url LIKE 'http://%' OR url LIKE 'https://%');
END;
$$ LANGUAGE plpgsql;

-- Add constraint to ensure valid URLs
ALTER TABLE news 
ADD CONSTRAINT valid_source_url CHECK (validate_news_url(source_url));

-- Create updated_at trigger if not exists
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_news_updated_at
    BEFORE UPDATE ON news
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();