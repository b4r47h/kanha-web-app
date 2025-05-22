'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface ChatFormProps {
  onSubmit: () => void;
  isLoading: boolean;
  message: string;
  setMessage: (message: string) => void;
  response: string;
}

export function ChatForm({ onSubmit, isLoading, message, setMessage, response }: ChatFormProps) {
  return (
    <div className="space-y-4 ">
      <h2 className="text-2xl font-semibold justify-centre">Seek Divine Guidance</h2>
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask Krishna for guidance..."
          className="bg-white/90"
          disabled={isLoading}
        />
        <Button
          onClick={onSubmit}
          disabled={isLoading || !message.trim()}
          className="bg-gradient-to-r from-indigo-600 to-violet-700 text-primary hover:opacity-90 ml-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeking...
            </>
          ) : (
            'Ask'
          )}
        </Button>

      </div>
      {response && (
        <div className="output-box whitespace-pre-line">
          {response}
        </div>
      )}
    </div>
  );
}