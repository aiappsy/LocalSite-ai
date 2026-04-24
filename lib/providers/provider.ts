import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createCerebras } from '@ai-sdk/cerebras';
import { ollama } from 'ai-sdk-ollama';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText, LanguageModel, wrapLanguageModel, extractReasoningMiddleware } from 'ai';
import { LLMProvider, getProviderApiKey, getProviderBaseUrl } from './config';

// Shared system prompt for all providers
export const SYSTEM_PROMPT = "You are an expert web developer AI. Your task is to generate a single, self-contained HTML file based on the user's prompt. This HTML file must include all necessary HTML structure, CSS styles within <style> tags in the <head>, and JavaScript code within <script> tags, preferably at the end of the <body>. IMPORTANT: Do NOT use markdown formatting. Do NOT wrap the code in ```html and ``` tags. Do NOT output any text or explanation before or after the HTML code. Only output the raw HTML code itself, starting with <!DOCTYPE html> and ending with </html>. Ensure the generated CSS and JavaScript are directly embedded in the HTML file.";

// Shared interface for model information
export interface ModelInfo {
  id: string;
  name: string;
  capabilities: {
    vision: boolean;
    search: boolean;
    reasoning: boolean;
  };
}

// Common interface for all providers
export interface LLMProviderClient {
  getModels: () => Promise<ModelInfo[]>;
  getModel: (modelId: string, options?: ModelOptions) => LanguageModel;
}

export interface ModelOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
}

// Helper function to wrap a model with reasoning middleware for <think> tag extraction
function wrapWithReasoningMiddleware(model: LanguageModel): LanguageModel {
  return wrapLanguageModel({
    model: model as Parameters<typeof wrapLanguageModel>[0]['model'],
    middleware: extractReasoningMiddleware({ tagName: 'think' }),
  }) as LanguageModel;
}

// Factory function to create a provider client
export function createProviderClient(provider: LLMProvider, customApiKey?: string | null, customBaseUrl?: string | null): LLMProviderClient {
  switch (provider) {
    case LLMProvider.DEEPSEEK:
      return new DeepSeekProviderClient(customApiKey, customBaseUrl);
    case LLMProvider.OPENROUTER:
      return new OpenRouterProviderClient(customApiKey, customBaseUrl);
    case LLMProvider.ANTHROPIC:
      return new AnthropicProviderClient(customApiKey, customBaseUrl);
    case LLMProvider.GOOGLE:
      return new GoogleProviderClient(customApiKey, customBaseUrl);
    case LLMProvider.MISTRAL:
      return new MistralProviderClient(customApiKey, customBaseUrl);
    case LLMProvider.CEREBRAS:
      return new CerebrasProviderClient(customApiKey, customBaseUrl);
    case LLMProvider.OPENAI_COMPATIBLE:
      return new OpenAICompatibleProviderClient(customApiKey, customBaseUrl);
    case LLMProvider.OLLAMA:
      return new OllamaProviderClient(customBaseUrl);
    case LLMProvider.LM_STUDIO:
      return new LMStudioProviderClient(customBaseUrl);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// DeepSeek Provider Client
class DeepSeekProviderClient implements LLMProviderClient {
  private provider;

  constructor(customApiKey?: string | null, customBaseUrl?: string | null) {
    this.provider = createDeepSeek({ 
      apiKey: getProviderApiKey(LLMProvider.DEEPSEEK, customApiKey) || '',
      baseURL: getProviderBaseUrl(LLMProvider.DEEPSEEK, customBaseUrl),
    });
  }

  async getModels(): Promise<ModelInfo[]> {
    return [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', capabilities: { vision: true, search: false, reasoning: false } },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', capabilities: { vision: false, search: false, reasoning: true } },
    ];
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = (this.provider as any)(modelId, options) as unknown as LanguageModel;
    return wrapWithReasoningMiddleware(baseModel);
  }
}

// OpenRouter Provider Client
class OpenRouterProviderClient implements LLMProviderClient {
  private customApiKey: string | null;
  private provider;

  constructor(customApiKey?: string | null, customBaseUrl?: string | null) {
    this.customApiKey = customApiKey || null;
    this.provider = createOpenRouter({ 
      apiKey: getProviderApiKey(LLMProvider.OPENROUTER, customApiKey) || '',
    });
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const apiKey = getProviderApiKey(LLMProvider.OPENROUTER, this.customApiKey);
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {},
      });

      if (!response.ok) throw new Error(`Error fetching OpenRouter models: ${response.statusText}`);

      const data = await response.json();
      return data.data ? data.data.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        capabilities: {
          vision: model.description?.toLowerCase().includes('vision') || model.id.includes('vision') || model.id.includes('claude-3') || model.id.includes('gpt-4o'),
          search: false,
          reasoning: model.id.includes('deepseek-r1') || model.id.includes('o1') || model.id.includes('reasoner')
        }
      })) : [];
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      return [];
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = (this.provider as any).chat(modelId, {
      ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
      ...(options?.topP !== undefined ? { topP: options.topP } : {}),
    } as any) as unknown as LanguageModel;
    return wrapWithReasoningMiddleware(baseModel);
  }
}

// Anthropic Provider Client
class AnthropicProviderClient implements LLMProviderClient {
  private customApiKey: string | null;
  private provider;

  constructor(customApiKey?: string | null, customBaseUrl?: string | null) {
    this.customApiKey = customApiKey || null;
    this.provider = createAnthropic({ 
      apiKey: getProviderApiKey(LLMProvider.ANTHROPIC, customApiKey) || '',
      baseURL: getProviderBaseUrl(LLMProvider.ANTHROPIC, customBaseUrl),
    });
  }

  async getModels(): Promise<ModelInfo[]> {
    const apiFallbackModels: ModelInfo[] = [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', capabilities: { vision: true, search: false, reasoning: false } },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', capabilities: { vision: true, search: false, reasoning: false } },
    ];

    try {
      const apiKey = getProviderApiKey(LLMProvider.ANTHROPIC, this.customApiKey);
      if (!apiKey) return apiFallbackModels;

      const response = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey || '',
          'anthropic-version': '2023-06-01',
        },
      });

      if (!response.ok) return apiFallbackModels;

      const data = await response.json();
      return data.data ? data.data.map((model: any) => ({
        id: model.id,
        name: model.display_name || model.id,
        capabilities: { vision: true, search: false, reasoning: false }
      })) : apiFallbackModels;
    } catch (error) {
      console.error('Error fetching Anthropic models, using fallbacks:', error);
      return apiFallbackModels;
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = (this.provider as any)(modelId, options) as unknown as LanguageModel;
    return wrapWithReasoningMiddleware(baseModel);
  }
}

// Google AI Provider Client
class GoogleProviderClient implements LLMProviderClient {
  private customApiKey: string | null;
  private provider;

  constructor(customApiKey?: string | null, customBaseUrl?: string | null) {
    this.customApiKey = customApiKey || null;
    this.provider = createGoogleGenerativeAI({ 
      apiKey: getProviderApiKey(LLMProvider.GOOGLE, customApiKey) || '',
      baseURL: getProviderBaseUrl(LLMProvider.GOOGLE, customBaseUrl),
    });
  }

  async getModels(): Promise<ModelInfo[]> {
    const apiFallbackModels: ModelInfo[] = [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', capabilities: { vision: true, search: true, reasoning: false } },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', capabilities: { vision: true, search: true, reasoning: false } },
    ];

    try {
      const apiKey = getProviderApiKey(LLMProvider.GOOGLE, this.customApiKey);
      if (!apiKey) return apiFallbackModels;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!response.ok) return apiFallbackModels;

      const data = await response.json();
      if (!data.models || data.models.length === 0) return apiFallbackModels;

      return data.models
        .filter((model: { name: string }) => model.name.includes('gemini'))
        .map((model: any) => ({
          id: model.name.replace('models/', ''),
          name: model.displayName || model.name.replace('models/', ''),
          capabilities: {
            vision: true,
            search: true,
            reasoning: model.name.includes('thinking') || false
          }
        }));
    } catch (error) {
      console.error('Error fetching Google AI models, using fallbacks:', error);
      return apiFallbackModels;
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = (this.provider as any)(modelId, options) as unknown as LanguageModel;
    return wrapWithReasoningMiddleware(baseModel);
  }
}

// Mistral Provider Client
class MistralProviderClient implements LLMProviderClient {
  private customApiKey: string | null;
  private provider;

  constructor(customApiKey?: string | null, customBaseUrl?: string | null) {
    this.customApiKey = customApiKey || null;
    this.provider = createMistral({ 
      apiKey: getProviderApiKey(LLMProvider.MISTRAL, customApiKey) || '',
      baseURL: getProviderBaseUrl(LLMProvider.MISTRAL, customBaseUrl),
    });
  }

  async getModels(): Promise<ModelInfo[]> {
    const apiFallbackModels: ModelInfo[] = [
      { id: 'mistral-large-latest', name: 'Mistral Large', capabilities: { vision: false, search: false, reasoning: false } },
      { id: 'pixtral-12b-2409', name: 'Pixtral 12B', capabilities: { vision: true, search: false, reasoning: false } },
    ];

    try {
      const apiKey = getProviderApiKey(LLMProvider.MISTRAL, this.customApiKey);
      if (!apiKey) return apiFallbackModels;

      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (!response.ok) return apiFallbackModels;

      const data = await response.json();
      return data.data ? data.data.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        capabilities: {
          vision: model.id.includes('pixtral') || model.id.includes('vision'),
          search: false,
          reasoning: false
        }
      })) : apiFallbackModels;
    } catch (error) {
      console.error('Error fetching Mistral models, using fallbacks:', error);
      return apiFallbackModels;
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = (this.provider as any)(modelId, options) as unknown as LanguageModel;
    return wrapWithReasoningMiddleware(baseModel);
  }
}

// Cerebras Provider Client
class CerebrasProviderClient implements LLMProviderClient {
  private customApiKey: string | null;
  private provider;

  constructor(customApiKey?: string | null, customBaseUrl?: string | null) {
    this.customApiKey = customApiKey || null;
    this.provider = createCerebras({ 
      apiKey: getProviderApiKey(LLMProvider.CEREBRAS, customApiKey) || '',
      baseURL: getProviderBaseUrl(LLMProvider.CEREBRAS, customBaseUrl),
    });
  }

  async getModels(): Promise<ModelInfo[]> {
    const apiFallbackModels: ModelInfo[] = [
      { id: 'llama3.1-70b', name: 'Llama 3.1 70B', capabilities: { vision: false, search: false, reasoning: false } },
    ];

    try {
      const apiKey = getProviderApiKey(LLMProvider.CEREBRAS, this.customApiKey);
      if (!apiKey) return apiFallbackModels;

      const response = await fetch('https://api.cerebras.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (!response.ok) return apiFallbackModels;

      const data = await response.json();
      return data.data ? data.data.map((model: any) => ({
        id: model.id,
        name: model.id,
        capabilities: { vision: false, search: false, reasoning: false }
      })) : apiFallbackModels;
    } catch (error) {
      console.error('Error fetching Cerebras models, using fallbacks:', error);
      return apiFallbackModels;
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = (this.provider as any)(modelId, options) as unknown as LanguageModel;
    return wrapWithReasoningMiddleware(baseModel);
  }
}

// Generic OpenAI-Compatible Provider Client
class OpenAICompatibleProviderClient implements LLMProviderClient {
  private customApiKey: string | null;
  private customBaseUrl: string | null;
  private provider;

  constructor(customApiKey?: string | null, customBaseUrl?: string | null) {
    this.customApiKey = customApiKey || null;
    this.customBaseUrl = customBaseUrl || null;
    this.provider = createOpenAICompatible({
      name: 'openai_compatible',
      baseURL: getProviderBaseUrl(LLMProvider.OPENAI_COMPATIBLE, customBaseUrl),
      apiKey: getProviderApiKey(LLMProvider.OPENAI_COMPATIBLE, customApiKey) || '',
    });
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const baseUrl = getProviderBaseUrl(LLMProvider.OPENAI_COMPATIBLE, this.customBaseUrl);
      const apiKey = getProviderApiKey(LLMProvider.OPENAI_COMPATIBLE, this.customApiKey);
      const response = await fetch(`${baseUrl}/models`, {
        headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {},
      });

      if (!response.ok) throw new Error(`Error fetching models: ${response.statusText}`);

      const data = await response.json();
      return data.data ? data.data.map((model: any) => ({
        id: model.id,
        name: model.id,
        capabilities: {
          vision: model.id.includes('vision') || model.id.includes('claude-3'),
          search: false,
          reasoning: model.id.includes('thinking') || model.id.includes('r1')
        }
      })) : [];
    } catch (error) {
      console.error('Error fetching OpenAI-compatible models:', error);
      return [];
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = (this.provider as any)(modelId, options) as unknown as LanguageModel;
    return wrapWithReasoningMiddleware(baseModel);
  }
}

// Ollama Provider Client
class OllamaProviderClient implements LLMProviderClient {
  private baseUrl: string;

  constructor(customBaseUrl?: string | null) {
    this.baseUrl = getProviderBaseUrl(LLMProvider.OLLAMA, customBaseUrl);
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) throw new Error(`Error fetching Ollama models: ${response.statusText}`);

      const data = await response.json();
      return data.models ? data.models.map((model: any) => ({
        id: model.name,
        name: model.name,
        capabilities: {
          vision: model.name.includes('vision') || model.name.includes('llava'),
          search: false,
          reasoning: model.name.includes('r1') || model.name.includes('thinking')
        }
      })) : [];
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      return [];
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = ollama(modelId, { 
      think: true, 
      ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
      ...(options?.topP !== undefined ? { topP: options.topP } : {}),
    });
    return wrapLanguageModel({
      model: baseModel as any,
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }) as LanguageModel;
  }
}

// LM Studio Provider Client
class LMStudioProviderClient implements LLMProviderClient {
  private baseUrl: string;
  private provider;

  constructor(customBaseUrl?: string | null) {
    this.baseUrl = getProviderBaseUrl(LLMProvider.LM_STUDIO, customBaseUrl);
    this.provider = createOpenAICompatible({
      name: 'lm_studio',
      baseURL: this.baseUrl,
      apiKey: 'lm-studio',
    });
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      if (!response.ok) throw new Error(`Error fetching LM Studio models: ${response.statusText}`);

      const data = await response.json();
      return data.data ? data.data.map((model: any) => ({
        id: model.id,
        name: model.id,
        capabilities: { 
          vision: model.id.includes('vision'), 
          search: false, 
          reasoning: model.id.includes('thinking')
        }
      })) : [];
    } catch (error) {
      console.error('Error fetching LM Studio models:', error);
      return [];
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = (this.provider as any)(modelId, options) as unknown as LanguageModel;
    return wrapWithReasoningMiddleware(baseModel);
  }
}

// Helper function to generate code using streamText with reasoning support
export async function generateCodeStream(
  provider: LLMProvider,
  modelId: string,
  prompt: string,
  systemPrompt?: string | null,
  options?: ModelOptions & { 
    maxTokens?: number; 
    apiKey?: string; 
    baseUrl?: string;
    isSearchEnabled?: boolean;
    attachedFiles?: { name: string, type: string, data: string }[];
    previousCode?: string;
  }
): Promise<ReturnType<typeof streamText>> {
  const client = createProviderClient(provider, options?.apiKey, options?.baseUrl);
  const model = client.getModel(modelId, {
    temperature: options?.temperature,
    topP: options?.topP,
    topK: options?.topK,
  });
  
  let messages: any[] = [];
  
  // Refine the prompt for iterative updates
  let currentPrompt = prompt;
  if (options?.previousCode) {
    currentPrompt = `
I have some existing code that I need you to update.

EXISTING CODE:
${options.previousCode}

USER REQUEST FOR UPDATES:
${prompt}

Please apply the requested changes to the existing code and output the COMPLETE upgraded HTML file.
IMPORTANT RULES:
1. Output ONLY the raw HTML code.
2. Start with <!DOCTYPE html> and end with </html>.
3. Incorporate all requested updates while preserving existing functionality unless asked to change it.
4. Do NOT include any markdown code blocks or explanations.
5. The output must be a complete, self-contained file including all CSS and JS.
`.trim();
  }

  messages = [{ role: 'user', content: currentPrompt }];

  if (options?.attachedFiles && options.attachedFiles.length > 0) {
    const parts: any[] = [{ type: 'text', text: currentPrompt }];
    options.attachedFiles.forEach(file => {
      try {
        const base64Content = file.data.split(',')[1];
        if (base64Content) {
          parts.push({
            type: 'image',
            image: Buffer.from(base64Content, 'base64'),
            mimeType: file.type
          });
        }
      } catch (e) {
        console.error('Error processing attachment:', file.name, e);
      }
    });
    messages[0].content = parts;
  }

  let tools: any = undefined;
  if (options?.isSearchEnabled && provider === LLMProvider.GOOGLE) {
    tools = {
      webSearch: {
        description: "Search the web for up-to-date information.",
        parameters: { type: 'object', properties: { query: { type: 'string' } } },
        execute: async ({ query }: { query: string }) => {
          console.log(`[Search Tool] Querying: ${query}`);
          return `Search results for: ${query}`;
        }
      }
    };
  }

  return streamText({
    model,
    system: systemPrompt || SYSTEM_PROMPT,
    messages,
    tools,
    ...(options?.maxTokens ? { maxTokens: options.maxTokens } : {}),
  });
}
