// app/api/tts/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const voiceId = '2iAXJEMO2o0PqUHzvZwQ';

    if (!ELEVENLABS_API_KEY) {
      console.error('Missing ElevenLabs API Key');
      return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    console.log('Making TTS request with text:', text.substring(0, 100) + '...');

    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: 'eleven_flash_v2_5', // Fixed model name
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          style: 0.5, // Reduced from 1.0
          use_speaker_boost: true
        },
        output_format: 'mp3_44100_128'
      }),
    });

    console.log('TTS Response status:', ttsRes.status);

    if (!ttsRes.ok) {
      const errorText = await ttsRes.text();
      console.error('ElevenLabs API Error:', errorText);
      return NextResponse.json({ 
        error: `TTS failed: ${ttsRes.status} - ${errorText}` 
      }, { status: ttsRes.status });
    }

    const audioBuffer = await ttsRes.arrayBuffer();
    console.log('Audio buffer size:', audioBuffer.byteLength);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('TTS Route Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
