import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Glass } from './Glass';
import { GlowText } from './GlowText';
import { cn } from '../../lib/utils';
import type { AIModel } from '../../types/ai';
import { Sparkles, Zap, Brain, Cpu, Image, MessageSquare, Search, Bot } from 'lucide-react';

interface ModelCardProps {
  model: AIModel;
  onClick?: () => void;
}

const categoryIcons = {
  language_model: Brain,
  image_generation: Image,
  multimodal_model: Sparkles,
  reasoning_model: Cpu,
  video_generation: Zap,
  conversational_ai: MessageSquare,
  search_ai: Search,
  ai_agent: Bot,
  hardware: Cpu,
  general_ai: Sparkles,
};

const categoryColors = {
  language_model: 'from-electric-cyan to-blue-500',
  image_generation: 'from-quantum-purple to-pink-500',
  multimodal_model: 'from-electric-cyan to-quantum-purple',
  reasoning_model: 'from-neon-green to-emerald-500',
  video_generation: 'from-solar-orange to-red-500',
  conversational_ai: 'from-blue-500 to-electric-cyan',
  search_ai: 'from-purple-500 to-quantum-purple',
  ai_agent: 'from-emerald-500 to-neon-green',
  hardware: 'from-gray-500 to-gray-400',
  general_ai: 'from-electric-cyan to-quantum-purple',
};

export const ModelCard: React.FC<ModelCardProps> = ({ model, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = categoryIcons[model.category as keyof typeof categoryIcons] || Sparkles;
  const gradientColor = categoryColors[model.category as keyof typeof categoryColors] || 'from-electric-cyan to-quantum-purple';

  const impactLevel = model.impact_score 
    ? model.impact_score >= 9 ? 'Critical' 
    : model.impact_score >= 7 ? 'High'
    : model.impact_score >= 5 ? 'Medium'
    : 'Low'
    : 'Unknown';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="cursor-pointer perspective-1000"
    >
      <Glass
        variant="hover"
        glow={isHovered}
        className="p-6 h-full transform-style-3d relative overflow-hidden group"
      >
        {/* Background gradient effect */}
        <div className={cn(
          "absolute inset-0 opacity-10 blur-2xl transition-opacity duration-500",
          isHovered && "opacity-20"
        )}>
          <div className={cn("w-full h-full bg-gradient-to-br", gradientColor)} />
        </div>

        {/* Floating particles */}
        <AnimatePresence>
          {isHovered && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-electric-cyan rounded-full"
                  initial={{ 
                    x: Math.random() * 100, 
                    y: 100,
                    opacity: 0 
                  }}
                  animate={{ 
                    y: -20,
                    opacity: [0, 1, 0],
                    x: Math.random() * 200 - 50
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className={cn("p-2 rounded-lg bg-gradient-to-br", gradientColor)}
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Icon className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h3 className="font-space font-semibold text-lg text-white">
                  {model.model_name}
                </h3>
                {model.company && (
                  <p className="text-sm text-gray-400">{model.company}</p>
                )}
              </div>
            </div>
            
            {model.impact_score && (
              <motion.div
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-mono font-medium",
                  "bg-gradient-to-r backdrop-blur-sm",
                  model.impact_score >= 9 && "from-red-500/20 to-solar-orange/20 text-solar-orange border border-solar-orange/30",
                  model.impact_score >= 7 && model.impact_score < 9 && "from-electric-cyan/20 to-blue-500/20 text-electric-cyan border border-electric-cyan/30",
                  model.impact_score >= 5 && model.impact_score < 7 && "from-quantum-purple/20 to-purple-500/20 text-quantum-purple border border-quantum-purple/30",
                  model.impact_score < 5 && "from-gray-500/20 to-gray-600/20 text-gray-400 border border-gray-500/30"
                )}
                animate={{ scale: isHovered ? 1.1 : 1 }}
              >
                {model.impact_score}/10 • {impactLevel}
              </motion.div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {model.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-gray-400 font-mono">
                {model.update_type}
              </span>
              <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-gray-400 font-mono">
                {model.category.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Hover effect line */}
          <motion.div
            className={cn("absolute bottom-0 left-0 h-0.5 bg-gradient-to-r", gradientColor)}
            initial={{ width: 0 }}
            animate={{ width: isHovered ? '100%' : 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Glass>
    </motion.div>
  );
};