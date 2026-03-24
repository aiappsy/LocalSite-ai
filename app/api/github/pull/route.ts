import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy for GitHub API to handle file retrieval.
 */
export async function POST(req: NextRequest) {
  try {
    const { token, owner, repo, path } = await req.json();

    if (!token || !owner || !repo || !path) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // GitHub returns content encoded in base64
    const content = atob(data.content.replace(/\n/g, ''));
    // Handle UTF-8 decoding
    const decodedContent = decodeURIComponent(escape(content));

    return NextResponse.json({ 
      success: true, 
      content: decodedContent,
      sha: data.sha 
    });
  } catch (error: any) {
    console.error('GitHub Pull Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
