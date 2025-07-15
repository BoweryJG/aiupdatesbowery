import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, AlertCircle } from 'lucide-react';
import { useNewsStore } from '../store/newsStore';
import { HeadlineCard } from './ui/HeadlineCard';
import { Glass } from './ui/Glass';
import { GlowText } from './ui/GlowText';

export function TodaysHeadlines() {
  const {
    todaysHeadlines,
    loading,
    error,
    fetchTodaysHeadlines,
    subscribeToNews,
    unsubscribeFromNews
  } = useNewsStore();

  useEffect(() => {
    fetchTodaysHeadlines();
    subscribeToNews();
    return () => unsubscribeFromNews();
  }, [fetchTodaysHeadlines, subscribeToNews, unsubscribeFromNews]);

  const criticalNews = todaysHeadlines.filter(news => news.importance_score && news.importance_score >= 8);
  const importantNews = todaysHeadlines.filter(news => news.importance_score && news.importance_score >= 6 && news.importance_score < 8);
  const otherNews = todaysHeadlines.filter(news => !news.importance_score || news.importance_score < 6);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Newspaper className="w-8 h-8 text-electric-cyan" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <Glass className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400">Error loading headlines: {error}</p>
      </Glass>
    );
  }

  if (todaysHeadlines.length === 0) {
    return (
      <Glass className="p-12 text-center">
        <Newspaper className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No headlines available for today yet</p>
      </Glass>
    );
  }

  return (
    <div className="space-y-8">
      {/* Critical Updates */}
      {criticalNews.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-neon-red animate-pulse" />
            <GlowText as="h2" className="text-2xl">
              Breaking News
            </GlowText>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {criticalNews.map((news) => (
              <HeadlineCard
                key={news.id}
                news={news}
                onClick={() => window.open(news.source_url, '_blank')}
              />
            ))}
          </div>
        </section>
      )}

      {/* Important Updates */}
      {importantNews.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-electric-cyan" />
            <h2 className="text-xl font-semibold text-white">Important Updates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {importantNews.map((news) => (
              <HeadlineCard
                key={news.id}
                news={news}
                isCompact
                onClick={() => window.open(news.source_url, '_blank')}
              />
            ))}
          </div>
        </section>
      )}

      {/* Other News */}
      {otherNews.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">More Headlines</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherNews.map((news) => (
              <HeadlineCard
                key={news.id}
                news={news}
                isCompact
                onClick={() => window.open(news.source_url, '_blank')}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}