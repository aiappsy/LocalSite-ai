import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy for GitHub API to handle file pushing and CORS.
 */
export async function POST(req: NextRequest) {
  try {
    const { token, owner, repo, path, content, message } = await req.json();

    if (!token || !owner || !repo || !path || !content) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const shaUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    
    // 1. Get existing file SHA if it exists
    let sha: string | undefined;
    try {
      const shaRes = await fetch(shaUrl, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      if (shaRes.ok) {
        const shaData = await shaRes.json();
        sha = shaData.sha;
      }
    } catch (e) {
      console.log('File does not exist yet or error fetching SHA');
    }

    // 2. Push/Update file
    const pushRes = await fetch(shaUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message || `Sync from WebCrafter ${new Date().toISOString()}`,
        content: btoa(unescape(encodeURIComponent(content))), // Handle UTF-8
        sha: sha
      })
    });

    const result = await pushRes.json();

    if (!pushRes.ok) {
      return NextResponse.json(result, { status: pushRes.status });
    }

    return NextResponse.json({ 
      success: true, 
      url: result.content.html_url,
      sha: result.content.sha 
    });
  } catch (error: any) {
    console.error('GitHub Push Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
