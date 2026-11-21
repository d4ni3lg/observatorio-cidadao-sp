"use client";

import React from "react";
import { Sparkles, RefreshCw, X } from "lucide-react";
import { usePwa } from "./PwaContext";

export function UpdateToast() {
  const { updateAvailable, applyUpdate } = usePwa();
  const [dismissed, setDismissed] = React.useState(false);

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-zinc-950 text-white rounded-2xl border border-red-700/60 p-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center shrink-0 text-red-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Nova Versão do App</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900 text-red-200 border border-red-700 font-mono">
                DISPONÍVEL
              </span>
            </h4>
            <button
              onClick={() => setDismissed(true)}
              className="text-zinc-400 hover:text-white p-1 rounded-md"
              aria-label="Dispensar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-zinc-300 leading-snug">
            Uma nova versão do Farol Cidadão com dados atualizados e melhorias foi instalada em segundo plano.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={applyUpdate}
              className="w-full py-2 px-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 border border-red-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Atualizar Aplicativo Agora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
