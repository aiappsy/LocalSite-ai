import { NextRequest, NextResponse } from 'next/server';
import { LLMProvider, getAvailableProviders } from '@/lib/providers/config';
import { createProviderClient } from '@/lib/providers/provider';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const providerParam = searchParams.get('provider');
  return handleFetchModels(providerParam as LLMProvider);
}

export async function POST(request: NextRequest) {
  try {
    const { provider, customApiKey, customBaseUrl } = await request.json();
    return handleFetchModels(provider, customApiKey, customBaseUrl);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

async function handleFetchModels(providerId: LLMProvider, customApiKey?: string, customBaseUrl?: string) {
  try {
    let provider: LLMProvider = providerId;

    if (!provider || !Object.values(LLMProvider).includes(provider)) {
      provider = (process.env.DEFAULT_PROVIDER as LLMProvider) || LLMProvider.DEEPSEEK;
    }

    // Create the provider client with custom credentials if provided
    const providerClient = createProviderClient(provider, customApiKey, customBaseUrl);

    // Get the available models
    const models = await providerClient.getModels();

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error fetching models';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Endpoint to get available providers
export async function PATCH() {
  try {
    const providers = getAvailableProviders().map(provider => ({
      id: provider.id,
      name: provider.name,
      description: provider.description,
      isLocal: provider.isLocal,
    }));

    return NextResponse.json(providers);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching providers' }, { status: 500 });
  }
}
