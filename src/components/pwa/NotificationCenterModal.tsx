"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  XCircle,
  X,
  Shield,
  FileText,
  AlertOctagon,
  Building2,
  Sparkles,
  WifiOff,
  Wifi,
  ExternalLink,
} from "lucide-react";
import { usePwa } from "./PwaContext";
import {
  notifyVoteRegistered,
  notifyAccountActivated,
  notifyNewProcurementAlert,
  notifyDelayedWorkAlert,
  notifyVoteSuggestion,
} from "@/lib/pwa/notifications";

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenterModal({ isOpen, onClose }: NotificationCenterModalProps) {
  const {
    notificationPermission,
    requestPermission,
    simulatedOffline,
    toggleSimulatedOffline,
  } = usePwa();

  const [preferences, setPreferences] = useState({
    bids: true,
    delayedWorks: true,
    voteSuggestions: true,
    appUpdates: true,
  });

  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  // Carrega preferências do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("farol_notif_prefs");
      if (saved) {
        try {
          setPreferences(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  const handleTogglePref = (key: keyof typeof preferences) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      if (typeof window !== "undefined") {
        localStorage.setItem("farol_notif_prefs", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleRequestPermission = async () => {
    const res = await requestPermission();
    if (res === "granted") {
      setTestFeedback("Permissão concedida! Você receberá alertas nativos.");
    } else if (res === "denied") {
      setTestFeedback("Permissão bloqueada nas configurações do seu navegador.");
    }
  };

  const runTestNotification = (type: "vote" | "bid" | "work" | "suggest") => {
    if (notificationPermission !== "granted") {
      setTestFeedback("Ative a permissão de notificações primeiro para testar.");
      return;
    }

    if (type === "vote") {
      notifyVoteRegistered("CONSÓRCIO ENGEFORM LEMAM", "RECOMENDO");
      setTestFeedback("Notificação nativa de Voto Cívico disparada com sucesso!");
    } else if (type === "bid") {
      notifyNewProcurementAlert(
        "Pregão Eletrônico 90001/2026 • SMS SP",
        "R$ 45.250.000,00"
      );
      setTestFeedback("Notificação de Edital Publicado disparada!");
    } else if (type === "work") {
      notifyDelayedWorkAlert(
        "Construção de CEI no Grajaú (SIURB)",
        8
      );
      setTestFeedback("Notificação de Obra Atrasada disparada!");
    } else if (type === "suggest") {
      notifyVoteSuggestion("CONSTRUTORA QUEIROZ GALVÃO S.A.");
      setTestFeedback("Notificação de Sugestão de Voto disparada!");
    }

    setTimeout(() => setTestFeedback(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Topo do Modal */}
        <div className="px-6 py-5 bg-neutral-950 text-white flex items-center justify-between border-b border-red-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-400">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Central de Alertas & Modo Offline
              </h3>
              <p className="text-xs text-neutral-400">
                Notificações cívicas em tempo real e controle do Farol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal com Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-700">
          {/* Status da Permissão Nativa */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-700" />
                Permissão de Notificações do Dispositivo
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider font-mono ${
                  notificationPermission === "granted"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : notificationPermission === "denied"
                    ? "bg-red-100 text-red-800 border border-red-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                {notificationPermission === "granted"
                  ? "Ativadas"
                  : notificationPermission === "denied"
                  ? "Bloqueadas"
                  : "Pendente"}
              </span>
            </div>

            <p className="text-neutral-600 leading-relaxed">
              Receba avisos instantâneos com vibração e som no seu smartphone ou computador quando novos editais forem abertos e quando seus votos forem registrados.
            </p>

            {notificationPermission !== "granted" ? (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 border border-red-800"
              >
                <BellRing className="w-4 h-4" />
                <span>Ativar Notificações Nativas</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Notificações nativas ativas e integradas ao sistema operacional.</span>
              </div>
            )}

            {testFeedback && (
              <div className="p-2.5 rounded-xl bg-neutral-900 text-amber-300 text-[11px] font-mono animate-in fade-in">
                {testFeedback}
              </div>
            )}
          </div>

          {/* Teste Rápido de Notificações Nativas */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-700" />
              Experimente os Alertas Nativos no seu Dispositivo:
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => runTestNotification("vote")}
                className="p-2.5 rounded-xl bg-white border border-neutral-300 hover:border-red-600 text-left transition-colors hover:shadow-sm"
              >
                <strong className="block text-neutral-900 text-[11px]">🗳️ Voto Registrado</strong>
                <span className="text-[10px] text-neutral-500">Confirmação com hash HMAC</span>
              </button>

              <button
                type="button"
                onClick={() => runTestNotification("bid")}
                className="p-2.5 rounded-xl bg-white border border-neutral-300 hover:border-red-600 text-left transition-colors hover:shadow-sm"
              >
                <strong className="block text-neutral-900 text-[11px]">📢 Edital Publicado</strong>
                <span className="text-[10px] text-neutral-500">Alerta de novo edital PNCP</span>
              </button>

              <button
                type="button"
                onClick={() => runTestNotification("work")}
                className="p-2.5 rounded-xl bg-white border border-neutral-300 hover:border-red-600 text-left transition-colors hover:shadow-sm"
              >
                <strong className="block text-neutral-900 text-[11px]">⚠️ Obra com Atraso</strong>
                <span className="text-[10px] text-neutral-500">Novo aditivo na SIURB</span>
              </button>

              <button
                type="button"
                onClick={() => runTestNotification("suggest")}
                className="p-2.5 rounded-xl bg-white border border-neutral-300 hover:border-red-600 text-left transition-colors hover:shadow-sm"
              >
                <strong className="block text-neutral-900 text-[11px]">💡 Sugestão de Voto</strong>
                <span className="text-[10px] text-neutral-500">Avalie empresa contratada</span>
              </button>
            </div>
          </div>

          {/* Preferências de Alertas Cívicos */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-red-700" />
              Tópicos de Interesse da Cidade de São Paulo:
            </h4>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-red-700" />
                  <div>
                    <strong className="block text-neutral-900">Grandes Licitações e Editais</strong>
                    <span className="text-[10px] text-neutral-500">Editais de grande vulto da Prefeitura no PNCP</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.bids}
                  onChange={() => handleTogglePref("bids")}
                  className="w-4 h-4 text-red-700 rounded focus:ring-red-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className="w-4 h-4 text-amber-700" />
                  <div>
                    <strong className="block text-neutral-900">Obras com Atraso e Reprogramações</strong>
                    <span className="text-[10px] text-neutral-500">Mudanças de cronograma de creches, pontes e hospitais</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.delayedWorks}
                  onChange={() => handleTogglePref("delayedWorks")}
                  className="w-4 h-4 text-red-700 rounded focus:ring-red-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-neutral-800" />
                  <div>
                    <strong className="block text-neutral-900">Convocações para Votação Popular</strong>
                    <span className="text-[10px] text-neutral-500">Convites para opinar sobre fornecedores homologados</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.voteSuggestions}
                  onChange={() => handleTogglePref("voteSuggestions")}
                  className="w-4 h-4 text-red-700 rounded focus:ring-red-600"
                />
              </label>
            </div>
          </div>

          {/* Teste do Modo Offline & Farol Apagado */}
          <div className="p-4 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2 text-amber-400">
                <WifiOff className="w-4 h-4" />
                Simulação de Modo Offline (Farol Apagado)
              </span>
              <button
                type="button"
                onClick={toggleSimulatedOffline}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  simulatedOffline
                    ? "bg-amber-500 text-zinc-950"
                    : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                }`}
              >
                {simulatedOffline ? "Farol Apagado (Ativo)" : "Testar Farol Apagado"}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Ative para testar como o site se comporta sem internet: o logotipo terá os feixes desligados, o topo mostrará a notificação fixa de offline e os votos serão enfileirados no IndexedDB.
            </p>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="px-6 py-4 bg-neutral-100 border-t border-neutral-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-colors shadow-sm"
          >
            Concluir Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
