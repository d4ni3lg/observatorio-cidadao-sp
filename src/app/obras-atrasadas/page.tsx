"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  HardHat,
  Clock,
  MapPin,
  Building2,
  ArrowRight,
  AlertCircle,
  Search,
} from "lucide-react";
import { DEMO_DELAYED_WORKS } from "@/lib/demo-data";
import { getDelayedWorks } from "@/lib/data-provider";
import { formatBRL, formatCompactBRL, formatDateBR } from "@/lib/formatters";
import { DelaySeverityBadge } from "@/components/badges/DelaySeverityBadge";
import { ExecutionDiscrepancyBadge } from "@/components/badges/ExecutionDiscrepancyBadge";

export default function ObrasAtrasadasPage() {
  const delayedWorks = getDelayedWorks();
  const [regionFilter, setRegionFilter] = useState("ALL");
  const [secretariatFilter, setSecretariatFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const regions = useMemo(
    () => Array.from(new Set(delayedWorks.map((w) => w.subprefecture))),
    [delayedWorks]
  );
  const secretariats = useMemo(
    () => Array.from(new Set(delayedWorks.map((w) => w.secretariat))),
    [delayedWorks]
  );

  const filteredWorks = useMemo(() => {
    return delayedWorks.filter((w) => {
      if (regionFilter !== "ALL" && w.subprefecture !== regionFilter) return false;
      if (secretariatFilter !== "ALL" && w.secretariat !== secretariatFilter)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          w.name.toLowerCase().includes(q) ||
          w.companyName.toLowerCase().includes(q) ||
          w.addressLocation.toLowerCase().includes(q) ||
          w.contractNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [regionFilter, secretariatFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Cabeçalho */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold">
          Módulo 9 • Obras Públicas Municipais com Atraso Documentado (07/11/2021 a 07/11/2026)
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Monitoramento de Obras Atrasadas
        </h1>
        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
          Acompanhamento individualizado das obras públicas do Município de São Paulo
          que ultrapassaram suas datas contratuais originais nos últimos cinco anos,
          com base nos registros oficiais do portal <strong>Obras Abertas</strong> e do{" "}
          <strong>TCM-SP</strong>.
        </p>
      </div>

      {/* Nota Metodológica Obrigatória (Regra 9 e Regra 10) */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold block text-sm">
            Distinções Metodológicas Obrigatórias (Regras 9 e 10):
          </strong>
          <p>
            1. <strong>Atraso contratual não é sinônimo automático de abandono de obra:</strong>{" "}
            exibimos separadamente obras em execução com cronograma reprogramado e
            obras oficialmente paralisadas, juntamente com a justificativa oficial
            registrada nos termos aditivos.
          </p>
          <p>
            2. <strong>Valor pago não é sinônimo de execução física:</strong> todas as
            fichas separam o desembolso financeiro liquidado do percentual físico
            efetivamente medido pela engenharia municipal.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Buscar obra, endereço, contrato ou empresa
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex.: Córrego Cocaia, CEU, UPA..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Subprefeitura / Região
          </label>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
          >
            <option value="ALL">Todas as Subprefeituras</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Secretaria Responsável
          </label>
          <select
            value={secretariatFilter}
            onChange={(e) => setSecretariatFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
          >
            <option value="ALL">Todas as Secretarias</option>
            {secretariats.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards detalhados de cada obra */}
      <div className="space-y-6">
        {filteredWorks.map((work) => {
          const budgetDiff =
            work.costs.updatedAmountAfterAmendments - work.costs.initialBudget;
          const budgetDiffPct = (
            (budgetDiff / work.costs.initialBudget) *
            100
          ).toFixed(1);

          return (
            <article
              key={work.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <DelaySeverityBadge delayMonths={work.schedule.delayMonths} />
                    <ExecutionDiscrepancyBadge
                      financialExecutionPct={work.costs.financialExecutionPct}
                      physicalExecutionPct={work.costs.physicalExecutionPct}
                    />
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                      {work.schedule.currentStatus}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      Contrato: {work.contractNumber}
                    </span>
                  </div>

                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    {work.name}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-700" />
                      {work.subprefecture} — {work.addressLocation}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      Empresa: <strong>{work.companyName}</strong> ({work.companyCnpjFormatted})
                    </span>
                  </div>
                </div>

                <Link
                  href={`/obras-atrasadas/${work.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-red-700 transition-colors shrink-0"
                >
                  <span>Abrir página individual e relatar andamento</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Indicadores Visuais de Cronograma e Custos (Seção 9.1 e 9.2) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Deveria concluir em</span>
                  <strong className="font-mono text-base text-rose-800">
                    {work.schedule.expectedCompletionYear} (
                    {formatDateBR(work.schedule.contractualEndDate)})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Conclusão atualizada</span>
                  <strong className="font-mono text-base text-slate-900">
                    {formatDateBR(work.schedule.updatedEndDate)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Orçamento inicial</span>
                  <strong className="font-mono text-base text-slate-900">
                    {formatCompactBRL(work.costs.initialBudget)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">
                    Valor após aditivos (+{budgetDiffPct}%)
                  </span>
                  <strong className="font-mono text-base text-amber-900">
                    {formatCompactBRL(work.costs.updatedAmountAfterAmendments)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Valor Efetivamente Pago</span>
                  <strong className="font-mono text-base text-red-700">
                    {formatCompactBRL(work.costs.paidAmount)} (
                    {work.costs.financialExecutionPct}%)
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Execução Física Medida</span>
                  <strong className="font-mono text-base text-emerald-900">
                    {work.costs.physicalExecutionPct}% (
                    {formatCompactBRL(work.costs.physicalExecutedValue)})
                  </strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <span>
                  Justificativa oficial registrada:{" "}
                  <em className="text-slate-700">
                    {work.schedule.officialJustification}
                  </em>
                </span>
                <span className="font-mono text-[11px] text-amber-800">
                  [DADOS DEMONSTRATIVOS — FASE 1]
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
