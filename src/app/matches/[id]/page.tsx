"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Message { id: string; senderPetId: string; content: string; createdAt: string; read: boolean }
interface Pet { id: string; name: string; breed: string; photoUrl: string; location: string }
interface Match { id: string; pet1: Pet; pet2: Pet; matchedAt: string }

export default function MatchChatPage() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const myPetId = sp.get("myPetId") || (typeof window !== "undefined" ? localStorage.getItem("myPetId") || "" : "");

  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMatch();
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMatch() {
    // Load match info from messages endpoint response headers or infer from petId param
    const res = await fetch(`/api/matches/${id}/messages`);
    if (res.ok) {
      const msgs = await res.json();
      setMessages(msgs);
    }
    // Fetch match details from the matches list
    if (myPetId) {
      const r2 = await fetch(`/api/matches?petId=${myPetId}`);
      if (r2.ok) {
        const all = await r2.json();
        const found = all.find((m: Match) => m.id === id);
        if (found) setMatch(found);
      }
    }
  }

  async function loadMessages() {
    const res = await fetch(`/api/matches/${id}/messages`);
    if (res.ok) setMessages(await res.json());
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !myPetId) return;
    setSending(true);
    setError("");
    const res = await fetch(`/api/matches/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderPetId: myPetId, content: input.trim() }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setInput("");
    } else {
      setError("Failed to send. Try again.");
    }
    setSending(false);
  }

  const other = match ? (match.pet1.id === myPetId ? match.pet2 : match.pet1) : null;
  const me = match ? (match.pet1.id === myPetId ? match.pet1 : match.pet2) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <Link href="/matches" className="text-gray-400 hover:text-gray-600 p-1">←</Link>
        {other ? (
          <>
            <img src={other.photoUrl} alt={other.name} className="w-10 h-10 rounded-full object-cover border-2 border-pink-200" />
            <div>
              <p className="font-bold text-gray-900 text-sm">{other.name}</p>
              <p className="text-xs text-gray-400">{other.breed} · {other.location}</p>
            </div>
          </>
        ) : (
          <p className="font-bold text-gray-900">Match Chat</p>
        )}
      </div>

      {/* Match header */}
      {match && (
        <div className="text-center py-4 text-xs text-gray-400">
          💌 You matched with {other?.name} on {new Date(match.matchedAt).toLocaleDateString("en-EG", { month: "long", day: "numeric" })}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 pb-24">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🐾</div>
            <p className="text-sm">No messages yet. Break the ice!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderPetId === myPetId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                isMe
                  ? "bg-pink-500 text-white rounded-br-sm"
                  : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
              }`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? "text-pink-200" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString("en-EG", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        {!myPetId && (
          <p className="text-xs text-amber-600 mb-2">⚠️ Set your pet ID in <Link href="/matches" className="underline">Matches</Link> to send messages</p>
        )}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${other?.name ?? ""}…`}
            disabled={!myPetId || sending}
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:bg-gray-200 transition-colors disabled:opacity-50"
          />
          <button type="submit" disabled={!input.trim() || !myPetId || sending}
            className="px-4 py-2.5 bg-pink-500 text-white font-bold rounded-xl text-sm hover:bg-pink-600 disabled:opacity-40 transition-colors">
            {sending ? "…" : "→"}
          </button>
        </form>
      </div>
    </div>
  );
}
