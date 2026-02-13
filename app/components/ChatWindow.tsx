"use client";

import { Message } from "@/app/lib/types";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export default function ChatWindow({
  messages,
  isLoading,
  onSendMessage,
}: ChatWindowProps) {
  return (
    <div className="flex flex-col h-screen">
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  );
}
