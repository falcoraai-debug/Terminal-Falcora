import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const pair = searchParams.get('pair') || 'BTCUSDT';
  const interval = searchParams.get('interval') || '1h';
  const img = searchParams.get('img');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const targetUrl = `${appUrl}?pair=${pair}&interval=${interval}`;
  
  // Fallback image if none provided (e.g. default OG)
  const displayImage = img || `${appUrl}/api/og`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="Terminal Cast: ${pair} ${interval}" />
        <meta property="og:image" content="${displayImage}" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${displayImage}" />
        
        <meta property="fc:frame:button:1" content="Regen AI" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="${targetUrl}&action=ai" />
        
        <meta property="fc:frame:button:2" content="Refresh Chart" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="${targetUrl}&action=refresh" />
        
        <title>Terminal Cast: ${pair}</title>
      </head>
      <body style="background: #000; color: #8b5cf6; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0;">
        <h1>${pair} ${interval}</h1>
        <img src="${displayImage}" alt="Chart" style="max-width: 90%; border: 1px solid #4c1d95;" />
        <p style="margin-top: 20px;">Terminal Cast by FALCORA</p>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

export async function POST(req: NextRequest) {
    return GET(req);
}
