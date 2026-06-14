"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocalSession } from "@/hooks/useLocalSession";

interface Provider {
  id: string;
  name: string;
  avatarEmoji: string;
  neighborhood: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  whatsapp: string | null;
}

interface Service {
  id: string;
  category: string;
  title: string;
  description: string;
  priceEGP: number;
  durationMins: number | null;
  atHomeOnly: boolean;
  species: string;
  provider: Provider;
}

interface BookingForm {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  petName: string;
  petSpecies: string;
  notes: string;
  scheduledAt: string;
}

const CATEGORIES = [
  { id: "all",      label: "All",        emoji: "✨" },
  { id: "walks",    label: "Walks",      emoji: "🦮" },
  { id: "sitting",  label: "Sitting",    emoji: "🏠" },
  { id: "vets",     label: "Vets",       emoji: "🩺" },
  { id: "grooming", label: "Grooming",   emoji: "✂️" },
  { id: "hotel",    label: "Pet Hotel",  emoji: "🏨" },
  { id: "taxi",     label: "Pet Taxi",   emoji: "🚗" },
  { id: "emergency",label: "Emergency",  emoji: "🚨" },
];

const NEIGHBORHOODS = [
  "All Areas", "New Cairo", "Maadi", "Zamalek", "Heliopolis",
  "Nasr City", "Mohandiseen", "Dokki", "6th October", "Sheikh Zayed", "Giza",
];

const EMPTY_FORM: BookingForm = {
  clientName: "", clientPhone: "", clientEmail: "",
  petName: "", petSpecies: "dog", notes: "", scheduledAt: "",
};

export default function ServicesPage() {
  const { sessionId } = useLocalSession();
  const [services, setServices]           = useState<Service[]>([]);
  const [loading, setLoading]             = useState(true);
  const [category, setCategory]           = useState("all");
  const [neighborhood, setNeighborhood]   = useState("All Areas");
  const [atHomeOnly, setAtHomeOnly]       = useState(false);
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [form, setForm]                   = useState<BookingForm>(EMPTY_FORM);
  const [submitting, setSubmitting]       = useState(false);
  const [booked, setBooked]               = useState<{ service: Service; whatsapp: string | null } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (category !== "all") p.set("category", category);
    if (neighborhood !== "All Areas") p.set("neighborhood", neighborhood);
    if (atHomeOnly) p.set("atHome", "true");
    fetch(`/api/services?${p}`)
      .then((r) => r.json())
      .then((d) => { setServices(Array.isArray(d) ? d : []); setLoading(false); });
  }, [category, neighborhood, atHomeOnly]);

  useEffect(() => { load(); }, [load]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingService) return;
    setSubmitting(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, serviceId: bookingService.id, sessionId }),
    });
    if (res.ok) {
      setBooked({ service: bookingService, whatsapp: bookingService.provider.whatsapp });
      setBookingService(null);
      setForm(EMPTY_FORM);
    }
    setSubmitting(false);
  };

  const whatsappLink = (provider: Provider, service: Service) => {
    if (!provider.whatsapp) return null;
    const msg = encodeURIComponent(
      `Hi! I found you on Petinder 🐾\nI'd like to book: *${service.title}* (${service.priceEGP} EGP)\nPlease confirm your availability.`
    );
    return `https://wa.me/${provider.whatsapp}?text=${msg}`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Pet Services 🐾</h1>
        <p className="text-gray-500 text-sm mt-1">Book trusted providers across Cairo & Giza</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all ${
              category === c.id
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-brand-300"
            }`}
          >
            <span>{c.emoji}</span> {c.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <select
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          className="text-sm border border-gray-200 rounded-full px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-brand-400"
        >
          {NEIGHBORHOODS.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>

        <button
          onClick={() => setAtHomeOnly(!atHomeOnly)}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all ${
            atHomeOnly
              ? "bg-brand-50 border-brand-400 text-brand-700 font-semibold"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          🏠 At-home visits only
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-6 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-500 font-medium">No services found for these filters.</p>
          <button onClick={() => { setCategory("all"); setNeighborhood("All Areas"); setAtHomeOnly(false); }}
            className="mt-3 text-brand-500 text-sm font-semibold hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((svc) => (
            <ServiceCard
              key={svc.id}
              service={svc}
              onBook={() => { setBookingService(svc); setForm(EMPTY_FORM); }}
              whatsappLink={whatsappLink(svc.provider, svc)}
            />
          ))}
        </div>
      )}

      {/* Booking modal */}
      {bookingService && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setBookingService(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-brand-400 to-pink-500 p-5 text-white">
              <h2 className="text-xl font-black">Book: {bookingService.title}</h2>
              <p className="text-white/80 text-sm mt-0.5">{bookingService.provider.name} · {bookingService.provider.neighborhood}</p>
              <div className="mt-2 inline-flex items-center bg-white/20 rounded-full px-3 py-1 text-sm font-bold">
                {bookingService.priceEGP.toLocaleString()} EGP
              </div>
            </div>

            <form onSubmit={handleBook} className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Your name *</label>
                  <input required value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    placeholder="Ahmed Mohamed"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Phone / WhatsApp *</label>
                  <input required value={form.clientPhone}
                    onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                    placeholder="01x xxxx xxxx"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Pet's name *</label>
                  <input required value={form.petName}
                    onChange={(e) => setForm({ ...form, petName: e.target.value })}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Species</label>
                  <select value={form.petSpecies}
                    onChange={(e) => setForm({ ...form, petSpecies: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white">
                    <option value="dog">Dog 🐶</option>
                    <option value="cat">Cat 🐱</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Date & Time *</label>
                <input required type="datetime-local" value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Notes (optional)</label>
                <textarea value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2} placeholder="Any special instructions, address, pet info…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 resize-none" />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setBookingService(null)}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-full text-sm hover:border-gray-300 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-brand-500 text-white font-bold rounded-full text-sm hover:bg-brand-600 disabled:opacity-50 transition-colors">
                  {submitting ? "Booking…" : "Confirm Booking →"}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400">
                Payment collected on arrival · Cash / Vodafone Cash / InstaPay
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Success modal */}
      {booked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setBooked(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-pop-in"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Booking Requested!</h2>
            <p className="text-gray-500 text-sm mb-6">
              <strong>{booked.service.provider.name}</strong> will confirm via WhatsApp or phone shortly.
            </p>

            {booked.whatsapp && (
              <a
                href={`https://wa.me/${booked.whatsapp}?text=${encodeURIComponent(`Hi! I just booked *${booked.service.title}* via Petinder. Please confirm my booking 🐾`)}`}
                target="_blank" rel="noopener noreferrer"
                className="block w-full py-3 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-colors mb-3"
              >
                💬 Chat on WhatsApp
              </a>
            )}

            <button onClick={() => setBooked(null)}
              className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors">
              Back to Services
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceCard({
  service,
  onBook,
  whatsappLink,
}: {
  service: Service;
  onBook: () => void;
  whatsappLink: string | null;
}) {
  const CATEGORY_EMOJI: Record<string, string> = {
    walks: "🦮", sitting: "🏠", vets: "🩺",
    grooming: "✂️", hotel: "🏨", taxi: "🚗", emergency: "🚨",
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl flex-shrink-0">
          {CATEGORY_EMOJI[service.category] ?? "🐾"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">{service.title}</h3>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-500">{service.provider.name}</span>
                {service.provider.isVerified && (
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">✓ Verified</span>
                )}
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500">📍 {service.provider.neighborhood}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-amber-500 font-semibold">⭐ {service.provider.rating}</span>
                <span className="text-xs text-gray-400">({service.provider.reviewCount})</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
              {service.atHomeOnly && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full">
                  🏠 At-home only
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <div>
          <span className="text-xl font-black text-brand-500">
            {service.priceEGP.toLocaleString()} <span className="text-sm font-semibold text-gray-500">EGP</span>
          </span>
          {service.durationMins && (
            <span className="text-xs text-gray-400 ml-2">· {service.durationMins} min</span>
          )}
        </div>

        <div className="flex gap-2">
          {whatsappLink && (
            <a
              href={whatsappLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 text-gray-600 font-semibold rounded-full text-xs hover:border-gray-300 transition-colors"
            >
              💬 Chat
            </a>
          )}
          <button
            onClick={onBook}
            className="px-4 py-2 bg-brand-500 text-white font-bold rounded-full text-xs hover:bg-brand-600 transition-colors"
          >
            Book now
          </button>
        </div>
      </div>
    </div>
  );
}
