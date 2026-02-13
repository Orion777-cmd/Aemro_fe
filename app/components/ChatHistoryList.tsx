"use client";

import { ChatHistory } from "@/app/lib/types";
import { formatDateTime } from "@/app/lib/utils";

interface ChatHistoryListProps {
  histories: ChatHistory[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onNewChat: () => void;
}

export default function ChatHistoryList({
  histories,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
}: ChatHistoryListProps) {
  const sortedHistories = [...histories].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gold-900/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gold-500">Chat History</h2>
          <button
            onClick={onNewChat}
            className="px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-black text-sm font-medium rounded-lg transition-colors"
            title="New Chat"
          >
            + New
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sortedHistories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-2">No chat history yet</p>
            <p className="text-xs text-gray-600">Start a conversation to create your first chat</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedHistories.map((history) => (
              <div
                key={history.id}
                onClick={() => onSelectChat(history.id)}
                className={`
                  group relative p-3 rounded-lg cursor-pointer transition-all duration-200
                  ${
                    currentChatId === history.id
                      ? "bg-gold-900/30 border border-gold-500/50"
                      : "bg-gold-900/5 hover:bg-gold-900/15 border border-gold-900/20 hover:border-gold-500/30"
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-200 truncate mb-1">
                      {history.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{history.messages.length} messages</span>
                      <span>•</span>
                      <span>{formatDateTime(history.updatedAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this chat?")) {
                        onDeleteChat(history.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-400 transition-all"
                    title="Delete chat"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
