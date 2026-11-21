"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Scale,
  AlertTriangle,
  ArrowRight,
  Search,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { DEMO_COMPANIES } from "@/lib/demo-data";
import { getCompanies } from "@/lib/data-provider";
import { formatBRL, formatCompactBRL } from "@/lib/formatters";

type RankingFilter =
  | "MOST_VOTES"
  | "MOST_RECOMMENDED"
  | "MOST_REJECTED"
  | "HIGHEST_CONTRACT_VOLUME"
  | "MOST_PROCUREMENTS";

export default function EmpresasRankingPage() {
  const companies = getCompanies();
  const [filterBy, setFilterBy] = useState<RankingFilter>("HIGHEST_CONTRACT_VOLUME");
  const [searchCnpjOrName, setSearchCnpjOrName] = useState("");
  const [enforceMinSample, setEnforceMinSample] = useState(true);

  const sortedCompanies = useMemo(() => {
    const filtered = companies.filter((comp) => {
      if (!searchCnpjOrName.trim()) return true;
      const q = searchCnpjOrName.toLowerCase();
      return (
        comp.legalName.toLowerCase().includes(q) ||
        comp.tradeName.toLowerCase().includes(q) ||
        comp.cnpjFormatted.includes(q) ||
        comp.cnpjNormalized.includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      // Proteção contra distorções (Seção 8.3): Empresas com menos de 50 votos não lideram rankings de percentual quando a trava está ativa
      if (
        enforceMinSample &&
        (filterBy === "MOST_RECOMMENDED" || filterBy === "MOST_REJECTED")
      ) {
        if (
          a.votes.meetsMinimumSampleForLeadership !==
          b.votes.meetsMinimumSampleForLeadership
        ) {
          return a.votes.meetsMinimumSampleForLeadership ? -1 : 1;
        }
      }

      switch (filterBy) {
        case "MOST_RECOMMENDED":
          return b.votes.recommendPct - a.votes.recommendPct;
        case "MOST_REJECTED":
          return b.votes.rejectPct - a.votes.rejectPct;
        case "MOST_VOTES":
          return b.votes.totalVotes - a.votes.totalVotes;
        case "HIGHEST_CONTRACT_VOLUME":
          return b.totalContractedAmount - a.totalContractedAmount;
        case "MOST_PROCUREMENTS":
          return b.identifiedProcurementsCount - a.identifiedProcurementsCount;
        default:
          return 0;
      }
    });
  }, [filterBy, searchCnpjOrName, enforceMinSample]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Cabeçalho */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-blue-800 font-semibold">
          Módulo 8 • Ranking Popular e Histórico Contratual de Fornecedores
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Ranking de Percepção Popular das Empresas Participantes
        </h1>
        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
          Consulte as empresas fornecedoras identificadas nas licitações e contratos
          da Prefeitura de São Paulo (vinculadas exclusivamente por CNPJ normalizado
          de 14 dígitos).
        </p>
      </div>

      {/* Aviso Obrigatório de Governança (Seção 8.2, 8.3 e Regra 8) */}
      <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        <div className="flex items-start gap-3">
          <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">
              Percepção Popular ≠ Classificação de Idoneidade
            </strong>
            <span className="text-slate-300">
              Este ranking reflete exclusivamente opiniões voluntárias de cidadãos
              verificados e jamais deve ser interpretado como declaração de
              inidoneidade ou irregularidade jurídica (Regra 8).
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">
              Proteção Contra Distorções (Seção 8.3)
            </strong>
            <span className="text-slate-300">
              Empresas com amostra reduzida (&lt; 50 votos verificados) são
              sinalizadas e não aparecem como líderes definitivas nos filtros de
              recomendação/rejeição.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">
              Direito de Correção Factual e Resposta
            </strong>
            <span className="text-slate-300">
              Representantes empresariais podem solicitar retificação documental e
              publicar manifestação oficial diretamente na página de perfil da empresa.
            </span>
          </div>
        </div>
      </div>

      {/* Controles de Filtro e Classificação (Seção 8.2) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Pesquisar por Razão Social ou CNPJ
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchCnpjOrName}
                onChange={(e) => setSearchCnpjOrName(e.target.value)}
                placeholder="Ex.: 00.111.222/0001-91 ou Paulistana..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Critério de Classificação (Seção 8.2)
            </label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as RankingFilter)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="MOST_VOTES">Maior número de votos verificados</option>
              <option value="MOST_RECOMMENDED">Mais recomendadas (% de aprovação)</option>
              <option value="MOST_REJECTED">Mais rejeitadas (% de rejeição)</option>
              <option value="HIGHEST_CONTRACT_VOLUME">
                Maior volume financeiro de contratos públicos
              </option>
              <option value="MOST_PROCUREMENTS">
                Maior quantidade de participações em licitações
              </option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-2 rounded-lg bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                checked={enforceMinSample}
                onChange={(e) => setEnforceMinSample(e.target.checked)}
                className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
              />
              <span>
                <strong>Trava antidistorção ativa:</strong> exigir mínimo de 50 votos
                para liderança percentual
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Lista do Ranking de Empresas */}
      <div className="space-y-4">
        {sortedCompanies.map((comp, idx) => (
          <article
            key={comp.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                    #{idx + 1} no filtro atual
                  </span>
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                    CNPJ: {comp.cnpjFormatted}
                  </span>
                  <span className="text-xs text-slate-500">
                    Período: {comp.votes.evaluationPeriod}
                  </span>
                  {!comp.votes.meetsMinimumSampleForLeadership && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                      Amostra Inicial ({comp.votes.totalVotes} votos — Abaixo do piso de 50 votos para liderança)
                    </span>
                  )}
                </div>

                <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-800 shrink-0" />
                  <span>{comp.legalName}</span>
                </h2>
                <p className="text-xs text-slate-600">{comp.sector}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href={`/empresas/${comp.cnpjNormalized}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-blue-900 transition-colors"
                >
                  <span>Ver perfil, histórico e votar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Indicadores Obrigatórios de Cada Empresa (Seção 8.1) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-500 block">Licitações identificadas</span>
                <strong className="font-mono text-base text-slate-900">
                  {comp.identifiedProcurementsCount}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Contratos identificados</span>
                <strong className="font-mono text-base text-slate-900">
                  {comp.identifiedContractsCount}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Valores contratados</span>
                <strong className="font-mono text-base text-slate-900">
                  {formatCompactBRL(comp.totalContractedAmount)}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Quantidade de votos</span>
                <strong className="font-mono text-base text-blue-900">
                  {comp.votes.totalVotes} votos
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">% Recomendações</span>
                <strong className="font-mono text-base text-emerald-700">
                  {comp.votes.recommendPct}% ({comp.votes.recommendCount})
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">% Rejeições</span>
                <strong className="font-mono text-base text-rose-700">
                  {comp.votes.rejectPct}% ({comp.votes.rejectCount})
                </strong>
              </div>
            </div>

            {/* Barra de distribuição de percepção popular */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="bg-emerald-600 h-full"
                  style={{ width: `${comp.votes.recommendPct}%` }}
                />
                <div
                  className="bg-slate-400 h-full"
                  style={{ width: `${comp.votes.neutralPct}%` }}
                />
                <div
                  className="bg-rose-600 h-full"
                  style={{ width: `${comp.votes.rejectPct}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                <span>
                  Recomendo: {comp.votes.recommendPct}% • Sem opinião formada:{" "}
                  {comp.votes.neutralPct}% • Não recomendo: {comp.votes.rejectPct}%
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {comp.votes.commentsCount} justificativas moderadas •{" "}
                  {comp.companyOfficialResponse
                    ? "Possui manifestação empresarial publicada"
                    : "Sem manifestação empresarial registrada"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
