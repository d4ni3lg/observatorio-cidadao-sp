"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, Home, FileText, Building2, AlertOctagon, UserCheck } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export default function OfflineFallbackPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center space-y-6">
        {/* Farol Apagado em Destaque */}
        <div className="flex justify-center">
          <Logo size="lg" offline={true} />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-900 text-amber-300 border border-zinc-700 font-mono">
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            MODO OFFLINE ATIVO
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-neutral-900">
            Farol Apagado • Sem Conexão
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
            Seu dispositivo está sem sinal de internet no momento. O Farol Cidadão preservou os dados principais para que você continue fiscalizando os gastos públicos da cidade.
          </p>
        </div>

        {/* Módulos Disponíveis em Cache */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-md text-left space-y-4">
          <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>Módulos Pré-Carregados no seu Dispositivo:</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <Link
              href="/"
              className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 flex items-center gap-2.5 transition-colors"
            >
              <Home className="w-4 h-4 text-red-700 shrink-0" />
              <div>
                <strong className="block text-neutral-900">Página Inicial</strong>
                <span className="text-[10px] text-neutral-500">Indicadores gerais de SP</span>
              </div>
            </Link>

            <Link
              href="/licitacoes"
              className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 flex items-center gap-2.5 transition-colors"
            >
              <FileText className="w-4 h-4 text-red-700 shrink-0" />
              <div>
                <strong className="block text-neutral-900">Licitações & PCA</strong>
                <span className="text-[10px] text-neutral-500">Editais já salvos</span>
              </div>
            </Link>

            <Link
              href="/empresas"
              className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 flex items-center gap-2.5 transition-colors"
            >
              <Building2 className="w-4 h-4 text-red-700 shrink-0" />
              <div>
                <strong className="block text-neutral-900">Ranking Empresas</strong>
                <span className="text-[10px] text-neutral-500">92 fornecedores em cache</span>
              </div>
            </Link>

            <Link
              href="/obras-atrasadas"
              className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 flex items-center gap-2.5 transition-colors"
            >
              <AlertOctagon className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <strong className="block text-neutral-900">Obras Atrasadas</strong>
                <span className="text-[10px] text-neutral-500">20 obras documentadas</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Botão de Tentar Novamente */}
        <div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 border border-red-800"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Reconectar à Internet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
