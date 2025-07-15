import React from 'react';
import { X } from 'lucide-react';
import { Glass } from './Glass';
import type { AIModel } from '../../types/ai';

interface ModelDetailsModalProps {
  model: AIModel;
  onClose: () => void;
}

export const ModelDetailsModal: React.FC<ModelDetailsModalProps> = ({ model, onClose }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Glass className="relative max-w-2xl w-full p-6 overflow-y-auto max-h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-semibold text-white mb-1">{model.model_name}</h2>
        {model.company && <p className="text-gray-400 mb-4">{model.company}</p>}
        <p className="text-gray-300 mb-4 whitespace-pre-line">{model.description}</p>
        <div className="flex gap-2 mb-4">
          <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-gray-400 font-mono">
            {model.update_type}
          </span>
          <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-gray-400 font-mono">
            {model.category.replace('_', ' ')}
          </span>
        </div>
        {model.impact_score !== null && (
          <p className="text-sm text-gray-300 mb-4">Impact score: {model.impact_score}/10</p>
        )}
        {model.impact_history && model.impact_history.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-white mb-2">Impact History</h3>
            <ul className="space-y-1 text-gray-300 text-sm">
              {model.impact_history.map((entry, idx) => (
                <li key={idx}>
                  {entry.date}: {entry.impact}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Glass>
    </div>
  );
};
