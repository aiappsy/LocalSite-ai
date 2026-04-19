import { NextRequest } from 'next/server';
import { LLMProvider } from '@/lib/providers/config';
import { generateCodeStream } from '@/lib/providers/provider';
import { DEFAULT_SYSTEM_PROMPT, THINKING_SYSTEM_PROMPT, COPYWRITING_SYSTEM_PROMPT } from '@/lib/providers/prompts';

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body
    const { 
      prompt, 
      model, 
      provider: providerParam, 
      customSystemPrompt, 
      maxTokens, 
      systemPromptType,
      temperature,
      topP,
      topK,
      customCredentials,
      isSearchEnabled,
      attachedFiles
    } = await request.json();

    // Check if prompt and model are provided
    if (!prompt || !model) {
      return new Response(
        JSON.stringify({ error: 'Prompt and model are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse numeric parameters
    const parsedMaxTokens = maxTokens ? parseInt(maxTokens.toString(), 10) : undefined;
    const parsedTemperature = temperature !== undefined ? parseFloat(temperature.toString()) : undefined;
    const parsedTopP = topP !== undefined ? parseFloat(topP.toString()) : undefined;
    const parsedTopK = topK !== undefined ? parseInt(topK.toString(), 10) : undefined;

    // Determine the provider to use
    let provider: LLMProvider;

    if (providerParam && Object.values(LLMProvider).includes(providerParam as LLMProvider)) {
      provider = providerParam as LLMProvider;
    } else {
      // Use the default provider from environment variables or DeepSeek as fallback
      provider = (process.env.DEFAULT_PROVIDER as LLMProvider) || LLMProvider.DEEPSEEK;
    }

    // --- PRE-VALIDATION ---
    // Check if the provider is configured (API key exists)
    const customKey = customCredentials?.[provider]?.apiKey;
    const customUrl = customCredentials?.[provider]?.baseUrl;
    
    // We import this from config to be consistent
    const { isProviderConfigured } = await import('@/lib/providers/config');
    
    if (!isProviderConfigured(provider, customKey, customUrl)) {
      return new Response(
        JSON.stringify({ 
          error: `Provider ${provider} is not configured. Please add your API key in the Key Manager (Engine Control) or server environment.` 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Determine the final system prompt based on type or custom input
    let finalSystemPrompt = customSystemPrompt;

    if (!finalSystemPrompt) {
      if (systemPromptType === 'thinking') {
        finalSystemPrompt = THINKING_SYSTEM_PROMPT;
      } else if (systemPromptType === 'copywriting') {
        finalSystemPrompt = COPYWRITING_SYSTEM_PROMPT;
      } else {
        // Fallback to default
        finalSystemPrompt = DEFAULT_SYSTEM_PROMPT;
      }
    }

    // Generate code using Vercel AI SDK streamText
    const result = await generateCodeStream(
      provider,
      model,
      prompt,
      finalSystemPrompt,
      {
        maxTokens: parsedMaxTokens,
        temperature: parsedTemperature,
        topP: parsedTopP,
        topK: parsedTopK,
        isSearchEnabled,
        attachedFiles,
        // We'll pass custom credentials if they exist for this provider
        ...(customCredentials?.[provider] || {})
      }
    );

    // Create a custom stream that sends text and reasoning as separate JSON lines
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of result.fullStream) {
            // Log part type for debugging in dev mode
            if (process.env.NODE_ENV === 'development') {
              console.log(`Stream part: ${part.type}`);
            }

            if (part.type === 'text-delta') {
              // Get content from various possible AI SDK version properties
              const content = (part as any).text || (part as any).delta || (part as any).textDelta;
              if (content) {
                controller.enqueue(
                  encoder.encode(JSON.stringify({ type: 'text', content }) + '\n')
                );
              }
            } else if (part.type === 'reasoning-delta') {
              // Get reasoning from various possible AI SDK version properties
              const content = (part as any).text || (part as any).delta || (part as any).reasoning || (part as any).reasoningDelta;
              if (content) {
                controller.enqueue(
                  encoder.encode(JSON.stringify({ type: 'reasoning', content }) + '\n')
                );
              }
            } else if (part.type === 'error') {
              console.error('AI SDK Error part:', (part as any).error);
              controller.enqueue(
                encoder.encode(JSON.stringify({ 
                  type: 'error', 
                  content: (part as any).error?.message || 'AI Provider Error' 
                }) + '\n')
              );
            }
          }
          controller.close();
        } catch (error) {
          console.error('Stream processing error:', error);
          // If we fail during streaming, send an error part if possible
          try {
            const errorMessage = error instanceof Error ? error.message : 'Unknown stream error';
            controller.enqueue(
              encoder.encode(JSON.stringify({ type: 'error', content: errorMessage }) + '\n')
            );
          } catch (e) {
            // Ignore if controller is already closed
          }
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error generating code:', error);

    // Return a more specific error message if available
    const errorMessage = error instanceof Error ? error.message : 'Error generating code';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
