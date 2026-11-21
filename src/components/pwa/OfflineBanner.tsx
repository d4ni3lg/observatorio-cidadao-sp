"use client";

import React from "react";
import { WifiOff, RefreshCw, Database, CloudOff, Info } from "lucide-react";
import { usePwa } from "./PwaContext";

export function OfflineBanner() {
  const { isOffline, simulatedOffline, toggleSimulatedOffline, offlineQueueCount } = usePwa();

  if (!isOffline) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-zinc-950 text-white border-b-2 border-amber-500 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Lado Esquerdo: Ícone e Texto Principal */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 animate-pulse">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-bold tracking-wide">
                <span className="text-amber-400 uppercase font-mono text-[11px]">
                  ● Modo Offline Ativo
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-200">Farol da Transparência em Contingência Local</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                Sem sinal de internet. Exibindo dados pré-carregados no dispositivo. Suas ações e votos serão salvos na fila segura do navegador.
              </p>
            </div>
          </div>

          {/* Lado Direito: Ações & Contador da Fila */}
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
            {offlineQueueCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 text-amber-300 border border-amber-500/40 text-[11px] font-mono">
                <Database className="w-3.5 h-3.5" />
                {offlineQueueCount} voto(s) na fila
              </span>
            )}

            {simulatedOffline ? (
              <button
                type="button"
                onClick={toggleSimulatedOffline}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs transition-colors shadow-sm"
              >
                Desativar Simulação
              </button>
            ) : (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reconectar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
