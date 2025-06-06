'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChatForm } from '@/components/custom/chat-form';


export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [isOutputActive, setIsOutputActive] = useState(false);
  const [useSpeech, setUseSpeech] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);



  const MIN_REQUEST_INTERVAL = 5000;

  const formatKrishnaResponse = (content: string) => {
    return `कृष्णः उवाच | (Krishna Speaks:)\n

O child of the infinite, your words echo like the winds seeking My flute's song. I hear your soul's murmur.

As I counseled Arjuna in the Gita (2.47): "Your right is to action alone, not its fruits." Your query is a step on the path of Dharma.

Chant "Hare Krishna" thrice, letting the sound dissolve your unrest like butter in My hands.

${content}

You are ever My flute, played by the breath of the Divine. ॐ शान्तिः (Om Shanti) 🌟`;
  };

  const handleChatSubmit = async () => {
    if (!message.trim()) {
      setResponse("Ask Me something first, dear one.");
      return;
    }

    setIsLoading(true);
    setLastRequestTime(Date.now());

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');

      const krishnaResponse = formatKrishnaResponse(data.message);
      setResponse(krishnaResponse);
      setIsExpanded(false); // hide text while speaking
      setIsOutputActive(true);

      if (useSpeech) {
        await textToSpeechElevenLabs(krishnaResponse);
      } else {
        setIsExpanded(true);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setResponse("O dear one, the divine signal falters. Seek again with a steady heart.");
      setIsOutputActive(true);
      setIsExpanded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmitFromVoice = async (text: string) => {
    setIsLoading(true);
    setLastRequestTime(Date.now());

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');

      const krishnaResponse = formatKrishnaResponse(data.message);
      setResponse(krishnaResponse);
      setIsExpanded(false);
      setIsOutputActive(true);

      if (useSpeech) {
        await textToSpeechElevenLabs(krishnaResponse);
      } else {
        setIsExpanded(true);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setResponse("O divine one, the cosmic circuit wavers. Ask again.");
      setIsOutputActive(true);
      setIsExpanded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const textToSpeechElevenLabs = async (text: string) => {
    try {
      setTtsLoading(true);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('Failed to generate TTS');
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      audio.onplay = () => {
        setIsSpeaking(true);
        setIsExpanded(false);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        setTtsLoading(false);
        setIsExpanded(true);
      };

      audio.play();
    } catch (error) {
      console.error('TTS Error:', error);
      setTtsLoading(false);
      setIsExpanded(true);
    }
  };

  useEffect(() => {
    if (isOutputActive) {
      const timer = setTimeout(() => setIsOutputActive(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isOutputActive]);

  return (
    <main className={`min-h-screen p-4 ${isOutputActive ? 'gradient-flowing' : 'gradient-static'}`}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-primary text-shadow "> Krishna&apos;s Divine Counsel</h1>
          <div className="mt-4 flex justify-center items-center">
            <Button
              onClick={() => setUseSpeech(!useSpeech)}
              variant="outline"
              className="bg-white/90 text-primary hover:bg-white ml-4"
            >
              {useSpeech ? 'Switch to Text' : 'Switch to Speech'}
            </Button>
          </div>
        </header>

        <Separator className="my-6 bg-white/30" />

        <div className="space-y-8">
          <ChatForm
            onSubmit={handleChatSubmit}
            isLoading={isLoading || ttsLoading}
            message={message}
            setMessage={setMessage}
            response={isExpanded ? response : ''}
          />

          {ttsLoading && (
            <p className="text-white text-center animate-pulse mt-4">Krishna prepares to speak... 🌀</p>
          )}

          {response && (
            <div className="text-right mt-4">
              <Button
                variant="ghost"
                className="text-white/80 text-sm underline"
                onClick={() => setIsExpanded((prev) => !prev)}
              >
                {isExpanded ? 'Collapse' : 'Expand'} Response
              </Button>
            </div>
          )}
        </div>

        <footer className="mt-10 text-center text-primary text-sm py-4">
          <p>Free tier offering. Pause between calls, for My flute plays softly. ॐ</p><br /><br />
          <a href="https://bkportfolio.web.app" className="text-blue-500 hover:text-red-500 hover:underline">@b4r47h</a>
        </footer>
      </div>
    </main>
  );
}
