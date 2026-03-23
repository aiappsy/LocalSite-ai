import { NextRequest } from 'next/server';
import { LLMProvider } from '@/lib/providers/config';
import { createProviderClient } from '@/lib/providers/provider';

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, baseUrl } = await request.json();

    if (!provider) {
      return new Response(
        JSON.stringify({ error: 'Provider is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const client = createProviderClient(provider as LLMProvider, apiKey, baseUrl);
    
    // Attempt to fetch models as a connection test
    const models = await client.getModels();

    if (models && models.length > 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Connection successful!', modelCount: models.length }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'No models returned from provider.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Connection test error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to connect to provider';
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
