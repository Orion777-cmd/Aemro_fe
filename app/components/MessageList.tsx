"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/app/lib/types";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="text-6xl">
              <svg
                className="w-16 h-16 mx-auto text-gold-500"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h1v1c0 1.1.9 2 2 2h.5c.28 0 .5.22.5.5v.5c0 .28.22.5.5.5h1c.28 0 .5-.22.5-.5V21c0-.28.22-.5.5-.5H15c1.1 0 2-.9 2-2v-1h1c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 2.88-2.88 7.19-5 9.88C9.88 16.19 7 11.88 7 9c0-2.76 2.24-5 5-5z"/>
                <circle cx="9" cy="9" r="1.5"/>
                <circle cx="15" cy="9" r="1.5"/>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gold-500">
              Welcome to Aemro <span className="text-gold-400">አምሮ</span>
            </h2>
            <p className="text-gray-400 max-w-md">
              Your AI study buddy! Upload your textbooks and study materials, 
              and I'll help you learn by directly referencing your preferred textbooks. 
              Ask me anything about your course materials!
            </p>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-900/50 border border-gold-900/30 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
              <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
