import { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { Zap, TrendingUp, Brain, MessageSquare } from 'lucide-react';

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateInsight = async (type) => {
    setLoading(true);
    try {
      const response = await api.post(`/ai/${type}`);
      setInsights([response.data, ...insights]);
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const aiFeatures = [
    {
      icon: TrendingUp,
      title: 'Analyze Trends',
      description: 'Get insights on market trends',
      action: () => generateInsight('analyze-trends'),
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: Zap,
      title: 'Inventory Optimization',
      description: 'Smart inventory recommendations',
      action: () => generateInsight('inventory-optimization'),
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: Brain,
      title: 'Smart Pricing',
      description: 'AI-powered pricing suggestions',
      action: () => generateInsight('generate-content'),
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: MessageSquare,
      title: 'AI Chatbot',
      description: 'Chat with AI assistant',
      action: () => generateInsight('chat'),
      color: 'from-yellow-600 to-orange-600'
    },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-white mb-8">AI Insights & Features</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {aiFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.title}
              onClick={feature.action}
              disabled={loading}
              className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6 hover:border-white/30 transition-all text-left group`}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </button>
          );
        })}
      </div>

      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Insights</h2>
        {insights.length === 0 ? (
          <p className="text-gray-400">Click on a feature above to generate insights</p>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded p-4">
                <h4 className="text-white font-semibold">{insight.title}</h4>
                <p className="text-gray-300 mt-2">{insight.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIInsights;
