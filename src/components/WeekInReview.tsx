import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Calendar, BarChart3, PieChart, Activity, 
  Zap 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer,
  Area, AreaChart, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { format, startOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { Glass } from './ui/Glass';
import { GlowText } from './ui/GlowText';
import { useNewsStore } from '../store/newsStore';
import { HeadlineCard } from './ui/HeadlineCard';
import type { AINews } from '../types/ai';

const CATEGORY_COLORS = {
  research: '#8B5CF6',
  product_launch: '#06B6D4',
  funding: '#10B981',
  partnership: '#F59E0B',
  acquisition: '#EF4444',
  ethics_policy: '#6366F1',
  technical_breakthrough: '#EC4899',
  industry_news: '#8B5CF6',
  use_case: '#14B8A6',
  open_source: '#84CC16',
  hardware: '#F97316',
  general: '#6B7280'
};


export function WeekInReview() {
  const [weekData, setWeekData] = useState<AINews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setDateRange, fetchNewsWithFilters, news } = useNewsStore();

  useEffect(() => {
    async function loadWeekData() {
      setIsLoading(true);
      try {
        // Set date range to week and fetch
        setDateRange('week');
        await fetchNewsWithFilters();
      } finally {
        setIsLoading(false);
      }
    }
    loadWeekData();
  }, [setDateRange, fetchNewsWithFilters]);

  useEffect(() => {
    setWeekData(news);
  }, [news]);

  // Process data for visualizations
  const categoryDistribution = Object.entries(
    weekData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
    color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || '#6B7280'
  }));

  const dailyActivity = eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: new Date()
  }).map(date => {
    const dayNews = weekData.filter(item => 
      format(parseISO(item.published_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    return {
      day: format(date, 'EEE'),
      articles: dayNews.length,
      avgImportance: dayNews.length > 0 
        ? Math.round(dayNews.reduce((sum, item) => sum + (item.importance_score || 0), 0) / dayNews.length)
        : 0
    };
  });

  const topCompanies = Object.entries(
    weekData.flatMap(item => item.companies)
      .reduce((acc, company) => {
        acc[company] = (acc[company] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([company, count]) => ({ company, count }));

  const sentimentData = [
    { sentiment: 'Positive', count: weekData.filter(n => n.sentiment === 'positive').length },
    { sentiment: 'Neutral', count: weekData.filter(n => n.sentiment === 'neutral').length },
    { sentiment: 'Negative', count: weekData.filter(n => n.sentiment === 'negative').length }
  ];

  const importanceDistribution = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: weekData.filter(n => n.importance_score === i + 1).length
  }));

  const topStories = weekData
    .filter(n => n.importance_score && n.importance_score >= 8)
    .sort((a, b) => (b.importance_score || 0) - (a.importance_score || 0))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <BarChart3 className="w-8 h-8 text-electric-cyan" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Calendar className="w-8 h-8 text-electric-cyan" />
          <GlowText as="h1" className="text-4xl">
            Week in Review
          </GlowText>
        </div>
        <p className="text-gray-400">
          {format(startOfWeek(new Date()), 'MMM d')} - {format(new Date(), 'MMM d, yyyy')}
        </p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Glass className="p-6 text-center">
          <h3 className="text-3xl font-bold text-white mb-2">{weekData.length}</h3>
          <p className="text-sm text-gray-400">Total Articles</p>
        </Glass>
        <Glass className="p-6 text-center">
          <h3 className="text-3xl font-bold text-electric-cyan mb-2">
            {topCompanies.length > 0 ? topCompanies[0].company : 'N/A'}
          </h3>
          <p className="text-sm text-gray-400">Most Active Company</p>
        </Glass>
        <Glass className="p-6 text-center">
          <h3 className="text-3xl font-bold text-neon-green mb-2">
            {weekData.filter(n => n.sentiment === 'positive').length}
          </h3>
          <p className="text-sm text-gray-400">Positive News</p>
        </Glass>
        <Glass className="p-6 text-center">
          <h3 className="text-3xl font-bold text-quantum-purple mb-2">
            {weekData.filter(n => n.importance_score && n.importance_score >= 8).length}
          </h3>
          <p className="text-sm text-gray-400">High Impact Stories</p>
        </Glass>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <Glass className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-electric-cyan" />
            Daily Activity
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyActivity}>
              <defs>
                <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Area
                type="monotone"
                dataKey="articles"
                stroke="#06B6D4"
                fillOpacity={1}
                fill="url(#colorArticles)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Glass>

        {/* Category Distribution */}
        <Glass className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-quantum-purple" />
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </Glass>

        {/* Top Companies */}
        <Glass className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neon-green" />
            Most Mentioned Companies
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topCompanies} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis dataKey="company" type="category" stroke="#9CA3AF" width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </Glass>

        {/* Sentiment Analysis */}
        <Glass className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-solar-orange" />
            Sentiment Analysis
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={sentimentData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="sentiment" stroke="#9CA3AF" />
              <PolarRadiusAxis stroke="#9CA3AF" />
              <Radar
                name="Articles"
                dataKey="count"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Glass>
      </div>

      {/* Importance Score Distribution */}
      <Glass className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-electric-cyan" />
          Impact Score Distribution
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={importanceDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="score" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Bar dataKey="count" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </Glass>

      {/* Top Stories of the Week */}
      <div>
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-neon-green" />
          Top Stories of the Week
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topStories.map((story) => (
            <HeadlineCard
              key={story.id}
              news={story}
              onClick={() => window.open(story.source_url, '_blank')}
            />
          ))}
        </div>
      </div>

      {/* Summary Insights */}
      <Glass className="p-8">
        <h3 className="text-xl font-semibold text-white mb-4">Weekly Insights</h3>
        <div className="space-y-3 text-gray-300">
          <p>
            <span className="text-electric-cyan font-semibold">Most Active Day:</span>{' '}
            {dailyActivity.reduce((max, day) => day.articles > max.articles ? day : max).day} with{' '}
            {Math.max(...dailyActivity.map(d => d.articles))} articles
          </p>
          <p>
            <span className="text-quantum-purple font-semibold">Dominant Category:</span>{' '}
            {categoryDistribution[0]?.name || 'N/A'} ({categoryDistribution[0]?.value || 0} articles)
          </p>
          <p>
            <span className="text-neon-green font-semibold">Average Impact Score:</span>{' '}
            {weekData.length > 0 
              ? (weekData.reduce((sum, n) => sum + (n.importance_score || 0), 0) / weekData.length).toFixed(1)
              : 'N/A'}
          </p>
          <p>
            <span className="text-solar-orange font-semibold">Sentiment Trend:</span>{' '}
            {sentimentData[0].count > sentimentData[2].count ? 'Predominantly Positive' : 'Mixed'}
          </p>
        </div>
      </Glass>
    </div>
  );
}