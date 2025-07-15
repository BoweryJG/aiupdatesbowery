import { Layout } from './components/Layout';
import { NewsAggregator } from './components/news/NewsAggregator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NetworkStatus } from './components/NetworkStatus';
import './styles/cartier-theme.css';

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <div className="luxury-container min-h-screen">
          {/* Main News Aggregator */}
          <NewsAggregator />
          
          {/* Network status indicator */}
          <NetworkStatus />
        </div>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;