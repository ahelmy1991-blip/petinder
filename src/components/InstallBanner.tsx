"use client";

import { useEffect, useState } from "react";

type Platform = "android" | "ios" | "desktop" | null;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectPlatform(): Platform {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return "desktop";
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

export default function InstallBanner() {
  const [platform, setPlatform]         = useState<Platform>(null);
  const [deferredPrompt, setDeferred]   = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner]     = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installed, setInstalled]       = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return; // already installed, never show
    if (localStorage.getItem("pwa-dismissed")) return;

    const p = detectPlatform();
    setPlatform(p);

    // Android / desktop Chrome — listen for native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS — show manual instructions banner
    if (p === "ios") {
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem("pwa-dismissed", "1");
  };

  const handleInstall = async () => {
    if (platform === "ios") {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setShowBanner(false);
    }
    setDeferred(null);
  };

  if (!showBanner || installed) return null;

  // iOS step-by-step guide
  if (showIOSGuide) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-pop-in">
        <div className="bg-gray-900 text-white rounded-3xl p-5 max-w-md mx-auto shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <span className="font-black text-lg">Install Petinder</span>
            </div>
            <button onClick={dismiss} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
              <div>
                <p className="font-semibold text-sm">Tap the Share button</p>
                <p className="text-gray-400 text-xs">The box with an arrow at the bottom of Safari</p>
                <span className="text-2xl">⬆️</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
              <div>
                <p className="font-semibold text-sm">Scroll down and tap</p>
                <p className="text-xs text-gray-300 mt-0.5 bg-gray-800 rounded-lg px-3 py-1.5 inline-block">
                  ➕ Add to Home Screen
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
              <div>
                <p className="font-semibold text-sm">Tap <span className="text-brand-400">Add</span> in the top right</p>
                <p className="text-gray-400 text-xs">Petinder will appear on your home screen 🐾</p>
              </div>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="mt-4 w-full py-3 bg-brand-500 text-white font-bold rounded-full text-sm hover:bg-brand-600 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    );
  }

  // Android / desktop banner
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 animate-pop-in">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 max-w-md mx-auto shadow-xl flex items-center gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 512 512" className="w-8 h-8" fill="white">
            <ellipse cx="256" cy="310" rx="88" ry="72"/>
            <ellipse cx="158" cy="220" rx="42" ry="50"/>
            <ellipse cx="210" cy="170" rx="38" ry="46"/>
            <ellipse cx="302" cy="170" rx="38" ry="46"/>
            <ellipse cx="354" cy="220" rx="42" ry="50"/>
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-900 text-sm leading-tight">Install Petinder</p>
          <p className="text-gray-500 text-xs">Add to home screen for the full app experience</p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button onClick={dismiss} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5">
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="text-xs bg-brand-500 text-white font-bold px-4 py-2 rounded-full hover:bg-brand-600 transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
