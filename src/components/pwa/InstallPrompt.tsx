"use client";

import React, { useState } from "react";
import { Download, X, Smartphone, ShieldCheck } from "lucide-react";
import { usePwa } from "./PwaContext";

export function InstallPrompt() {
  const { canInstall, triggerInstall } = usePwa();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-6 left-4 sm:left-6 z-40 max-w-sm w-full bg-white text-neutral-900 rounded-2xl border border-neutral-300 p-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0 text-red-700">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-900">
              Instalar Farol Cidadão
            </h4>
            <button
              onClick={() => setDismissed(true)}
              className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
              aria-label="Dispensar sugestão de instalação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-neutral-600 leading-snug">
            Adicione o app à sua tela inicial para navegação instantânea, notificações nativas e funcionamento offline.
          </p>
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={triggerInstall}
              className="flex-1 py-1.5 px-3 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="py-1.5 px-2.5 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-100 font-medium text-xs transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
