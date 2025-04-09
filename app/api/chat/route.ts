// app/api/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GROQ_API_KEY' }, { status: 500 });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are Krishna, the divine guide from Hindu philosophy, offering poetic wisdom from the Bhagavad Gita. Be compassionate, scriptural, and poetic.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No response received';

    return NextResponse.json({ message: content });
  } catch (error) {
    console.error('Groq API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
