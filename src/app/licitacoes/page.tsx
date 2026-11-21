"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Calendar,
  Users,
  ArrowRight,
  ThumbsUp,
  Info,
  FileCheck2,
  ClipboardList,
  Lock,
} from "lucide-react";
import { DEMO_PROCUREMENTS } from "@/lib/demo-data";
import { getProcurements } from "@/lib/data-provider";
import { formatBRL, formatDateBR } from "@/lib/formatters";
import { RecordType } from "@/lib/types/observatory";

type SortOption =
  | "NEAREST_DATE"
  | "HIGHEST_VALUE"
  | "LOWEST_VALUE"
  | "MOST_PARTICIPANTS"
  | "MOST_VOTED";

export default function LicitacoesPage() {
  const allProcurements = getProcurements();

  // Separação rigorosa entre Licitações Publicadas e Planejamento PCA (Seção 2.1)
  const [activeTab, setActiveTab] = useState<RecordType>("PUBLISHED_BID");

  // Filtros obrigatórios da Seção 6.1
  const [keyword, setKeyword] = useState("");
  const [selectedSecretariat, setSelectedSecretariat] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedModality, setSelectedModality] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [participantFilter, setParticipantFilter] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("NEAREST_DATE");

  const secretariats = useMemo(
    () => Array.from(new Set(allProcurements.map((p) => p.secretariat))),
    [allProcurements]
  );
  const categories = useMemo(
    () => Array.from(new Set(allProcurements.map((p) => p.category))),
    [allProcurements]
  );
  const modalities = useMemo(
    () => Array.from(new Set(allProcurements.map((p) => p.modality))),
    [allProcurements]
  );
  const regions = useMemo(
    () => Array.from(new Set(allProcurements.map((p) => p.region))),
    [allProcurements]
  );

  const filteredList = useMemo(() => {
    return allProcurements.filter((item) => {
      // 1. Aba de separação entre Licitações Publicadas e Planejamento PCA
      if (item.recordType !== activeTab) return false;

      // 2. Palavra-chave
      if (keyword.trim()) {
        const q = keyword.toLowerCase();
        const match =
          item.simplifiedTitle.toLowerCase().includes(q) ||
          item.originalObject.toLowerCase().includes(q) ||
          item.processNumber.toLowerCase().includes(q) ||
          item.pncpNumber.toLowerCase().includes(q);
        if (!match) return false;
      }

      // 3. Secretaria, Categoria, Modalidade, Situação, Região
      if (selectedSecretariat !== "ALL" && item.secretariat !== selectedSecretariat) {
        return false;
      }
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }
      if (selectedModality !== "ALL" && item.modality !== selectedModality) {
        return false;
      }
      if (selectedStatus !== "ALL" && item.status !== selectedStatus) {
        return false;
      }
      if (selectedRegion !== "ALL" && item.region !== selectedRegion) {
        return false;
      }

      // 4. Empresa participante (Nome ou CNPJ)
      if (participantFilter.trim()) {
        const pq = participantFilter.toLowerCase();
        const hasCompany = item.participants.some(
          (part) =>
            part.companyName.toLowerCase().includes(pq) ||
            part.cnpjFormatted.includes(pq) ||
            part.cnpjNormalized.includes(pq)
        );
        if (!hasCompany) return false;
      }

      // 5. Valor mínimo e máximo (considerando valor estimado quando público)
      const val = item.costs.estimatedValue;
      if (minValue !== "" && !Number.isNaN(Number(minValue))) {
        if (val === null || val < Number(minValue)) return false;
      }
      if (maxValue !== "" && !Number.isNaN(Number(maxValue))) {
        if (val === null || val > Number(maxValue)) return false;
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case "NEAREST_DATE":
          return (
            new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
          );
        case "HIGHEST_VALUE":
          return (b.costs.estimatedValue ?? -1) - (a.costs.estimatedValue ?? -1);
        case "LOWEST_VALUE":
          return (
            (a.costs.estimatedValue ?? Number.MAX_SAFE_INTEGER) -
            (b.costs.estimatedValue ?? Number.MAX_SAFE_INTEGER)
          );
        case "MOST_PARTICIPANTS":
          return (b.participantsCount ?? 0) - (a.participantsCount ?? 0);
        case "MOST_VOTED":
          return b.voteStats.totalVotes - a.voteStats.totalVotes;
        default:
          return 0;
      }
    });
  }, [
    activeTab,
    keyword,
    selectedSecretariat,
    selectedCategory,
    selectedModality,
    selectedStatus,
    selectedRegion,
    participantFilter,
    minValue,
    maxValue,
    sortBy,
  ]);

  const publishedCount = allProcurements.filter(
    (p) => p.recordType === "PUBLISHED_BID"
  ).length;
  const pcaCount = allProcurements.filter(
    (p) => p.recordType === "PCA_PLANNING"
  ).length;

  const resetFilters = () => {
    setKeyword("");
    setSelectedSecretariat("ALL");
    setSelectedCategory("ALL");
    setSelectedModality("ALL");
    setSelectedStatus("ALL");
    setSelectedRegion("ALL");
    setParticipantFilter("");
    setMinValue("");
    setMaxValue("");
    setSortBy("NEAREST_DATE");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Cabeçalho da Página */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-blue-800 font-semibold">
          Módulo 6 • Contratações Públicas Municipais (Recorte 07/11/2026 a 30/06/2027)
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Licitações e Planejamento de Contratações
        </h1>
        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
          Consulte editais abertos, sessões agendadas, valores estimados, empresas
          participantes e documentos oficiais do PNCP. Conforme a Seção 2.1, as
          contratações previstas nos <strong>Planos de Contratações Anuais (PCA)</strong>{" "}
          são apresentadas em uma seção separada para nunca serem confundidas com
          pregões já publicados.
        </p>
      </div>

      {/* Seletor de Abas Separadas: Licitações Publicadas vs. Planejamento PCA (Seção 2.1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("PUBLISHED_BID")}
          className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
            activeTab === "PUBLISHED_BID"
              ? "bg-slate-900 text-white border-slate-900 shadow-md"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <FileCheck2
            className={`w-6 h-6 shrink-0 mt-0.5 ${
              activeTab === "PUBLISHED_BID" ? "text-emerald-400" : "text-blue-800"
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base">
                1. Licitações Efetivamente Publicadas
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                  activeTab === "PUBLISHED_BID"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {publishedCount} editais
              </span>
            </div>
            <p
              className={`text-xs mt-1 ${
                activeTab === "PUBLISHED_BID" ? "text-slate-300" : "text-slate-500"
              }`}
            >
              Pregões e concorrências com edital publicado no PNCP, recebimento de
              propostas aberto ou sessão pública agendada.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PCA_PLANNING")}
          className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
            activeTab === "PCA_PLANNING"
              ? "bg-amber-950 text-white border-amber-900 shadow-md"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <ClipboardList
            className={`w-6 h-6 shrink-0 mt-0.5 ${
              activeTab === "PCA_PLANNING" ? "text-amber-400" : "text-amber-700"
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base">
                2. Seção Separada: Planejamento Anual (PCA 2026/2027)
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                  activeTab === "PCA_PLANNING"
                    ? "bg-amber-400/20 text-amber-200"
                    : "bg-amber-50 text-amber-900"
                }`}
              >
                {pcaCount} intenções
              </span>
            </div>
            <p
              className={`text-xs mt-1 ${
                activeTab === "PCA_PLANNING" ? "text-amber-100/90" : "text-slate-500"
              }`}
            >
              Contratações apenas previstas nos Planos de Contratações Anuais para o
              restante de 2026 e jan–jun/2027 (ainda sem edital publicado).
            </p>
          </div>
        </button>
      </div>

      {/* Painel de Filtros e Ordenação (Seção 6.1) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Filter className="w-4 h-4 text-blue-800" />
            <span>Filtros de Pesquisa e Ordenação</span>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-medium text-blue-800 hover:underline"
          >
            Limpar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Palavra-chave */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Pesquisa por palavras-chave, número do processo ou código PNCP
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Ex.: macrodrenagem, glicemia, escolas, 6022.2026..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>

          {/* Secretaria */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Secretaria responsável
            </label>
            <select
              value={selectedSecretariat}
              onChange={(e) => setSelectedSecretariat(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="ALL">Todas as Secretarias</option>
              {secretariats.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="ALL">Todas as Categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Modalidade */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Modalidade
            </label>
            <select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="ALL">Todas as Modalidades</option>
              {modalities.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>

          {/* Situação */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Situação da contratação
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="ALL">Todas as Situações</option>
              <option value="RECEIVING_PROPOSALS">Recebimento de Propostas Aberto</option>
              <option value="SCHEDULED_SESSION">Sessão Pública Agendada</option>
              <option value="PUBLISHED_UPCOMING">Publicada — Sessão Futura</option>
              <option value="PCA_PLANNED">Planejamento (PCA)</option>
            </select>
          </div>

          {/* Região */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Região / Subprefeitura
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="ALL">Todas as Regiões</option>
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          {/* Empresa participante */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Empresa participante (Nome ou CNPJ)
            </label>
            <input
              type="text"
              value={participantFilter}
              onChange={(e) => setParticipantFilter(e.target.value)}
              placeholder="Ex.: Paulistana, TecnoMed ou CNPJ"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {/* Valor Mínimo */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Valor estimado mínimo (R$)
            </label>
            <input
              type="number"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              placeholder="Ex.: 10000000"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {/* Valor Máximo */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Valor estimado máximo (R$)
            </label>
            <input
              type="number"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              placeholder="Ex.: 100000000"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {/* Ordenação (5 opções obrigatórias da Seção 6.1) */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Ordenar resultados por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="NEAREST_DATE">Data da sessão mais próxima (Padrão)</option>
              <option value="HIGHEST_VALUE">Maior valor estimado</option>
              <option value="LOWEST_VALUE">Menor valor estimado</option>
              <option value="MOST_PARTICIPANTS">Maior número de empresas participantes</option>
              <option value="MOST_VOTED">Mais votadas pelos cidadãos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aviso quando na aba de Planejamento PCA */}
      {activeTab === "PCA_PLANNING" && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-sm mb-0.5">
              Atenção: Você está visualizando a seção de Planejamento (Plano de Contratações Anual — PCA)
            </strong>
            Estes itens representam intenções de compra futuras previstas pela
            Administração para o restante de 2026 e primeiro semestre de 2027. Eles{" "}
            <strong>não são licitações já publicadas</strong> e ainda não possuem
            edital de abertura ou disputa de lances.
          </div>
        </div>
      )}

      {/* Listagem de Resultados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>
            Exibindo <strong>{filteredList.length}</strong>{" "}
            {activeTab === "PUBLISHED_BID"
              ? "licitações efetivamente publicadas"
              : "itens de planejamento (PCA)"}
          </span>
          <span className="font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            [BASE OFICIAL INTEGRADA • PNCP & PMSP]
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
            <p className="text-base font-semibold text-slate-800">
              Nenhum registro encontrado com os filtros selecionados.
            </p>
            <p className="text-xs text-slate-500">
              Ajuste os filtros ou alterne entre as abas de Licitações Publicadas e
              Planejamento (PCA).
            </p>
          </div>
        ) : (
          filteredList.map((lic) => (
            <article
              key={lic.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        lic.recordType === "PCA_PLANNING"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {lic.statusLabel}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Processo: {lic.processNumber}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-medium text-slate-600">
                      {lic.modality}
                    </span>
                  </div>

                  <div className="text-xs font-semibold uppercase tracking-wide text-blue-900">
                    {lic.secretariat} • {lic.region}
                  </div>

                  <h2 className="font-display text-xl font-bold text-slate-900">
                    {lic.simplifiedTitle}
                  </h2>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {lic.originalObject}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-blue-800" />
                      {lic.recordType === "PCA_PLANNING"
                        ? `Janela prevista: ${lic.plannedWindow}`
                        : `Data da sessão: ${formatDateBR(lic.sessionDate)}`}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {lic.participantsCount !== null
                        ? `${lic.participantsCount} empresas participantes`
                        : "Participantes ainda não abertos"}
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-700" />
                      {lic.voteStats.totalVotes} manifestações cidadãs
                    </span>
                  </div>
                </div>

                {/* Coluna Direita: Valor Monetário em Evidência e Botão de Detalhes */}
                <div className="lg:w-72 shrink-0 flex flex-col justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4">
                  <div>
                    <div className="text-[11px] font-mono uppercase text-slate-500">
                      {lic.recordType === "PCA_PLANNING"
                        ? "Estimativa Preliminar no PCA"
                        : "Orçamento Estimado Oficial"}
                    </div>
                    {lic.costs.isBudgetConfidential ? (
                      <div className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-900 bg-amber-50/90 p-2 rounded border border-amber-200">
                        <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                        <span>
                          Orçamento sob sigilo legal temporário (Art. 24, Lei 14.133/2021)
                        </span>
                      </div>
                    ) : (
                      <div className="font-mono text-2xl font-bold text-slate-900 mt-1">
                        {formatBRL(lic.costs.estimatedValue)}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/licitacoes/${lic.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-blue-900 transition-colors"
                  >
                    <span>Abrir página da contratação</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
