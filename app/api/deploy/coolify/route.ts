import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy for Coolify API to handle CORS and secure communication.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { instanceUrl, token, endpoint, method = 'GET', data } = body;

    // Use environment variables as fallback
    instanceUrl = instanceUrl || process.env.COOLIFY_URL;
    token = token || process.env.COOLIFY_TOKEN;

    if (!instanceUrl || !token || !endpoint) {
      return NextResponse.json({ error: 'Missing required parameters (Instance URL or Token)' }, { status: 400 });
    }

    // Ensure URL is clean
    const baseUrl = instanceUrl.replace(/\/$/, '');
    const targetUrl = `${baseUrl}/api/v1${endpoint}`;

    const response = await fetch(targetUrl, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Coolify Proxy Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
