"use server";

import { getDocumentContent } from "./documents";
import { Message } from "@/app/lib/types";

// Backend API configuration
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || "http://localhost:8000";
const BACKEND_CHAT_ENDPOINT = `${BACKEND_API_URL}/api/chat`;

async function getBackendResponse(
  messages: Array<{ role: string; content: string }>,
  documentIds?: string[]
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(BACKEND_CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: messages,
      document_ids: documentIds || [],
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`Backend API error (${response.status}): ${errorText}`);
  }

  return response.body!;
}

function createMockStream(message: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = message.split(" ");
  let index = 0;

  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        const text = index === 0 ? chunk : ` ${chunk}`;
        controller.enqueue(encoder.encode(text));
        index++;
      }
      controller.close();
    },
  });
}

export async function* chatCompletion(
  messages: Message[],
  selectedDocumentIds: string[]
): AsyncGenerator<string, void, unknown> {
  const apiMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // Check if backend URL is configured
  if (!BACKEND_API_URL || BACKEND_API_URL === "http://localhost:8000") {
    console.warn("Backend API URL not configured. Using mock response.");
    const mockResponse = `I understand you're asking: "${messages[messages.length - 1]?.content || ""}". ` +
      `This is a mock response since the backend API URL is not configured. ` +
      `Please set BACKEND_API_URL or NEXT_PUBLIC_BACKEND_API_URL environment variable.` +
      (selectedDocumentIds.length > 0 ? `\n\nI can see you've selected ${selectedDocumentIds.length} document(s).` : "");
    
    const mockStream = createMockStream(mockResponse);
    const reader = mockStream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield decoder.decode(value, { stream: true });
      }
    } finally {
      reader.releaseLock();
    }
    return;
  }

  try {
    const stream = await getBackendResponse(apiMessages, selectedDocumentIds);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Handle Server-Sent Events (SSE) format
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.substring(6).trim();
            if (data === "[DONE]") {
              continue;
            }
            try {
              // Try parsing as JSON (for structured responses)
              const parsed = JSON.parse(data);
              // Handle different response formats
              if (parsed.content) {
                yield parsed.content;
              } else if (parsed.text) {
                yield parsed.text;
              } else if (parsed.message) {
                yield parsed.message;
              } else if (typeof parsed === "string") {
                yield parsed;
              }
            } catch (e) {
              // If not JSON, treat as plain text
              if (data) {
                yield data;
              }
            }
          } else if (line.trim() && !line.startsWith(":")) {
            // Handle plain text streaming (non-SSE format)
            yield line;
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.content) yield parsed.content;
          else if (parsed.text) yield parsed.text;
          else if (parsed.message) yield parsed.message;
        } catch (e) {
          if (buffer.trim()) yield buffer;
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error("Chat completion error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to get response from backend";
    yield `Error: ${errorMessage}. Please check that the backend is running at ${BACKEND_API_URL}`;
  }
}
