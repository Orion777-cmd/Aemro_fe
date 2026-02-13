"use client";

import { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { Message, Document, ChatHistory } from "./lib/types";
import {
  saveMessages,
  loadMessages,
  saveDocuments,
  loadDocuments,
  saveChatHistories,
  loadChatHistories,
  saveCurrentChatId,
  loadCurrentChatId,
  createChatHistory,
  updateChatHistoryTitle,
} from "./lib/utils";
import { uploadDocument, listDocuments } from "./actions/documents";
import { chatCompletion } from "./actions/chat";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    const loadedHistories = loadChatHistories();
    const loadedCurrentChatId = loadCurrentChatId();
    const loadedDocuments = loadDocuments();

    setChatHistories(loadedHistories);
    setDocuments(loadedDocuments);

    // Load current chat or create new one
    if (loadedCurrentChatId) {
      const chat = loadedHistories.find((h) => h.id === loadedCurrentChatId);
      if (chat) {
        setCurrentChatId(loadedCurrentChatId);
        setMessages(chat.messages);
      } else {
        // Chat not found, create new
        setCurrentChatId(null);
        setMessages([]);
      }
    } else {
      // Migrate old messages if they exist
      const oldMessages = loadMessages();
      if (oldMessages.length > 0) {
        const newHistory = createChatHistory(oldMessages);
        const updatedHistories = [newHistory, ...loadedHistories];
        setChatHistories(updatedHistories);
        setCurrentChatId(newHistory.id);
        setMessages(newHistory.messages);
        saveChatHistories(updatedHistories);
        saveCurrentChatId(newHistory.id);
      } else {
        setMessages([]);
      }
    }

    listDocuments().then((serverDocuments) => {
      if (serverDocuments.length > 0) {
        setDocuments(serverDocuments);
        saveDocuments(serverDocuments);
      }
    });
  }, []);

  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChatHistories((prevHistories) => {
        // Update or create chat history
        const existingIndex = prevHistories.findIndex((h) => h.id === currentChatId);
        const firstUserMessage = messages.find((m) => m.role === "user");
        const title = firstUserMessage
          ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
          : "New Chat";

        if (existingIndex >= 0) {
          // Update existing
          const updated = [...prevHistories];
          updated[existingIndex] = {
            ...updated[existingIndex],
            messages,
            title,
            updatedAt: Date.now(),
          };
          saveChatHistories(updated);
          return updated;
        } else {
          // Create new
          const newHistory = createChatHistory(messages);
          const updated = [newHistory, ...prevHistories];
          setCurrentChatId(newHistory.id);
          saveChatHistories(updated);
          saveCurrentChatId(newHistory.id);
          return updated;
        }
      });
    } else if (currentChatId && messages.length === 0) {
      // Empty chat, remove it if it exists
      setChatHistories((prevHistories) => {
        const updated = prevHistories.filter((h) => h.id !== currentChatId);
        if (updated.length !== prevHistories.length) {
          saveChatHistories(updated);
          if (updated.length > 0) {
            setCurrentChatId(updated[0].id);
            setMessages(updated[0].messages);
            saveCurrentChatId(updated[0].id);
          } else {
            setCurrentChatId(null);
            saveCurrentChatId(null);
          }
          return updated;
        }
        return prevHistories;
      });
    }
  }, [messages, currentChatId]);

  useEffect(() => {
    saveDocuments(documents);
  }, [documents]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      role: "assistant",
      content: "",
      timestamp: Date.now() + 1,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const selectedIds = Array.from(selectedDocuments);
      let fullResponse = "";

      for await (const chunk of chatCompletion([...messages, userMessage], selectedIds)) {
        fullResponse += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content = fullResponse;
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          lastMessage.content = "Sorry, I encountered an error. Please try again.";
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const newDocument = await uploadDocument(formData);
      setDocuments((prev) => {
        const updated = [...prev, newDocument];
        saveDocuments(updated);
        return updated;
      });
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleDocumentSelect = (id: string) => {
    setSelectedDocuments((prev) => {
      const updated = new Set(prev);
      updated.add(id);
      return updated;
    });
  };

  const handleDocumentDeselect = (id: string) => {
    setSelectedDocuments((prev) => {
      const updated = new Set(prev);
      updated.delete(id);
      return updated;
    });
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear the current chat?")) {
      setMessages([]);
      if (currentChatId) {
        const updated = chatHistories.filter((h) => h.id !== currentChatId);
        setChatHistories(updated);
        saveChatHistories(updated);
        if (updated.length > 0) {
          setCurrentChatId(updated[0].id);
          setMessages(updated[0].messages);
          saveCurrentChatId(updated[0].id);
        } else {
          setCurrentChatId(null);
          saveCurrentChatId(null);
        }
      }
    }
  };

  const handleSelectChat = (chatId: string) => {
    const chat = chatHistories.find((h) => h.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      saveCurrentChatId(chatId);
      setSidebarOpen(false); // Close sidebar on mobile after selection
    }
  };

  const handleDeleteChat = (chatId: string) => {
    const updated = chatHistories.filter((h) => h.id !== chatId);
    setChatHistories(updated);
    saveChatHistories(updated);

    if (currentChatId === chatId) {
      // If deleting current chat, switch to another or create new
      if (updated.length > 0) {
        setCurrentChatId(updated[0].id);
        setMessages(updated[0].messages);
        saveCurrentChatId(updated[0].id);
      } else {
        setCurrentChatId(null);
        setMessages([]);
        saveCurrentChatId(null);
      }
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    saveCurrentChatId(null);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          documents={documents}
          selectedDocuments={selectedDocuments}
          onDocumentSelect={handleDocumentSelect}
          onDocumentDeselect={handleDocumentDeselect}
          onDocumentUpload={handleDocumentUpload}
          onClearChat={handleClearChat}
          chatHistories={chatHistories}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onNewChat={handleNewChat}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}
