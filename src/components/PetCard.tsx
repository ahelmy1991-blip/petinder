"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import type { Pet, CompatibilityResult } from "@/lib/types";

const SWIPE_THRESHOLD = 80;

function formatAge(m: number) {
  if (m < 12) return `${m}mo`;
  const y = Math.floor(m / 12);
  return `${y}yr${y > 1 ? "s" : ""}`;
}

interface Props {
  pet: Pet;
  compatibility?: CompatibilityResult;
  flyDirection?: "left" | "right" | null;
  isTop?: boolean;
  stackIndex?: number;
  onSwipe?: (dir: "left" | "right") => void;
}

export default function PetCard({ pet, compatibility, flyDirection, isTop = false, stackIndex = 0, onSwipe }: Props) {
  const posRef = useRef({ x: 0, y: 0 });
  const [renderPos, setRenderPos] = useState({ x: 0, y: 0 });
  const [isExiting, setIsExiting]   = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [copied, setCopied]         = useState(false);
  const isDragging   = useRef(false);
  const startPos     = useRef({ x: 0, y: 0 });
  const swiped       = useRef(false);

  const rotation   = renderPos.x / SWIPE_THRESHOLD * 12;
  const likeAlpha  = Math.min(1, Math.max(0,  renderPos.x / SWIPE_THRESHOLD));
  const nopeAlpha  = Math.min(1, Math.max(0, -renderPos.x / SWIPE_THRESHOLD));

  const externalFly = !isExiting && (
    flyDirection === "right" ? "animate-fly-right" :
    flyDirection === "left"  ? "animate-fly-left"  : ""
  );

  const stackClass = stackIndex === 1 ? "card-stack-2" : stackIndex === 2 ? "card-stack-3" : "";

  const triggerExit = useCallback((dir: "left" | "right") => {
    if (swiped.current) return;
    swiped.current    = true;
    isDragging.current = false;
    setIsExiting(true);
    const vx = dir === "right" ? window.innerWidth * 1.5 : -window.innerWidth * 1.5;
    setRenderPos({ x: vx, y: posRef.current.y });
    setTimeout(() => onSwipe?.(dir), 320);
  }, [onSwipe]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!isTop || swiped.current || flyDirection) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
  }, [isTop, flyDirection]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const p = {
      x: e.clientX - startPos.current.x,
      y: (e.clientY - startPos.current.y) * 0.25,
    };
    posRef.current = p;
    setRenderPos(p);
  }, []);

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const { x } = posRef.current;
    if (Math.abs(x) >= SWIPE_THRESHOLD) {
      triggerExit(x > 0 ? "right" : "left");
    } else {
      setIsSnapping(true);
      setRenderPos({ x: 0, y: 0 });
      posRef.current = { x: 0, y: 0 };
      setTimeout(() => setIsSnapping(false), 350);
    }
  }, [triggerExit]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/pets/${pet.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: `Meet ${pet.name}!`, text: `${pet.name} is looking for a home.`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [pet.id, pet.name]);

  const transition =
    externalFly ? undefined :
    isExiting   ? "transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)" :
    isSnapping  ? "transform 0.38s cubic-bezier(0.34,1.56,0.64,1)" : "none";

  return (
    <div
      className={`absolute inset-0 rounded-3xl overflow-hidden select-none shadow-xl
                  ${externalFly} ${stackClass} ${isTop ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={{
        zIndex: 10 - stackIndex,
        transform: externalFly ? undefined : `translateX(${renderPos.x}px) translateY(${renderPos.y}px) rotate(${rotation}deg)`,
        transition,
        willChange: "transform",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* ── PHOTO ── */}
      <div className="absolute inset-0 bg-gray-300">
        <Image
          src={pet.photoUrl}
          alt={pet.name}
          fill
          className="object-cover"
          sizes="(max-width:480px) 100vw,480px"
          priority={isTop}
          draggable={false}
        />
      </div>

      {/* ── GRADIENT ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.1) 70%, transparent 100%)",
        }}
      />

      {/* ── LIKE tint ── */}
      {isTop && likeAlpha > 0.04 && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: `rgba(34,197,94,${likeAlpha * 0.22})` }}>
          <div className="absolute top-10 left-5" style={{ opacity: likeAlpha, transform: `scale(${0.7 + likeAlpha * 0.5}) rotate(-15deg)` }}>
            <span className="block text-3xl font-black text-green-400 border-[3px] border-green-400 rounded-xl px-3 py-1 shadow-lg backdrop-blur-sm">
              LIKE ♥
            </span>
          </div>
        </div>
      )}

      {/* ── NOPE tint ── */}
      {isTop && nopeAlpha > 0.04 && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: `rgba(239,68,68,${nopeAlpha * 0.22})` }}>
          <div className="absolute top-10 right-5" style={{ opacity: nopeAlpha, transform: `scale(${0.7 + nopeAlpha * 0.5}) rotate(15deg)` }}>
            <span className="block text-3xl font-black text-red-400 border-[3px] border-red-400 rounded-xl px-3 py-1 shadow-lg backdrop-blur-sm">
              NOPE ✕
            </span>
          </div>
        </div>
      )}

      {/* ── COMPATIBILITY badge ── */}
      {compatibility && isTop && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
            <span className="text-sm">{compatibility.emoji}</span>
            <span className="text-white text-xs font-bold">{compatibility.score}% match</span>
          </div>
        </div>
      )}

      {/* ── SHARE ── */}
      {isTop && (
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 bg-black/40 backdrop-blur-md rounded-full p-2.5 border border-white/20 text-white hover:bg-black/60 transition-all active:scale-90"
          style={{ pointerEvents: "auto" }}
        >
          {copied
            ? <span className="text-xs font-bold text-green-400 block w-4 h-4 flex items-center justify-center">✓</span>
            : <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
          }
        </button>
      )}

      {/* ── BOTTOM INFO PANEL ── */}
      <div className="absolute bottom-0 left-0 right-0 p-5" style={{ pointerEvents: "auto" }}>
        {/* Name row */}
        <div className="flex items-end justify-between mb-2">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="text-[1.85rem] font-black text-white leading-none tracking-tight">{pet.name}</h2>
            <p className="text-white/60 text-sm mt-0.5 truncate">{pet.breed}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-xl font-bold text-white">{formatAge(pet.ageMonths)}</span>
            <p className="text-white/50 text-xs capitalize">{pet.gender}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="tag-glass">⚡ {pet.energyLevel}</span>
          <span className="tag-glass">{pet.size === "small" ? "🐾" : pet.size === "large" ? "🦮" : "🐕"} {pet.size}</span>
          {pet.goodWithKids && <span className="tag-green">👶 kids ok</span>}
          {pet.goodWithPets && <span className="tag-purple">🐕 pets ok</span>}
          {pet.aiBio && <span className="tag-ai">✨ AI bio</span>}
        </div>

        {/* Bio */}
        <p className="text-white/75 text-sm leading-relaxed line-clamp-2 mb-3">
          {pet.aiBio || pet.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-xs truncate flex-1 pr-2">📍 {pet.location}</span>
          {isTop && (
            <Link
              href={`/pets/${pet.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-white/60 hover:text-white font-semibold transition-colors flex-shrink-0 underline underline-offset-2"
            >
              Full profile →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
