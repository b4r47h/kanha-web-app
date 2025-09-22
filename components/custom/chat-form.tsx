'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, SproutIcon } from "lucide-react";

interface ChatFormProps {
  onSubmit: () => void;
  isLoading: boolean;
  message: string;
  setMessage: (message: string) => void;
  response: string;
}

export function ChatForm({ onSubmit, isLoading, message, setMessage, response }: ChatFormProps) {
  return (
    <div className="space-y-4 mt-12 ">
      <h2 className="text-2xl font-semibold text-center text-gray-400 mb-8">Seek Divine Guidance</h2>
      <div className="flex gap-4 flex-col items-center">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask Krishna for guidance..."
          className="bg-gradient-to-r from-indigo-600 via-yellow-700 to-violet-600 rounded-full w-full p-8"
          disabled={isLoading}
        />
        <Button
          onClick={onSubmit}
          disabled={isLoading || !message.trim()}
          className="bg-gradient-radial from-red-600 via-indigo-700 to-violet-600 text-yellow-100 h-20 w-20 mt-8"
        >
          {isLoading ? (
            <>
              <SproutIcon className="mr-2 h-4 w-4 animate-spin" />
              Seeking...
            </>
          ) : (
            'Seek'
          )}
        </Button>

      </div>
      {response && (
        <div className="whitespace-pre-line">
          {response}
        </div>
      )}
    </div>
  );
}