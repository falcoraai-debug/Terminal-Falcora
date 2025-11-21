import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI only when needed or provide a fallback to avoid build errors if env is missing
const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
};

export async function POST(request: Request) {
  try {
    const openai = getOpenAI();
    if (!openai) {
         return NextResponse.json({ text: 'AI Configuration Missing' }, { status: 503 });
    }

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
