"use client";

import { useEffect, useState } from "react";
import type { UserPreferences } from "@/lib/types";

const SESSION_KEY = "petinder_session_id";
const PREFS_KEY = "petinder_prefs";

export function useLocalSession() {
  const [sessionId, setSessionId] = useState<string>("");
  const [preferences, setPreferencesState] = useState<UserPreferences | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    setSessionId(id);

    const saved = localStorage.getItem(PREFS_KEY);
    if (saved) {
      try {
        setPreferencesState(JSON.parse(saved));
      } catch {
        // ignore corrupt storage
      }
    }
  }, []);

  const setPreferences = (prefs: UserPreferences) => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setPreferencesState(prefs);
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(PREFS_KEY);
    window.location.reload();
  };

  return { sessionId, preferences, setPreferences, clearSession };
}
