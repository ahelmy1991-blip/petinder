"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const primary = [
    { href: "/discover",     label: "Discover",   emoji: "🐾" },
    { href: "/matches",      label: "Matches",    emoji: "❤️" },
    { href: "/services",     label: "Services",   emoji: "🛎️" },
  ];

  const more = [
    { href: "/list-pet",     label: "List a Pet",       emoji: "➕" },
    { href: "/dashboard",    label: "Shelter Dashboard", emoji: "🏠" },
    { href: "/merchant",     label: "Merchant Portal",   emoji: "🏪" },
    { href: "/concierge",    label: "AI Concierge",      emoji: "🤖" },
    { href: "/pet-passport", label: "Pet Passport",      emoji: "📋" },
    { href: "/admin",        label: "Admin",             emoji: "🔐" },
  ];

  const isMore = more.some((l) => l.href === path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-xl text-brand-500 hover:text-brand-600 transition-colors"
        >
          <span className="text-2xl">🐾</span>
          <span className="hidden xs:inline">Petinder</span>
        </Link>

        <div className="flex items-center gap-1">
          {primary.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                path === l.href
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="sm:hidden">{l.emoji}</span>
              <span className="hidden sm:inline">{l.emoji} {l.label}</span>
            </Link>
          ))}

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                isMore || open
                  ? "bg-gray-100 text-gray-800"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="sm:hidden">•••</span>
              <span className="hidden sm:inline">More ▾</span>
            </button>

            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <div className="absolute right-0 top-10 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-52 animate-pop-in">
                  {more.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                        path === l.href ? "text-brand-600 font-semibold bg-brand-50" : "text-gray-700"
                      }`}
                    >
                      <span className="text-lg">{l.emoji}</span>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
