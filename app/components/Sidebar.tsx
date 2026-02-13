"use client";

import { Document, ChatHistory } from "@/app/lib/types";
import DocumentPicker from "./DocumentPicker";
import ChatHistoryList from "./ChatHistoryList";
import { formatDateTime } from "@/app/lib/utils";

interface SidebarProps {
  documents: Document[];
  selectedDocuments: Set<string>;
  onDocumentSelect: (id: string) => void;
  onDocumentDeselect: (id: string) => void;
  onDocumentUpload: (file: File) => Promise<void>;
  onClearChat: () => void;
  chatHistories: ChatHistory[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onNewChat: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  documents,
  selectedDocuments,
  onDocumentSelect,
  onDocumentDeselect,
  onDocumentUpload,
  onClearChat,
  chatHistories,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const sortedHistories = [...chatHistories].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 border-r border-gold-900/30 bg-black/95 lg:bg-black/30 backdrop-blur-sm
          h-screen flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gold-900/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gold-500">Aemro</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden text-gray-400 hover:text-gold-500 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Chat History Section */}
          <div className="p-4 border-b border-gold-900/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wide">
                Chat History
              </h3>
              <button
                onClick={onNewChat}
                className="px-2 py-1 bg-gold-500 hover:bg-gold-600 text-black text-xs font-medium rounded transition-colors"
                title="New Chat"
              >
                + New
              </button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {sortedHistories.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-2">
                  No chats yet
                </p>
              ) : (
                sortedHistories.map((history) => (
                  <div
                    key={history.id}
                    onClick={() => onSelectChat(history.id)}
                    className={`
                      group relative p-2 rounded-lg cursor-pointer transition-all duration-200
                      ${
                        currentChatId === history.id
                          ? "bg-gold-900/30 border border-gold-500/50"
                          : "bg-gold-900/5 hover:bg-gold-900/15 border border-gold-900/20 hover:border-gold-500/30"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-gray-200 truncate">
                          {history.title}
                        </h4>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-0.5">
                          <span>{history.messages.length} msgs</span>
                          <span>•</span>
                          <span>{formatDateTime(history.updatedAt)}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this chat?")) {
                            onDeleteChat(history.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 text-gray-400 hover:text-red-400 transition-all"
                        title="Delete"
                      >
                        <svg
                          className="w-3 h-3"
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
                ))
              )}
            </div>
          </div>

          {/* Textbooks Section */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wide mb-3">
              Textbooks
            </h3>
            <DocumentPicker
              documents={documents}
              selectedDocuments={selectedDocuments}
              onSelect={onDocumentSelect}
              onDeselect={onDocumentDeselect}
              onUpload={onDocumentUpload}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gold-900/30">
          <button
            onClick={onClearChat}
            className="w-full px-4 py-2 bg-gold-900/20 hover:bg-gold-900/30 border border-gold-900/50 text-gold-500 rounded-lg transition-all duration-200 hover:border-gold-500/50 font-medium text-sm"
          >
            Clear Current Chat
          </button>
        </div>
      </aside>
    </>
  );
}
