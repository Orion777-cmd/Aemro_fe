export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(" ");
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: number;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const MESSAGES_STORAGE_KEY = "lux-chat-messages";
const DOCUMENTS_STORAGE_KEY = "lux-chat-documents";
const CHAT_HISTORIES_KEY = "aemro-chat-histories";
const CURRENT_CHAT_ID_KEY = "aemro-current-chat-id";

export function saveMessages(messages: Message[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save messages:", error);
    }
  }
}

export function loadMessages(): Message[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }
  return [];
}

export function saveDocuments(documents: Document[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documents));
    } catch (error) {
      console.error("Failed to save documents:", error);
    }
  }
}

export function loadDocuments(): Document[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
  }
  return [];
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return "Today";
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return formatDate(timestamp);
  }
}

// Chat History Management
export function saveChatHistories(histories: ChatHistory[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CHAT_HISTORIES_KEY, JSON.stringify(histories));
    } catch (error) {
      console.error("Failed to save chat histories:", error);
    }
  }
}

export function loadChatHistories(): ChatHistory[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(CHAT_HISTORIES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load chat histories:", error);
    }
  }
  return [];
}

export function saveCurrentChatId(chatId: string | null): void {
  if (typeof window !== "undefined") {
    try {
      if (chatId) {
        localStorage.setItem(CURRENT_CHAT_ID_KEY, chatId);
      } else {
        localStorage.removeItem(CURRENT_CHAT_ID_KEY);
      }
    } catch (error) {
      console.error("Failed to save current chat ID:", error);
    }
  }
}

export function loadCurrentChatId(): string | null {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(CURRENT_CHAT_ID_KEY);
    } catch (error) {
      console.error("Failed to load current chat ID:", error);
    }
  }
  return null;
}

export function createChatHistory(messages: Message[]): ChatHistory {
  const firstUserMessage = messages.find((m) => m.role === "user");
  const title = firstUserMessage
    ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
    : "New Chat";

  return {
    id: `chat-${Date.now()}`,
    title,
    messages,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function updateChatHistoryTitle(history: ChatHistory, newTitle: string): ChatHistory {
  return {
    ...history,
    title: newTitle,
    updatedAt: Date.now(),
  };
}
