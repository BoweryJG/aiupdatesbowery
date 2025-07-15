import { Layout } from './components/Layout';
import { NewsAggregator } from './components/news/NewsAggregator';
import { motion } from 'framer-motion';
import './styles/cartier-theme.css';

function App() {
  return (
    <Layout>
      <div className="luxury-container min-h-screen">
        {/* Luxury Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 px-4 border-b border-white/5"
        >
          <h1 className="luxury-heading text-4xl lg:text-5xl mb-2">
            Bowery Intelligence
          </h1>
          <p className="luxury-text text-sm tracking-wider uppercase">
            Global News • Real-time Updates • Curated Intelligence
          </p>
          <div className="luxury-divider mx-auto w-32 my-4" />
        </motion.div>

        {/* Main News Aggregator */}
        <NewsAggregator />
      </div>
    </Layout>
  );
}

export default App;