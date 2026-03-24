import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy for Coolify API to handle CORS and secure communication.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { instanceUrl, token, endpoint, method = 'GET', data } = body;

    // Use environment variables as fallback
    const finalUrl = instanceUrl || process.env.COOLIFY_URL;
    const finalToken = token || process.env.COOLIFY_TOKEN;

    if (!finalUrl) {
      return NextResponse.json({ error: 'Missing Instance URL (check .env.local)' }, { status: 400 });
    }
    if (!finalToken) {
      return NextResponse.json({ error: 'Missing API Token (check .env.local)' }, { status: 400 });
    }
    if (!endpoint) {
      return NextResponse.json({ error: 'Missing API endpoint' }, { status: 400 });
    }

    const baseUrl = finalUrl.replace(/\/$/, '');
    const targetUrl = `${baseUrl}/api/v1${endpoint}`;

    console.log(`Coolify Proxy: ${method} ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method,
      headers: {
        'Authorization': `Bearer ${finalToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json({ 
      data: result, 
      usingServerToken: !token && !!process.env.COOLIFY_TOKEN 
    });
  } catch (error: any) {
    console.error('Coolify Proxy Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
