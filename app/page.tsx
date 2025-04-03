'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChatForm } from '@/components/custom/chat-form';

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [audioFile, setAudioFile] = useState<Blob | null>(null); // Store audio as Blob
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [isOutputActive, setIsOutputActive] = useState(false);
  const [useSpeech, setUseSpeech] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // State for recording status
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null); // Store MediaRecorder instance

  // Get API keys from environment variables
  const API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  const BASE_URL = 'https://api.groq.com/openai/v1';
  const MIN_REQUEST_INTERVAL = 5000;

  // Format Krishna's response
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

  // Function to handle chat submission
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
      if (useSpeech) textToSpeechElevenLabs(krishnaResponse); // Call TTS function
    } catch (error) {
      console.error('Chat Error:', error);
      setResponse('O dear one, the divine signal falters. Seek again with a steady heart.');
      setIsOutputActive(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to start recording audio from the microphone
  const startRecording = async () => {
    if (isRecording) return; // Prevent multiple recordings

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // Access microphone
      const recorder = new MediaRecorder(stream);

      let chunks: Blob[] = []; // To store recorded audio data

      recorder.ondataavailable = (event) => chunks.push(event.data); // Collect audio data chunks

      recorder.onstop = () => {
        // Create a Blob from recorded chunks and store it in state
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setAudioFile(audioBlob); // Save audio file for processing
        chunks = []; // Reset chunks for next recording
        console.log("Recording stopped and file saved.");
        
        // Transcribe the recorded audio after stopping
        handleAudioSubmit(); 
      };

      recorder.start(); // Start recording
      setMediaRecorder(recorder); // Save MediaRecorder instance in state
      setIsRecording(true); // Update recording status
      console.log("Recording started...");
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Function to stop recording audio
  const stopRecording = () => {
    if (!mediaRecorder || !isRecording) return; // Ensure MediaRecorder exists and is recording

    mediaRecorder.stop(); // Stop the recording process
    console.log("Recording stopped.");
    setIsRecording(false); // Update recording status
  };

  // Function to handle audio submission (microphone input)
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
    formData.append('file', audioFile); // Send microphone input as file
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
      
      if (useSpeech) textToSpeechElevenLabs(`Krishna speaks: Your voice whispers: ${text}`); // Call TTS for transcription
      
    } catch (error) {
      console.error('Transcription Error:', error);
      setTranscription('O soul, the winds of sound are lost. Try once more.');
      setIsOutputActive(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Function for text-to-speech using ElevenLabs API
  const textToSpeechElevenLabs = async (text: string) => {
    if (!ELEVENLABS_API_KEY) {
      console.error('ElevenLabs API key is missing!');
      return;
    }

    const voiceId = '2iAXJEMO2o0PqUHzvZwQ'; // Replace with your desired voice ID
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
            style: 0.8,
            speed: 0.9,
          },
        }),
      });

      if (!response.ok) throw new Error(`ElevenLabs API error! Status code: ${response.status}`);

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play the audio
      const audio = new Audio(audioUrl);
      audio.play();
      
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
    }
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
          <h1 className="text-4xl font-bold text-white text-shadow">{`Krishna's Divine Counsel`}</h1>
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={isRecording ? stopRecording : startRecording} 
              variant="outline" 
              className="bg-white/90 text-primary hover:bg-white"
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            <Button onClick={() => setUseSpeech(!useSpeech)} variant="outline" className="bg-white/90 text-primary hover:bg-white ml-4">
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
        </div>

        <footer className="mt-10 text-center text-white/80 text-sm py-4">
          <p>Free tier offering. Pause between calls, for My flute plays softly. ॐ</p>
        </footer>
      </div>
    </main>
  );
}