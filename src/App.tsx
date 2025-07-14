import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { GlowText } from './components/ui/GlowText';
import { FilterBar } from './components/ui/FilterBar';
import { ModelCard } from './components/ui/ModelCard';
import { Glass } from './components/ui/Glass';
import { useAIStore } from './store/aiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Globe } from 'lucide-react';

function App() {
  const { fetchModels, getFilteredModels, loading, error } = useAIStore();
  const filteredModels = getFilteredModels();

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-electric-cyan" />
            </motion.div>
            <GlowText as="h1" className="text-5xl lg:text-6xl">
              AI Intelligence Hub
            </GlowText>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Globe className="w-8 h-8 text-quantum-purple" />
            </motion.div>
          </div>
          <p className="text-gray-400 text-lg">
            Real-time intelligence aggregation for the AI industry
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Glass className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-electric-cyan mx-auto mb-2" />
            <h3 className="text-2xl font-bold font-mono text-white mb-1">
              {filteredModels.filter(m => m.impact_score && m.impact_score >= 9).length}
            </h3>
            <p className="text-sm text-gray-400">Critical Updates</p>
          </Glass>
          
          <Glass className="p-6 text-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-electric-cyan to-quantum-purple mx-auto mb-2" />
            <h3 className="text-2xl font-bold font-mono text-white mb-1">
              {new Set(filteredModels.map(m => m.company).filter(Boolean)).size}
            </h3>
            <p className="text-sm text-gray-400">Active Companies</p>
          </Glass>
          
          <Glass className="p-6 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-8 rounded-full ${
                    i < 4 ? 'bg-neon-green' : 'bg-gray-600'
                  }`}
                  style={{ height: `${(i + 1) * 6}px` }}
                />
              ))}
            </div>
            <h3 className="text-2xl font-bold font-mono text-white mb-1">
              {filteredModels.length}
            </h3>
            <p className="text-sm text-gray-400">Total Models</p>
          </Glass>
        </div>

        {/* Filter Bar */}
        <FilterBar />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-electric-cyan" />
            </motion.div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Glass className="p-8 text-center">
            <p className="text-red-400">Error loading AI models: {error}</p>
          </Glass>
        )}

        {/* Models Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredModels.map((model) => (
              <ModelCard
                key={`${model.id}-${model.model_name}`}
                model={model}
                onClick={() => {
                  // TODO: Open detailed view
                  console.log('Model clicked:', model);
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {!loading && !error && filteredModels.length === 0 && (
          <Glass className="p-12 text-center">
            <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No AI models found matching your criteria</p>
          </Glass>
        )}
      </div>
    </Layout>
  );
}

export default App;