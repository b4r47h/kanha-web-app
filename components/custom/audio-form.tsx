'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mic } from "lucide-react";

interface AudioFormProps {
  onSubmit: () => void;
  isLoading: boolean;
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  transcription: string;
}

export function AudioForm({ onSubmit, isLoading, audioFile, setAudioFile, transcription }: AudioFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Speak to Krishna</h2>
      <div className="flex gap-2">
        <Input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
          className="bg-white/90"
          disabled={isLoading}
        />
        <Button 
          onClick={onSubmit}
          disabled={isLoading || !audioFile}
          className="bg-accent text-white hover:bg-accent/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Transcribe
            </>
          )}
        </Button>
      </div>
      {transcription && (
        <div className="output-box">
          {transcription}
        </div>
      )}
    </div>
  );
}