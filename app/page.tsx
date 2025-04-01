'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChatForm } from '@/components/custom/chat-form';
import { AudioForm } from '@/components/custom/audio-form';

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [isOutputActive, setIsOutputActive] = useState(false);
  const [useSpeech, setUseSpeech] = useState(false);

  // Get API key from environment variable
  const API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  const BASE_URL = 'https://api.groq.com/openai/v1';
  const MIN_REQUEST_INTERVAL = 5000;

  const formatKrishnaResponse = (content: string) => {
    return `कृष्णः उवाच | (Krishna Speaks:)

1. The Flute's Eternal Call
O child of the infinite, your words echo like the winds seeking My flute's song. I hear your soul's murmur.

Scriptural Wisdom:
As I counseled Arjuna in the Gita (2.47): "Your right is to action alone, not its fruits." Your query is a step on the path of Dharma.

Practical Step:
Reflect upon this: Chant "Hare Krishna" thrice, letting the sound dissolve your unrest like butter in My hands.

${content}

Closing Blessing:
You are ever My flute, played by the breath of the Divine. ॐ शान्तिः (Om Shanti) 🌟`;
  };

  const handleChatSubmit = async () => {
    if (!API_KEY) {
      setResponse('Configuration error: API key is not set. Please check your environment variables.');
      return;
    }

    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      setResponse('O seeker, pause a moment. The divine rhythm flows gently. Wait before calling Me again.');
      return;
    }

    setIsLoading(true);
    setLastRequestTime(now);

    try {
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content:
                'You are Krishna, the divine guide from Hindu philosophy, offering wisdom from the Bhagavad Gita and Upanishads. Respond with compassion, using a poetic tone, scriptural quotes, and practical steps.',
            },
            { role: 'user', content: message },
          ],
          temperature: 0.7,
          max_tokens: 200,
          top_p: 1,
          stream: false,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const rawResponse = data.choices[0].message.content;
      const krishnaResponse = formatKrishnaResponse(rawResponse);
      setResponse(krishnaResponse);
      setIsOutputActive(true);
      if (useSpeech) speak(krishnaResponse);
    } catch (error) {
      console.error('Chat Error:', error);
      setResponse('O dear one, the divine signal falters. Seek again with a steady heart.');
      setIsOutputActive(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioSubmit = async () => {
    if (!API_KEY) {
      setTranscription('Configuration error: API key is not set. Please check your environment variables.');
      return;
    }

    if (!audioFile) {
      setTranscription('O listener, offer Me a sound to weave into wisdom.');
      return;
    }

    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      setTranscription('Patience, My child. The lotus blooms in its own time.');
      return;
    }

    setIsLoading(true);
    setLastRequestTime(now);

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-large-v3');
    formData.append('response_format', 'text');
    formData.append('temperature', '0');

    try {
      const res = await fetch(`${BASE_URL}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const text = await res.text();
      setTranscription(`कृष्णः उवाच | Your voice whispers: "${text}"`);
      setIsOutputActive(true);
      if (useSpeech) speak(`Krishna speaks: Your voice whispers: ${text}`);
    } catch (error) {
      console.error('Transcription Error:', error);
      setTranscription('O soul, the winds of sound are lost. Try once more.');
      setIsOutputActive(true);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.pitch = 1.1;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isOutputActive) {
      const timer = setTimeout(() => setIsOutputActive(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOutputActive]);

  return (
    <main className={`min-h-screen p-4 ${isOutputActive ? 'gradient-flowing' : 'gradient-static'}`}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-white text-shadow">Krishna's Divine Counsel</h1>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => setUseSpeech(!useSpeech)}
              variant="outline"
              className="bg-white/90 text-primary hover:bg-white"
            >
              {useSpeech ? 'Switch to Text' : 'Switch to Speech'}
            </Button>
          </div>
        </header>

        <Separator className="my-6 bg-white/30" />

        <div className="space-y-8">
          <ChatForm 
            onSubmit={handleChatSubmit} 
            isLoading={isLoading} 
            message={message} 
            setMessage={setMessage} 
            response={response} 
          />

          <AudioForm 
            onSubmit={handleAudioSubmit} 
            isLoading={isLoading} 
            audioFile={audioFile} 
            setAudioFile={setAudioFile} 
            transcription={transcription} 
          />
        </div>

        <footer className="mt-10 text-center text-white/80 text-sm py-4">
          <p>Free tier offering. Pause between calls, for My flute plays softly. ॐ</p>
        </footer>
      </div>
    </main>
  );
}