"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

// Type definition for SpeechRecognition
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const interimTranscriptRef = useRef("");
  const isIntentionallyStoppedRef = useRef(false);
  const isRecordingRef = useRef(false);
  const networkRetryCountRef = useRef(0);

  const createRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      interimTranscriptRef.current = interimTranscript;
      if (finalTranscript) {
        setInput((prev) => (prev + finalTranscript).trim());
        interimTranscriptRef.current = "";
      } else {
        // Show interim results in the input
        setInput((prev) => {
          const baseText = prev.replace(interimTranscriptRef.current, "");
          return (baseText + interimTranscript).trim();
        });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log("Speech recognition error:", event.error, "Recording:", isRecordingRef.current);
      
      // Don't stop on "no-speech" errors - just restart
      if (event.error === "no-speech") {
        // Restart if we're still supposed to be recording
        if (isRecordingRef.current && !isIntentionallyStoppedRef.current) {
          setTimeout(() => {
            if (isRecordingRef.current && !isIntentionallyStoppedRef.current) {
              // Create new recognition instance
              const newRecognition = createRecognition();
              if (newRecognition) {
                recognitionRef.current = newRecognition;
                try {
                  newRecognition.start();
                } catch (e) {
                  console.log("Restart error (no-speech):", e);
                }
              }
            }
          }, 300);
        }
        return;
      }
      
      if (event.error === "aborted") {
        return;
      }
      
      // For network errors, try to restart with new instance (with retry limit)
      if (event.error === "network") {
        networkRetryCountRef.current += 1;
        
        // Stop after 3 retry attempts
        if (networkRetryCountRef.current > 3) {
          setIsRecording(false);
          isRecordingRef.current = false;
          setErrorMessage("Network error: Unable to connect to speech recognition service. Please check your internet connection.");
          setTimeout(() => setErrorMessage(null), 5000);
          networkRetryCountRef.current = 0;
          return;
        }
        
        if (isRecordingRef.current && !isIntentionallyStoppedRef.current) {
          setErrorMessage("Network issue detected. Retrying...");
          setTimeout(() => {
            if (isRecordingRef.current && !isIntentionallyStoppedRef.current) {
              const newRecognition = createRecognition();
              if (newRecognition) {
                recognitionRef.current = newRecognition;
                try {
                  newRecognition.start();
                  setErrorMessage(null);
                } catch (e) {
                  console.log("Restart error (network):", e);
                }
              }
            }
          }, 1000);
        }
        return;
      }
      
      // Reset retry count on successful operations
      if (event.error !== "network") {
        networkRetryCountRef.current = 0;
      }
      
      // For other errors, stop recording only if critical
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        if (isRecordingRef.current) {
          setIsRecording(false);
          isRecordingRef.current = false;
          setErrorMessage("Microphone permission denied. Please allow microphone access.");
          setTimeout(() => setErrorMessage(null), 5000);
        }
      }
    };

    recognition.onend = () => {
      console.log("Recognition ended. Recording:", isRecordingRef.current, "Intentional:", isIntentionallyStoppedRef.current);
      
      // Only restart if we're still supposed to be recording and didn't intentionally stop
      if (isRecordingRef.current && !isIntentionallyStoppedRef.current) {
        // Create a new recognition instance and restart
        setTimeout(() => {
          if (isRecordingRef.current && !isIntentionallyStoppedRef.current) {
            const newRecognition = createRecognition();
            if (newRecognition) {
              recognitionRef.current = newRecognition;
              try {
                console.log("Restarting recognition with new instance...");
                newRecognition.start();
              } catch (error: any) {
                console.log("Failed to restart:", error);
                // Try one more time
                setTimeout(() => {
                  if (isRecordingRef.current && !isIntentionallyStoppedRef.current) {
                    const retryRecognition = createRecognition();
                    if (retryRecognition) {
                      recognitionRef.current = retryRecognition;
                      try {
                        retryRecognition.start();
                      } catch (e: any) {
                        console.log("Second restart attempt failed:", e);
                        setIsRecording(false);
                        isRecordingRef.current = false;
                      }
                    }
                  }
                }, 300);
              }
            }
          }
        }, 100);
      } else {
        // Intentionally stopped, clean up
        console.log("Cleaning up - intentionally stopped");
        setIsRecording(false);
        isRecordingRef.current = false;
        interimTranscriptRef.current = "";
      }
    };

    return recognition;
  };

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = createRecognition();
    }

    return () => {
      isIntentionallyStoppedRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && !disabled) {
      onSend(trimmedInput);
      setInput("");
      interimTranscriptRef.current = "";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current || disabled) return;

    try {
      console.log("Starting recording...");
      isIntentionallyStoppedRef.current = false;
      isRecordingRef.current = true;
      setIsRecording(true);
      setErrorMessage(null);
      networkRetryCountRef.current = 0;
      // Clear input when starting new recording
      setInput("");
      interimTranscriptRef.current = "";
      recognitionRef.current.start();
      console.log("Recording started successfully");
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
      isRecordingRef.current = false;
      isIntentionallyStoppedRef.current = true;
      setErrorMessage("Failed to start recording. Please check microphone permissions and internet connection.");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current || !isRecording) return;

    // Intentionally stopping
    isIntentionallyStoppedRef.current = true;
    isRecordingRef.current = false;
    recognitionRef.current.stop();
    setIsRecording(false);
    setErrorMessage(null);
    // Send the recorded text if there's any
    if (input.trim()) {
      handleSend();
    }
  };

  return (
    <div className="border-t border-gold-900/30 bg-black/50 backdrop-blur-sm p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-3">
          {/* Voice Recording Buttons */}
          {isSupported && (
            <>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={disabled}
                  className="flex-shrink-0 p-3 rounded-lg transition-all duration-200 bg-gold-900/20 hover:bg-gold-900/30 border border-gold-900/50 hover:border-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Start voice recording"
                >
                  <svg
                    className="w-5 h-5 text-gold-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  disabled={disabled}
                  className="flex-shrink-0 p-3 rounded-lg transition-all duration-200 bg-red-500 hover:bg-red-600 animate-pulse disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Stop recording and send"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                  </svg>
                </button>
              )}
            </>
          )}

          <div className="flex-1 relative">
            {(isRecording || errorMessage) && (
              <div className="absolute -top-8 left-0 right-0 flex items-center justify-center">
                {errorMessage ? (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                    <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-yellow-400 font-medium">{errorMessage}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-400 font-medium">Recording...</span>
                  </div>
                )}
              </div>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isRecording
                  ? "Listening... Speak your question..."
                  : "Ask questions about your textbooks... (Enter to send, Shift+Enter for newline)"
              }
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gold-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                minHeight: "52px",
                maxHeight: "200px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-gold-500 disabled:hover:to-gold-600"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {isSupported
            ? "Enter to send • Shift+Enter for newline • Click mic to record"
            : "Enter to send • Shift+Enter for newline"}
        </p>
      </div>
    </div>
  );
}
