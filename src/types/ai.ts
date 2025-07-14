export interface AIModel {
  id: number;
  model_name: string;
  company: string | null;
  category: string;
  update_type: string;
  description: string;
  impact_score: number | null;
  created_at: string;
  updated_at: string;
}

export type AICategory = 
  | 'language_model' 
  | 'image_generation' 
  | 'multimodal_model' 
  | 'reasoning_model'
  | 'video_generation'
  | 'conversational_ai'
  | 'search_ai'
  | 'ai_agent'
  | 'hardware'
  | 'general_ai';

export type UpdateType = 
  | 'release' 
  | 'update' 
  | 'feature' 
  | 'comparison' 
  | 'adoption'
  | 'announcement'
  | 'beta'
  | 'experimental'
  | 'model'
  | 'service'
  | 'platform'
  | 'use_case'
  | 'trend'
  | 'benchmark';

export interface AIConstellation {
  nodes: AINode[];
  connections: AIConnection[];
}

export interface AINode {
  id: string;
  model: AIModel;
  position: [number, number, number];
  size: number;
  color: string;
  intensity: number;
}

export interface AIConnection {
  source: string;
  target: string;
  strength: number;
  type: 'company' | 'category' | 'related';
}