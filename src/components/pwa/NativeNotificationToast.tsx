"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellRing, X, CheckCircle2, Shield, Sparkles } from "lucide-react";

export interface ActiveCivicNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
}

export function NativeNotificationToast() {
  const [activeNotification, setActiveNotification] = useState<ActiveCivicNotification | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleCivicNotif = (event: any) => {
      const { title, body } = event.detail || {};
      if (title) {
        const id = `toast_${Date.now()}`;
        setActiveNotification({
          id,
          title,
          body: body || "",
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        });

        // Vibração suave no dispositivo se suportado
        if ("vibrate" in navigator) {
          try {
            navigator.vibrate([100, 50, 100]);
          } catch {}
        }
      }
    };

    window.addEventListener("civic_notification", handleCivicNotif);
    return () => {
      window.removeEventListener("civic_notification", handleCivicNotif);
    };
  }, []);

  // Auto-dismiss após 6 segundos
  useEffect(() => {
    if (!activeNotification) return;
    const timer = setTimeout(() => {
      setActiveNotification(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeNotification]);

  if (!activeNotification) return null;

  return (
    <aside
      aria-label="Notificação do Sistema"
      className="fixed top-24 sm:top-24 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-full max-w-md animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className="bg-zinc-950/95 text-white rounded-2xl border-2 border-red-700 p-4 shadow-2xl backdrop-blur-md flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center shrink-0 text-red-400 mt-0.5">
          <BellRing className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 space-y-1 pr-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-white leading-tight">
              {activeNotification.title}
            </h4>
            <span className="text-[10px] text-zinc-400 font-mono shrink-0">
              {activeNotification.timestamp}
            </span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-snug">
            {activeNotification.body}
          </p>
        </div>

        <button
          onClick={() => setActiveNotification(null)}
          className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors shrink-0"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
