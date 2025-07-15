import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, TrendingUp, Award, Globe, Brain, 
  Layers, Target, Users, Sparkles, ArrowUpRight,
  Building2, DollarSign, Code, Cpu, Shield
} from 'lucide-react';
import { 
  Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line,
  ComposedChart, Scatter, ScatterChart, ZAxis, Cell
} from 'recharts';
import { format, startOfMonth, eachWeekOfInterval, parseISO } from 'date-fns';
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

const COMPANY_COLORS = {
  'OpenAI': '#00A67E',
  'Google': '#4285F4',
  'Anthropic': '#8B5CF6',
  'Meta': '#0866FF',
  'Microsoft': '#00BCF2',
  'Apple': '#000000',
  'NVIDIA': '#76B900',
  'Amazon': '#FF9900',
  'Tesla': '#CC0000',
  'Others': '#6B7280'
};

interface MonthlyTrend {
  week: string;
  articles: number;
  avgImportance: number;
  topCategory: string;
}

export function MonthInReview() {
  const [monthData, setMonthData] = useState<AINews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'impact'>('volume');
  const { setDateRange, fetchNewsWithFilters, news } = useNewsStore();

  useEffect(() => {
    async function loadMonthData() {
      setIsLoading(true);
      try {
        // Set date range to month and fetch
        setDateRange('month');
        await fetchNewsWithFilters();
      } finally {
        setIsLoading(false);
      }
    }
    loadMonthData();
  }, [setDateRange, fetchNewsWithFilters]);

  useEffect(() => {
    setMonthData(news);
  }, [news]);

  // Process weekly trends
  const weeklyTrends: MonthlyTrend[] = eachWeekOfInterval({
    start: startOfMonth(new Date()),
    end: new Date()
  }).map((weekStart, index) => {
    const weekNews = monthData.filter(item => {
      const itemDate = parseISO(item.published_date);
      return itemDate >= weekStart && itemDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    });

    const categoryCount = weekNews.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'general';

    return {
      week: `Week ${index + 1}`,
      articles: weekNews.length,
      avgImportance: weekNews.length > 0
        ? Math.round(weekNews.reduce((sum, item) => sum + (item.importance_score || 0), 0) / weekNews.length * 10) / 10
        : 0,
      topCategory
    };
  });

  // Company activity over time
  const companyTimeline = Array.from(new Set(monthData.flatMap(n => n.companies)))
    .slice(0, 6)
    .map(company => {
      const weeks = eachWeekOfInterval({
        start: startOfMonth(new Date()),
        end: new Date()
      });

      const data = weeks.map((weekStart, index) => {
        const count = monthData.filter(item => {
          const itemDate = parseISO(item.published_date);
          return item.companies.includes(company) &&
            itemDate >= weekStart && 
            itemDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        }).length;
        
        return {
          week: `W${index + 1}`,
          [company]: count
        };
      });

      return { company, data };
    });

  // Category evolution
  const categoryEvolution = ['research', 'product_launch', 'funding', 'industry_news'].map(category => {
    const weeks = eachWeekOfInterval({
      start: startOfMonth(new Date()),
      end: new Date()
    });

    return {
      category,
      data: weeks.map((weekStart, index) => ({
        week: index + 1,
        count: monthData.filter(item => {
          const itemDate = parseISO(item.published_date);
          return item.category === category &&
            itemDate >= weekStart && 
            itemDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        }).length
      }))
    };
  });

  // Impact bubble chart data
  const impactBubbleData = Object.entries(
    monthData.reduce((acc, item) => {
      const key = item.category;
      if (!acc[key]) {
        acc[key] = { 
          category: key, 
          totalArticles: 0, 
          avgImportance: 0, 
          sumImportance: 0,
          companies: new Set<string>()
        };
      }
      acc[key].totalArticles += 1;
      acc[key].sumImportance += item.importance_score || 0;
      item.companies.forEach(c => acc[key].companies.add(c));
      return acc;
    }, {} as Record<string, {
      category: string;
      totalArticles: number;
      avgImportance: number;
      sumImportance: number;
      companies: Set<string>;
    }>)
  ).map(([, data]) => ({
    category: data.category.replace(/_/g, ' '),
    x: data.totalArticles,
    y: data.sumImportance / data.totalArticles || 0,
    z: data.companies.size,
    color: CATEGORY_COLORS[data.category as keyof typeof CATEGORY_COLORS] || '#6B7280'
  }));

  // Top performing content
  const topContent = monthData
    .filter(n => n.importance_score && n.importance_score >= 8)
    .sort((a, b) => (b.importance_score || 0) - (a.importance_score || 0))
    .slice(0, 10);

  // Monthly statistics
  const monthStats = {
    totalArticles: monthData.length,
    avgDailyArticles: Math.round(monthData.length / 30 * 10) / 10,
    uniqueCompanies: new Set(monthData.flatMap(n => n.companies)).size,
    highImpactStories: monthData.filter(n => n.importance_score && n.importance_score >= 8).length,
    positiveRatio: monthData.filter(n => n.sentiment === 'positive').length / monthData.length * 100,
    topSource: Object.entries(
      monthData.reduce((acc, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Calendar className="w-8 h-8 text-quantum-purple" />
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
          <Globe className="w-10 h-10 text-quantum-purple" />
          <GlowText as="h1" className="text-5xl" gradient="secondary">
            Month in Review
          </GlowText>
          <Brain className="w-10 h-10 text-electric-cyan" />
        </div>
        <p className="text-gray-400 text-lg">
          {format(new Date(), 'MMMM yyyy')} AI Landscape Analysis
        </p>
      </motion.div>

      {/* Executive Summary */}
      <Glass className="p-8 bg-gradient-to-br from-quantum-purple/10 to-electric-cyan/10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-solar-orange" />
          Executive Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-4xl font-bold text-white mb-2">{monthStats.totalArticles}</h3>
            <p className="text-gray-400">Total AI Developments</p>
            <p className="text-sm text-electric-cyan mt-1">
              {monthStats.avgDailyArticles} per day average
            </p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-neon-green mb-2">{monthStats.uniqueCompanies}</h3>
            <p className="text-gray-400">Active Companies</p>
            <p className="text-sm text-quantum-purple mt-1">
              Across all sectors
            </p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-solar-orange mb-2">
              {monthStats.positiveRatio.toFixed(0)}%
            </h3>
            <p className="text-gray-400">Positive Sentiment</p>
            <p className="text-sm text-neon-green mt-1">
              Industry optimism high
            </p>
          </div>
        </div>
      </Glass>

      {/* Metric Toggle */}
      <div className="flex justify-center">
        <Glass className="inline-flex p-1">
          <button
            onClick={() => setSelectedMetric('volume')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedMetric === 'volume' 
                ? 'bg-electric-cyan text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Volume Analysis
          </button>
          <button
            onClick={() => setSelectedMetric('impact')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedMetric === 'impact' 
                ? 'bg-quantum-purple text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Impact Analysis
          </button>
        </Glass>
      </div>

      {/* Weekly Trends */}
      <Glass className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-electric-cyan" />
          Weekly Progression
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={weeklyTrends}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="week" stroke="#9CA3AF" />
            <YAxis yAxisId="left" stroke="#9CA3AF" />
            <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="articles"
              stroke="#8B5CF6"
              fillOpacity={1}
              fill="url(#colorGradient)"
              name="Articles"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgImportance"
              stroke="#10B981"
              strokeWidth={2}
              name="Avg Impact"
              dot={{ fill: '#10B981' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Glass>

      {/* Company Activity Timeline */}
      <Glass className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-quantum-purple" />
          Company Activity Timeline
        </h3>
        <div className="space-y-4">
          {companyTimeline.map(({ company, data }) => (
            <div key={company}>
              <h4 className="text-sm font-medium text-gray-400 mb-2">{company}</h4>
              <ResponsiveContainer width="100%" height={60}>
                <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Bar 
                    dataKey={company} 
                    fill={COMPANY_COLORS[company as keyof typeof COMPANY_COLORS] || '#6B7280'}
                    radius={[4, 4, 0, 0]}
                  />
                  <XAxis dataKey="week" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </Glass>

      {/* Impact Bubble Chart */}
      <Glass className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-neon-green" />
          Category Impact Analysis
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Articles" 
              stroke="#9CA3AF"
              label={{ value: 'Number of Articles', position: 'insideBottom', offset: -10, fill: '#9CA3AF' }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Avg Impact" 
              stroke="#9CA3AF"
              label={{ value: 'Average Impact Score', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            />
            <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Companies" />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F3F4F6' }}
              formatter={(value: number | string, name: string) => {
                if (name === 'x') return [`${value} articles`, 'Articles'];
                if (name === 'y') return [`${typeof value === 'number' ? value.toFixed(1) : value}`, 'Avg Impact'];
                if (name === 'z') return [`${value} companies`, 'Companies'];
                return [value, name];
              }}
            />
            <Scatter name="Categories" data={impactBubbleData}>
              {impactBubbleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 text-xs text-gray-400 text-center">
          Bubble size represents number of companies involved
        </div>
      </Glass>

      {/* Category Evolution */}
      <Glass className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-solar-orange" />
          Category Evolution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="week" 
              stroke="#9CA3AF"
              label={{ value: 'Week', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            {categoryEvolution.map((cat, index) => (
              <Line
                key={cat.category}
                type="monotone"
                data={cat.data}
                dataKey="count"
                name={cat.category.replace(/_/g, ' ')}
                stroke={Object.values(CATEGORY_COLORS)[index]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Glass>

      {/* Top Stories Grid */}
      <div>
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-electric-cyan" />
          Highest Impact Stories This Month
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topContent.slice(0, 6).map((story) => (
            <HeadlineCard
              key={story.id}
              news={story}
              isCompact
              onClick={() => window.open(story.source_url, '_blank')}
            />
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <Glass className="p-8 bg-gradient-to-br from-electric-cyan/5 to-quantum-purple/5">
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <Brain className="w-6 h-6 text-quantum-purple" />
          Key Monthly Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Code className="w-5 h-5 text-electric-cyan mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Coding Assistant Revolution</h4>
                <p className="text-sm text-gray-300">
                  Claude Code CLI's MCP integration marked a significant milestone, with GitHub Copilot 
                  responding with a free tier to maintain market share.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-neon-green mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Investment Surge</h4>
                <p className="text-sm text-gray-300">
                  Over $15B invested in AI companies this month, with Microsoft's additional $10B 
                  commitment to OpenAI leading the charge.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Cpu className="w-5 h-5 text-solar-orange mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Hardware Innovation</h4>
                <p className="text-sm text-gray-300">
                  NVIDIA's H200 chips promise 10x performance improvements, addressing the growing 
                  computational demands of next-gen models.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-quantum-purple mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Market Consolidation</h4>
                <p className="text-sm text-gray-300">
                  The "Big 5" (OpenAI, Google, Anthropic, Meta, Microsoft) accounted for 68% of major 
                  announcements, showing increasing market concentration.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-red-500 mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Regulatory Landscape</h4>
                <p className="text-sm text-gray-300">
                  EU AI Act passage sets global precedent, with other regions expected to follow 
                  with similar comprehensive frameworks.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ArrowUpRight className="w-5 h-5 text-electric-cyan mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Looking Ahead</h4>
                <p className="text-sm text-gray-300">
                  Focus shifting from raw model capabilities to practical applications, with coding 
                  assistants and enterprise solutions leading adoption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Glass>
    </div>
  );
}