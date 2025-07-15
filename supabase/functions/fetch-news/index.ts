import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import Parser from "npm:rss-parser";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const parser = new Parser();

const FEEDS = [
  "https://openai.com/blog/rss",
  "https://ai.googleblog.com/atom.xml",
  "https://news.mit.edu/topic/artificial-intelligence2/feed",
];

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  for (const url of FEEDS) {
    try {
      const feed = await parser.parseURL(url);

      for (const item of feed.items) {
        if (!item.link) continue;
        const published =
          item.isoDate ?? item.pubDate ?? new Date().toISOString();

        await supabase
          .from("ai_news")
          .upsert(
            {
              title: item.title ?? "Untitled",
              content: item.content ?? item.contentSnippet ?? null,
              source: feed.title ?? url,
              source_url: item.link,
              published_date: published,
              category: "industry_news",
            },
            { onConflict: "source_url" }
          );
      }
    } catch (err) {
      console.error(`Error processing ${url}`, err);
    }
  }

  return new Response(
    JSON.stringify({ status: "ok" }),
    { headers: { "Content-Type": "application/json" } }
  );
});
