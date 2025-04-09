// app/api/tts/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { text } = await req.json();
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const voiceId = '2iAXJEMO2o0PqUHzvZwQ';

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
  }

  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75,
        style: 0.8,
        speed: 0.9,
      },
    }),
  });

  if (!ttsRes.ok) {
    return NextResponse.json({ error: 'TTS failed' }, { status: ttsRes.status });
  }

  const blob = await ttsRes.blob();
  const buffer = await blob.arrayBuffer();

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      'Content-Type': 'audio/mpeg',
    },
  });
}
