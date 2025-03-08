"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, X, MessageSquare, Loader2, Mic, Volume2 } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi there! I'm the Colossus.AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [llmProvider, setLlmProvider] = useState("Loading...");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [supportsSpeech, setSupportsSpeech] = useState(false);
  const recognition = useRef<SpeechRecognition | null>(null);
  const synthesis = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Fetch the current LLM provider when the component mounts
    const fetchLlmProvider = async () => {
      try {
        const response = await fetch("/api/llm-provider");
        if (response.ok) {
          const data = await response.json();
          setLlmProvider(data.provider);
        } else {
          setLlmProvider("Unknown");
        }
      } catch (error) {
        console.error("Error fetching LLM provider:", error);
        setLlmProvider("Unknown");
      }
    };

    fetchLlmProvider();
  }, []);

  useEffect(() => {
    // Check browser speech support
    if (typeof window !== "undefined") {
      setSupportsSpeech(
        "SpeechRecognition" in window || "webkitSpeechRecognition" in window
      );

      // Initialize speech recognition using type-safe approach
      try {
        // Use type assertion with unknown as intermediate step to avoid 'any'
        const SpeechRecognitionConstructor =
          (
            window as unknown as {
              SpeechRecognition: new () => SpeechRecognition;
            }
          ).SpeechRecognition ||
          (
            window as unknown as {
              webkitSpeechRecognition: new () => SpeechRecognition;
            }
          ).webkitSpeechRecognition;

        if (SpeechRecognitionConstructor) {
          const speechRecognition = new SpeechRecognitionConstructor();
          recognition.current = speechRecognition;

          if (recognition.current) {
            recognition.current.continuous = false;
            recognition.current.interimResults = false;

            recognition.current.onresult = (event: SpeechRecognitionEvent) => {
              const transcript = event.results[0][0].transcript;
              setInputValue(transcript);
              setIsRecording(false);
            };

            recognition.current.onerror = () => {
              setIsRecording(false);
            };
          }
        }
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
      }

      // Initialize speech synthesis
      synthesis.current = window.speechSynthesis;
    }
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen]);

  const startRecording = () => {
    if (recognition.current) {
      try {
        recognition.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (recognition.current) {
      try {
        recognition.current.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      } finally {
        setIsRecording(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error. Please try again or contact us at info.colossusai@gmail.com",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-[#FF4A8D] to-[#FF9F4A] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        aria-label="Open chat"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[350px] sm:w-[400px] h-[500px] bg-black border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-lg"
          >
            {/* Chat header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <Image
                    src="/logo.png"
                    alt="Colossus.AI Logo"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-white">ColossusAI Bot</h3>
                  <p className="text-xs text-gray-400">
                    Powered by {llmProvider}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-[#FF4A8D] to-[#FF9F4A] text-white rounded-tr-none"
                        : "bg-gray-800 text-white rounded-tl-none"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-2xl bg-gray-800 text-white rounded-tl-none">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <div className="p-4 border-t border-white/10 bg-black/50">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF4A8D]"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || inputValue.trim() === ""}
                  className="p-2 rounded-full bg-gradient-to-r from-[#FF4A8D] to-[#FF9F4A] text-white disabled:opacity-50 transition-opacity"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 rounded-full transition-all ${
                    isRecording
                      ? "bg-red-500 animate-pulse"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  aria-label={
                    isRecording ? "Stop recording" : "Start recording"
                  }
                  disabled={!supportsSpeech}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Visual Waveform Animation */}
            {isRecording && (
              <div className="flex items-center ml-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-4 bg-red-500 mx-[2px]"
                    animate={{
                      height: [4, 16, 4],
                      transition: {
                        repeat: Infinity,
                        duration: 0.8,
                        delay: i * 0.1,
                      },
                    }}
                  />
                ))}
              </div>
            )}

            {/* Speech Loading State */}
            {synthesis.current?.speaking && (
              <div className="absolute top-2 right-2 flex items-center">
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
