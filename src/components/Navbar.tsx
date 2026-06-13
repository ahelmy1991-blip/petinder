"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();

  const links = [
    { href: "/discover", label: "Discover", emoji: "🐾" },
    { href: "/matches",  label: "Matches",  emoji: "❤️" },
    { href: "/list-pet", label: "List a Pet", emoji: "➕" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-xl text-brand-500 hover:text-brand-600 transition-colors">
          <span className="text-2xl">🐾</span>
          Petinder
        </Link>

        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                path === l.href
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="hidden sm:inline">{l.emoji} </span>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
