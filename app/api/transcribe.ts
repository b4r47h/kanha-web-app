import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Your Groq API key
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Set in .env.local

// Groq Whisper endpoint (adjust if different)
const GROQ_TRANSCRIBE_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm({
    uploadDir: '/tmp',
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: 'No file uploaded or parse error' });
    }

    const file = files.file as formidable.File;
    const audioPath = file.filepath;

    try {
      const audioStream = fs.createReadStream(audioPath);
      const formData = new FormData();
      formData.append('file', audioStream, file.originalFilename || 'audio.webm');
      formData.append('model', 'whisper-large'); // or any other supported model

      const groqRes = await fetch(GROQ_TRANSCRIBE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: formData as any, // Next.js doesn't like FormData type here
      });

      const data = await groqRes.json();

      if (!groqRes.ok) {
        console.error('Groq error response:', data);
        return res.status(500).json({ error: data.error?.message || 'Groq transcription failed' });
      }

      return res.status(200).json({ transcript: data.text });
    } catch (error) {
      console.error('Transcription failed:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      fs.unlink(audioPath, () => {});
    }
  });
}
