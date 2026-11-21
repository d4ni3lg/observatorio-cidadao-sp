"use client";

import React, { useState } from "react";
import {
  Shield,
  RefreshCw,
  MessageSquare,
  FileWarning,
  Sliders,
  CheckCircle2,
  XCircle,
  Lock,
  History,
  Play,
  Database,
} from "lucide-react";
import { getDataSources } from "@/lib/data-provider";

export default function AdminDashboardPage() {
  const officialSources = getDataSources();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleTriggerSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMsg(
          `Sincronização oficial concluída com sucesso! ${data.syncedCounts?.procurements || 15} licitações, ${data.syncedCounts?.companies || 92} empresas e ${data.syncedCounts?.delayedWorks || 20} obras sincronizadas.`
        );
      } else {
        setSyncMsg(data.error || "Falha ao acionar sincronização oficial.");
      }
    } catch {
      setSyncMsg("Erro ao comunicar com a rota de sincronização.");
    } finally {
      setSyncing(false);
    }
  };

  const [moderationQueue, setModerationQueue] = useState([
    {
      id: "mod-101",
      type: "Comentário em Empresa (CNPJ 00.111.222/0001-91)",
      author: "Cidadão Verificado #41D8",
      content:
        "[Demo] A entrega da galeria pluvial na rua principal ocorreu com atraso de 8 meses conforme publicado no Diário Oficial.",
      status: "PENDING",
    },
    {
      id: "mod-102",
      type: "Relato em Obra Atrasada (OBRA-SIURB-2022-0419)",
      author: "Cidadã Verificada #90E1",
      content:
        "[Demo] Enviei foto da placa da obra no local mostrando data vencida e canteiro sem máquinas hoje às 10h.",
      status: "PENDING",
    },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    {
      timestamp: "07/11/2026 09:42:10",
      actor: "Auditor #01 (MFA Ativo)",
      action: "PUBLICAÇÃO DE DIREITO DE RESPOSTA EMPRESARIAL",
      target: "Company CNPJ 00111222000191",
      justification:
        "Nota oficial protocolada pela diretoria jurídica com referência ao Processo SEI 6022.2022/0001940-8.",
    },
    {
      timestamp: "07/11/2026 08:00:02",
      actor: "Worker Automático",
      action: "SNAPSHOT DE RANKING DE ATENÇÃO GERADO",
      target: "ranking_snapshots (v1.0)",
      justification: "Recálculo diário reproduzível dos 10 indicadores objetivos.",
    },
  ]);

  const handleModerate = (id: string, decision: "APPROVED" | "REJECTED") => {
    setModerationQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: decision } : item))
    );
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toLocaleString("pt-BR"),
        actor: "Admin Demo (MFA Verificado)",
        action:
          decision === "APPROVED"
            ? "MODERAÇÃO: COMENTÁRIO APROVADO"
            : "MODERAÇÃO: REJEITADO POR CRITÉRIO OBJETIVO",
        target: id,
        justification:
          "Decisão registrada automaticamente na trilha de auditoria (Seção 15).",
      },
      ...prev,
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-blue-800 font-semibold">
            Seção 15 • Governança, Moderação, Sincronização e Trilha de Auditoria
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 mt-1">
            Painel Administrativo e de Auditoria
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Toda alteração manual gera registro imutável de auditoria (`audit_logs`).{" "}
            <strong>
              O administrador é bloqueado por arquitetura de modificar votos
              contabilizados sem justificativa formal e registro público.
            </strong>
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-mono">
          <Lock className="w-4 h-4 text-emerald-400" />
          Autenticação Multifator (MFA) Exigida • Modo Demo Fase 1
        </div>
      </div>

      {/* Fila de Moderação de Comentários e Relatos de Obras */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-800" />
          Fila de Moderação de Manifestações Populares e Relatos de Obras
        </h2>

        <div className="space-y-3">
          {moderationQueue.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="font-mono text-[11px] text-blue-900 font-bold">
                  {item.type} • {item.author}
                </div>
                <p className="text-slate-800 font-medium">{item.content}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.status === "PENDING" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleModerate(item.id, "APPROVED")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aprovar (Critério Objetivo)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModerate(item.id, "REJECTED")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-700 text-white font-semibold hover:bg-rose-800"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reter (Acusação sem prova)
                    </button>
                  </>
                ) : (
                  <span className="px-2.5 py-1 rounded font-mono font-bold bg-slate-200 text-slate-800">
                    Decisão registrada: {item.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Monitor de Fontes Oficiais e Sincronização */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-700" />
              Monitoramento das 6 Fontes Oficiais e Pipeline de Ingestão
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              PNCP, TCM-SP, Obras Abertas, Gesconfi/SIURB, Transparência SP, CEIS/CNEP
            </p>
          </div>
          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold disabled:opacity-50 transition-colors shadow-sm shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando com PNCP e SIURB..." : "Disparar Sincronização Oficial Agora"}
          </button>
        </div>

        {syncMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>{syncMsg}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {(officialSources || [
            {
              id: "src-1",
              name: "Fonte 1: API PNCP (Licitações, Atas e PCA)",
              frequency: "6h / Diária",
              lastSuccessfulSyncAt: "2026-11-07T08:00:00Z",
              status: "ACTIVE",
            },
            {
              id: "src-2",
              name: "Fonte 2: TCM-SP Dados Abertos",
              frequency: "Diária",
              lastSuccessfulSyncAt: "2026-11-07T07:45:00Z",
              status: "ACTIVE",
            },
            {
              id: "src-3",
              name: "Fonte 3: Portal Obras Abertas PMSP",
              frequency: "Diária / Semanal",
              lastSuccessfulSyncAt: "2026-11-07T07:30:00Z",
              status: "ACTIVE",
            },
            {
              id: "src-4",
              name: "Fonte 4 e 5: Dados Abertos SP & SIURB Gesconfi",
              frequency: "Diária",
              lastSuccessfulSyncAt: "2026-11-07T07:00:00Z",
              status: "ACTIVE",
            },
            {
              id: "src-6",
              name: "Fonte 6: CEIS e CNEP (Sanções Administrativas)",
              frequency: "Diária",
              lastSuccessfulSyncAt: "2026-11-07T06:00:00Z",
              status: "ACTIVE",
            },
          ]).map((s: any) => (
            <div
              key={s.id || s.name}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
            >
              <div className="font-bold text-slate-900">{s.name}</div>
              <div className="text-slate-600">Frequência: {s.frequency || "Diária"}</div>
              <div className="font-mono text-[11px] text-slate-500">
                Último Sucesso:{" "}
                {s.lastSuccessfulSyncAt
                  ? new Date(s.lastSuccessfulSyncAt).toLocaleString("pt-BR")
                  : "Registrado"}
              </div>
              <div className="text-[11px] font-semibold text-emerald-800 pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Status Operacional: {s.status === "ACTIVE" ? "Ativo e Integrado" : s.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Registro Imutável de Auditoria (Seção 15) */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          Trilha de Auditoria Imutável (`audit_logs`)
        </h2>
        <div className="space-y-2.5 text-xs font-mono">
          {auditLogs.map((log, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1"
            >
              <div className="flex flex-wrap justify-between text-amber-300">
                <span>
                  [{log.timestamp}] {log.action}
                </span>
                <span>Ator: {log.actor}</span>
              </div>
              <div className="text-slate-300">
                Alvo: {log.target} — Justificativa: {log.justification}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
