import { LLMProvider } from './config';

export interface ModelCapability {
  vision: boolean;
  search: boolean;
  tools: boolean;
  reasoning: boolean;
  maxTokens?: number;
}

/**
 * Metadata for model capabilities to drive the "Model Advisory" system.
 * This helps the app suggest the right model for vision, search, or reasoning tasks.
 */
export const MODEL_CAPABILITIES: Record<string, ModelCapability> = {
  // Google Gemini Models (Full featured)
  'gemini-2.0-flash': { vision: true, search: true, tools: true, reasoning: false, maxTokens: 8192 },
  'gemini-1.5-pro': { vision: true, search: true, tools: true, reasoning: false, maxTokens: 8192 },
  'gemini-1.5-flash': { vision: true, search: true, tools: true, reasoning: false, maxTokens: 8192 },
  'gemini-1.0-pro': { vision: false, search: true, tools: true, reasoning: false, maxTokens: 2048 },

  // Anthropic Claude Models
  'claude-3-5-sonnet-20241022': { vision: true, search: false, tools: true, reasoning: false, maxTokens: 8192 },
  'claude-3-5-haiku-20241022': { vision: true, search: false, tools: true, reasoning: false, maxTokens: 4096 },
  'claude-3-opus-20240229': { vision: true, search: false, tools: true, reasoning: false, maxTokens: 4096 },

  // DeepSeek Models
  'deepseek-chat': { vision: false, search: false, tools: true, reasoning: false, maxTokens: 4096 },
  'deepseek-reasoner': { vision: false, search: false, tools: false, reasoning: true, maxTokens: 4096 },

  // Mistral Models
  'mistral-large-latest': { vision: false, search: false, tools: true, reasoning: false, maxTokens: 4096 },
  'pixtral-12b-2409': { vision: true, search: false, tools: true, reasoning: false, maxTokens: 4096 },
  
  // Cerebras (Fast but limited)
  'llama3.1-70b': { vision: false, search: false, tools: false, reasoning: false, maxTokens: 4096 },
  'llama3.1-8b': { vision: false, search: false, tools: false, reasoning: false, maxTokens: 4096 },
};

/**
 * Gets capabilities for a specific model ID. 
 * Falls back to basic defaults if model ID is unknown.
 */
export function getModelCapabilities(modelId: string): ModelCapability {
  // Dynamic check for some common patterns if ID is not exact match (OpenRouter IDs often vary)
  if (MODEL_CAPABILITIES[modelId]) {
    return MODEL_CAPABILITIES[modelId];
  }

  // Fallback heuristics
  const lowerId = modelId.toLowerCase();
  
  // Vision heuristics
  if (lowerId.includes('vision') || lowerId.includes('pixtral') || lowerId.includes('gemini-1.5') || lowerId.includes('gemini-2.0') || lowerId.includes('gpt-4o') || lowerId.includes('claude-3-5')) {
    return { vision: true, search: false, tools: true, reasoning: false };
  }

  // Reasoning heuristics
  if (lowerId.includes('reasoner') || lowerId.includes('r1') || lowerId.includes('o1')) {
    return { vision: false, search: false, tools: false, reasoning: true };
  }

  // Default: basic chat
  return { vision: false, search: false, tools: true, reasoning: false };
}

/**
 * Returns a list of model IDs that support a specific capability.
 */
export function getModelsByCapability(capability: keyof ModelCapability): string[] {
  return Object.entries(MODEL_CAPABILITIES)
    .filter(([_, caps]) => !!caps[capability])
    .map(([id]) => id);
}
