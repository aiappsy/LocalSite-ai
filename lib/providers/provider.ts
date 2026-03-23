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

// Common interface for all providers
export interface LLMProviderClient {
  getModels: () => Promise<{ id: string; name: string }[]>;
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

// Provider factory functions
function getDeepSeekProvider() {
  return createDeepSeek({ apiKey: getProviderApiKey(LLMProvider.DEEPSEEK) || '' });
}

function getOpenRouterProvider() {
  return createOpenRouter({ apiKey: getProviderApiKey(LLMProvider.OPENROUTER) || '' });
}

function getAnthropicProvider() {
  return createAnthropic({ apiKey: getProviderApiKey(LLMProvider.ANTHROPIC) || '' });
}

function getGoogleProvider() {
  return createGoogleGenerativeAI({ apiKey: getProviderApiKey(LLMProvider.GOOGLE) || '' });
}

function getMistralProvider() {
  return createMistral({ apiKey: getProviderApiKey(LLMProvider.MISTRAL) || '' });
}

function getCerebrasProvider() {
  return createCerebras({ apiKey: getProviderApiKey(LLMProvider.CEREBRAS) || '' });
}

function getOpenAICompatibleProvider() {
  return createOpenAICompatible({
    name: 'openai_compatible',
    baseURL: getProviderBaseUrl(LLMProvider.OPENAI_COMPATIBLE),
    apiKey: getProviderApiKey(LLMProvider.OPENAI_COMPATIBLE) || '',
  });
}

function getLMStudioProvider() {
  return createOpenAICompatible({
    name: 'lm_studio',
    baseURL: getProviderBaseUrl(LLMProvider.LM_STUDIO),
    apiKey: 'lm-studio',
  });
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

  async getModels() {
    // DeepSeek has fixed models (no public API for listing)
    return [
      { id: 'deepseek-chat', name: 'DeepSeek Chat' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner' },
    ];
  }

  getModel(modelId: string): LanguageModel {
    const baseModel = this.provider(modelId) as unknown as LanguageModel;
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

  async getModels() {
    try {
      const apiKey = getProviderApiKey(LLMProvider.OPENROUTER, this.customApiKey);
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Error fetching OpenRouter models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data ? data.data.map((model: { id: string; name?: string }) => ({
        id: model.id,
        name: model.name || model.id,
      })) : [];
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      throw new Error('Cannot fetch OpenRouter models. Check your API key.');
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = this.provider.chat(modelId, options) as unknown as LanguageModel;
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

  async getModels() {
    try {
      const apiKey = getProviderApiKey(LLMProvider.ANTHROPIC, this.customApiKey);
      const response = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey || '',
          'anthropic-version': '2023-06-01',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching Anthropic models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data ? data.data.map((model: { id: string; display_name?: string }) => ({
        id: model.id,
        name: model.display_name || model.id,
      })) : [];
    } catch (error) {
      console.error('Error fetching Anthropic models:', error);
      throw new Error('Cannot fetch Anthropic models. Check your API key.');
    }
  }

  getModel(modelId: string): LanguageModel {
    const baseModel = this.provider(modelId) as unknown as LanguageModel;
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

  async getModels() {
    try {
      const apiKey = getProviderApiKey(LLMProvider.GOOGLE, this.customApiKey);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

      if (!response.ok) {
        throw new Error(`Error fetching Google AI models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.models ? data.models
        .filter((model: { name: string }) => model.name.includes('gemini'))
        .map((model: { name: string; displayName?: string }) => ({
          id: model.name.replace('models/', ''),
          name: model.displayName || model.name.replace('models/', ''),
        })) : [];
    } catch (error) {
      console.error('Error fetching Google AI models:', error);
      throw new Error('Cannot fetch Google AI models. Check your API key.');
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = this.provider(modelId, options) as unknown as LanguageModel;
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

  async getModels() {
    try {
      const apiKey = getProviderApiKey(LLMProvider.MISTRAL, this.customApiKey);
      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (!response.ok) {
        throw new Error(`Error fetching Mistral models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data ? data.data.map((model: { id: string; name?: string }) => ({
        id: model.id,
        name: model.name || model.id,
      })) : [];
    } catch (error) {
      console.error('Error fetching Mistral models:', error);
      throw new Error('Cannot fetch Mistral models. Check your API key.');
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = this.provider(modelId, options) as unknown as LanguageModel;
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

  async getModels() {
    try {
      const apiKey = getProviderApiKey(LLMProvider.CEREBRAS, this.customApiKey);
      const response = await fetch('https://api.cerebras.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });

      if (!response.ok) {
        throw new Error(`Error fetching Cerebras models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data ? data.data.map((model: { id: string }) => ({
        id: model.id,
        name: model.id,
      })) : [];
    } catch (error) {
      console.error('Error fetching Cerebras models:', error);
      throw new Error('Cannot fetch Cerebras models. Check your API key.');
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = this.provider(modelId, options) as unknown as LanguageModel;
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

  async getModels() {
    const envModel = process.env.OPENAI_COMPATIBLE_MODEL;
    if (envModel && !this.customBaseUrl) {
      return [{ id: envModel, name: envModel }];
    }

    try {
      const baseUrl = getProviderBaseUrl(LLMProvider.OPENAI_COMPATIBLE, this.customBaseUrl);
      const apiKey = getProviderApiKey(LLMProvider.OPENAI_COMPATIBLE, this.customApiKey);
      const response = await fetch(`${baseUrl}/models`, {
        headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Error fetching models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data ? data.data.map((model: { id: string }) => ({
        id: model.id,
        name: model.id,
      })) : [];
    } catch (error) {
      console.error('Error fetching OpenAI-compatible models:', error);
      throw new Error('Cannot fetch models. Check your API configuration.');
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = this.provider(modelId, options) as unknown as LanguageModel;
    return wrapWithReasoningMiddleware(baseModel);
  }
}

// Ollama Provider Client
class OllamaProviderClient implements LLMProviderClient {
  private baseUrl: string;

  constructor(customBaseUrl?: string | null) {
    this.baseUrl = getProviderBaseUrl(LLMProvider.OLLAMA, customBaseUrl);
  }

  async getModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Error fetching Ollama models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.models ? data.models.map((model: { name: string }) => ({
        id: model.name,
        name: model.name,
      })) : [];
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      throw new Error('Cannot connect to Ollama. Is the server running?');
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    // Enable Ollama's native thinking support for reasoning models (deepseek-r1, qwen3)
    const baseModel = ollama(modelId, { think: true, ...options });
    // Wrap with extractReasoningMiddleware to handle <think> tags if present
    return wrapLanguageModel({
      model: baseModel as Parameters<typeof wrapLanguageModel>[0]['model'],
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

  async getModels() {
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      if (!response.ok) {
        throw new Error(`Error fetching LM Studio models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data ? data.data.map((model: { id: string }) => ({
        id: model.id,
        name: model.id,
      })) : [];
    } catch (error) {
      console.error('Error fetching LM Studio models:', error);
      throw new Error('Cannot connect to LM Studio. Is the server running?');
    }
  }

  getModel(modelId: string, options?: ModelOptions): LanguageModel {
    const baseModel = this.provider(modelId, options) as unknown as LanguageModel;
    return wrapWithReasoningMiddleware(baseModel);
  }
}

// Helper function to generate code using streamText with reasoning support
export async function generateCodeStream(
  provider: LLMProvider,
  modelId: string,
  prompt: string,
  systemPrompt?: string | null,
  options?: ModelOptions & { maxTokens?: number }
): Promise<ReturnType<typeof streamText>> {
  const client = createProviderClient(provider);
  const model = client.getModel(modelId, {
    temperature: options?.temperature,
    topP: options?.topP,
    topK: options?.topK,
  });

  const result = streamText({
    model,
    system: systemPrompt || SYSTEM_PROMPT,
    prompt,
    ...(options?.maxTokens ? { maxTokens: options.maxTokens } : {}),
  });

  return result;
}
