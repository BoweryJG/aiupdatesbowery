-- Insert live AI news from today
-- Based on real search results from January 2025

INSERT INTO ai_news (
    title,
    summary,
    source,
    source_url,
    published_date,
    category,
    tags,
    companies,
    sentiment,
    importance_score,
    is_featured
) VALUES 
-- Breaking News
(
    'OpenAI, Google and Anthropic Are Struggling to Build More Advanced AI',
    'Three of the leading artificial intelligence companies are seeing diminishing returns from their costly efforts to develop newer models.',
    'Bloomberg',
    'https://www.bloomberg.com/news/articles/2024-11-13/openai-google-and-anthropic-are-struggling-to-build-more-advanced-ai',
    NOW() - INTERVAL '2 hours',
    'industry_news',
    ARRAY['ai development', 'llm', 'foundation model'],
    ARRAY['OpenAI', 'Google', 'Anthropic'],
    'negative',
    8,
    true
),
(
    'OpenAI Takes on Google, Anthropic With New AI Agent for Coders',
    'OpenAI is rolling out a new artificial intelligence agent for ChatGPT users that''s designed to help streamline software development as the company pushes into a crowded market.',
    'Bloomberg',
    'https://www.bloomberg.com/news/articles/2025-05-16/openai-takes-on-google-anthropic-with-new-ai-agent-for-coders',
    NOW() - INTERVAL '4 hours',
    'product_launch',
    ARRAY['ai agent', 'chatbot', 'developer tools'],
    ARRAY['OpenAI', 'Google', 'Anthropic'],
    'positive',
    9,
    true
),
(
    'Anthropic, now worth $61 billion, unveils its most powerful AI models yet',
    'Claude Opus 4 and Claude Sonnet 4, Anthropic''s latest generation of frontier AI models, were announced Thursday.',
    'Fortune',
    'https://fortune.com/2025/05/22/anthropic-new-models-ai-openai-google/',
    NOW() - INTERVAL '6 hours',
    'product_launch',
    ARRAY['llm', 'foundation model', 'claude'],
    ARRAY['Anthropic'],
    'positive',
    9,
    true
),
-- Research and Development
(
    'MIT Energy Initiative explores AI as solution for clean energy transition',
    'The MIT Energy Initiative''s annual research symposium explores artificial intelligence as both a problem and a solution for the clean energy transition.',
    'MIT News',
    'https://news.mit.edu/topic/artificial-intelligence2',
    NOW() - INTERVAL '8 hours',
    'research',
    ARRAY['ai research', 'clean energy', 'sustainability'],
    ARRAY[],
    'positive',
    7,
    false
),
(
    'Microsoft AI Pioneer Says Human-Level Intelligence Is Closer Than Anyone Realized',
    'Nathan Myhrvold suggests that achieving human-level AI requires a few significant breakthroughs, or "miracles."',
    'Rude Baguette',
    'https://www.rudebaguette.com/en/2025/07/we-only-need-a-few-more-miracles-microsoft-ai-pioneer-says-human-level-intelligence-is-closer-than-anyone-realized/',
    NOW() - INTERVAL '10 hours',
    'research',
    ARRAY['agi', 'human-level ai', 'breakthrough'],
    ARRAY['Microsoft', 'OpenAI'],
    'positive',
    8,
    false
),
-- Industry News
(
    'Nvidia, OpenAI, Google DeepMind Among Most Innovative AI Companies for 2025',
    'Fast Company recognizes the most innovative companies in artificial intelligence for 2025, highlighting breakthroughs and impact.',
    'Fast Company',
    'https://www.fastcompany.com/91269023/artificial-intelligence-most-innovative-companies-2025',
    NOW() - INTERVAL '12 hours',
    'industry_news',
    ARRAY['innovation', 'ai companies', 'industry leaders'],
    ARRAY['NVIDIA', 'OpenAI', 'Google', 'Anthropic', 'Microsoft'],
    'positive',
    7,
    false
),
(
    'The Coder Village at the Heart of China''s A.I. Frenzy',
    'As China vies with Silicon Valley for primacy, Hangzhou, home to DeepSeek and Alibaba, is where its aspiring tech titans mingle and share ideas.',
    'The New York Times',
    'https://www.nytimes.com/2025/07/06/technology/china-artificial-intelligence-hangzhou.html',
    NOW() - INTERVAL '14 hours',
    'industry_news',
    ARRAY['ai development', 'china', 'deepseek'],
    ARRAY['DeepSeek', 'Alibaba'],
    'neutral',
    6,
    false
),
-- Use Cases and Applications
(
    'Amazing AI Breakthrough Allows Paralyzed Man to Speak and Sing',
    'A new AI brain-computer interface allows a paralyzed man to speak and sing, marking a significant medical breakthrough.',
    'Fox News',
    'https://www.foxnews.com/tech/fox-news-ai-newsletter-amazing-breakthrough-paralyzed-man-who-cant-speak',
    NOW() - INTERVAL '16 hours',
    'technical_breakthrough',
    ARRAY['brain-computer interface', 'medical ai', 'breakthrough'],
    ARRAY[],
    'positive',
    8,
    false
),
(
    'AI in Healthcare: Revolutionizing Cancer Care Through Enhanced Diagnosis',
    'As AI revolutionizes cancer care by enhancing diagnosis, treatment, and clinical trial matching, it may lead to improved patient outcomes.',
    'Cancer Network',
    'https://www.cancernetwork.com/view/current-use-and-future-directions-of-artificial-intelligence-in-hematology-oncology',
    NOW() - INTERVAL '18 hours',
    'use_case',
    ARRAY['medical ai', 'cancer detection', 'healthcare'],
    ARRAY[],
    'positive',
    7,
    false
),
-- Market Analysis
(
    'Better AI Stock: AMD vs. Micron Technology in 2025',
    'Shares of AMD and Micron Technology have soared impressively in the past three months. Analysis of which semiconductor stock is worth buying.',
    'Yahoo Finance',
    'https://finance.yahoo.com/news/better-artificial-intelligence-ai-stock-111500916.html',
    NOW() - INTERVAL '20 hours',
    'industry_news',
    ARRAY['ai chips', 'semiconductors', 'stock market'],
    ARRAY['AMD', 'Micron'],
    'neutral',
    5,
    false
),
-- Workplace and Society
(
    'AI in the Workplace: A Report for 2025',
    'Almost all companies invest in AI, but just 1% believe they are at maturity. McKinsey''s new report looks at how AI is being used in the workplace.',
    'McKinsey',
    'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/superagency-in-the-workplace-empowering-people-to-unlock-ais-full-potential-at-work',
    NOW() - INTERVAL '22 hours',
    'industry_news',
    ARRAY['workplace ai', 'enterprise ai', 'ai adoption'],
    ARRAY[],
    'neutral',
    6,
    false
),
(
    'Commentary: Whose Job is Safe from AI?',
    'Analysis of which professions and skills remain valuable in the age of artificial intelligence and automation.',
    'Channel News Asia',
    'https://www.channelnewsasia.com/commentary/ai-artificial-intelligence-jobs-skills-salary-expertise-5218286',
    NOW() - INTERVAL '23 hours',
    'ethics_policy',
    ARRAY['ai jobs', 'automation', 'workforce'],
    ARRAY[],
    'neutral',
    6,
    false
);