import { NextResponse } from 'next/server';
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY as string,
});

const client = new NeynarAPIClient(config);

export async function POST(request: Request) {
  try {
    const { text, embeds, signerUuid } = await request.json();

    // Use provided signer OR fall back to server-side env signer (Bot mode)
    const finalSignerUuid = signerUuid && signerUuid !== "env-configured" 
        ? signerUuid 
        : process.env.NEYNAR_SIGNER_UUID;

    if (!finalSignerUuid) {
        return NextResponse.json({ error: 'Signer UUID required (Client or Server ENV)' }, { status: 401 });
    }

    // Level-2: Handle Frame embeds
    // If we receive an embed that is our own frame URL, we should ensure it's passed correctly.
    // The client already constructs the correct embeds array: [{ url: frameUrl }] or [{ url: imageUrl }]
    
    const result = await client.publishCast({
        signerUuid: finalSignerUuid,
        text,
        embeds
    });

    // Cast result to any to access hash if it's missing in the type definition
    return NextResponse.json({ hash: (result as any).hash });
  } catch (error) {
    console.error('Cast Error:', error);
    return NextResponse.json({ error: 'Failed to cast' }, { status: 500 });
  }
}
