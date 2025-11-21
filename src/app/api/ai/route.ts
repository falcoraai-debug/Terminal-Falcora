import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pair, interval, signals, lastPrice } = body;

    const prompt = `
      Act as a professional crypto trading analyst.
      Analyze the following data for ${pair} on the ${interval} timeframe:
      - Current Price: ${lastPrice}
      - Technical Signals: ${JSON.stringify(signals)}
      
      Write a single, concise, professional sentence summarizing the outlook. 
      Be witty but professional. Max 20 words. No emojis.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
    });

    const content = completion.choices[0].message.content?.trim();
    return NextResponse.json({ text: content });
  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ text: 'Analysis currently unavailable.' }, { status: 500 });
  }
}
