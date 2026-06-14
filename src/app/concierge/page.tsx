"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "What's the best vet in Maadi?",
  "I need a dog walker in New Cairo",
  "How much does grooming cost in Cairo?",
  "Book overnight boarding for my cat",
  "Emergency vet options in Zamalek?",
  "ما هي خدمات رعاية الحيوانات في القاهرة؟",
];

export default function ConciergePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Petinder Concierge 🐾 — Cairo's AI pet care assistant. I can help you find walkers, vets, groomers, sitters, and more across Cairo & Giza. What does your pet need today?",
    },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...history, { role: "assistant", content: "Sorry, I had trouble connecting. Please try again 🙏" }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-pink-500 flex items-center justify-center text-2xl shadow-md">
          🤖
        </div>
        <div>
          <h1 className="font-black text-gray-900 text-lg leading-tight">Pet Concierge</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">AI-powered · Cairo & Giza</span>
          </div>
        </div>
        <Link href="/services" className="ml-auto text-xs text-brand-500 font-semibold hover:underline flex-shrink-0">
          Browse Services →
        </Link>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-pink-500 flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-0.5">
                🐾
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-500 text-white rounded-br-sm"
                  : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-pink-500 flex items-center justify-center text-sm flex-shrink-0 mr-2">
              🐾
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts (show only at start) */}
      {messages.length <= 1 && (
        <div className="flex-shrink-0 mb-3">
          <p className="text-xs text-gray-400 mb-2 font-medium">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="text-xs px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full hover:border-brand-300 hover:text-brand-600 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex gap-2 bg-white rounded-2xl border-2 border-gray-200 p-2 focus-within:border-brand-400 transition-colors"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about walks, vets, grooming in Cairo…"
            disabled={loading}
            className="flex-1 text-sm px-2 focus:outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-brand-600 transition-colors flex-shrink-0"
          >
            ➤
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-2">
          Supports English & العربية · Prices in EGP
        </p>
      </div>
    </div>
  );
}
