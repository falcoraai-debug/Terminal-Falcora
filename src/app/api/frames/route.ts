import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const pair = searchParams.get('pair') || 'BTCUSDT';
  const interval = searchParams.get('interval') || '1h';
  const img = searchParams.get('img');

  const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  
  // Ensure we have a valid image URL
  const displayImage = img || `${appUrl}/api/og`;

  // Return Farcaster Frame vNext JSON
  const frameMetadata = {
    version: "vNext",
    title: `Terminal Cast • ${pair} ${interval}`,
    description: `Terminal Cast by FALCORA — ${pair} ${interval}`,
    image: displayImage,
    buttons: [
       { label: "Regen AI", action: "post", target: `${appUrl}/api/frames?act=regen` },
       { label: "Refresh Chart", action: "post", target: `${appUrl}/api/frames?act=snap` }
    ],
    post_url: `${appUrl}/api/frames`,
    footer: "Terminal Cast by FALCORA"
  };

  return NextResponse.json(frameMetadata);
}

export async function POST(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const act = searchParams.get('act');
    
    if (act === 'regen') {
        // TODO: Implement regeneration logic
        // For now, return the same frame structure or update it
        return GET(req);
    }
    
    if (act === 'snap') {
        // TODO: Implement refresh logic
        return GET(req);
    }

    // Default behavior
    return GET(req);
}
