"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Building2,
  Camera,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Scale,
  FileText,
} from "lucide-react";
import { DEMO_DELAYED_WORKS } from "@/lib/demo-data";
import { getDelayedWorks } from "@/lib/data-provider";
import { formatBRL, formatDateBR, formatDateTimeBR } from "@/lib/formatters";
import { WorkFinancialChart } from "@/components/charts/WorkFinancialChart";
import { DelaySeverityBadge } from "@/components/badges/DelaySeverityBadge";
import { ExecutionDiscrepancyBadge } from "@/components/badges/ExecutionDiscrepancyBadge";

export default function ObraDetailPage() {
  const params = useParams<{ id: string }>();
  const delayedWorks = getDelayedWorks();
  const work =
    delayedWorks.find((w) => w.id === params.id) ?? delayedWorks[0];

  // Estado para a Seção 9.3: "Denuncie ou informe problemas nesta obra"
  const [reportCategory, setReportCategory] = useState(
    "Informar paralisação"
  );
  const [reportDescription, setReportDescription] = useState("");
  const [hasPhotoMock, setHasPhotoMock] = useState(false);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const budgetDifference =
    work.costs.updatedAmountAfterAmendments - work.costs.initialBudget;

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim() || !acceptedDisclaimer) return;
    setReportSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex items-center justify-between">
        <Link
          href="/obras-atrasadas"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a listagem de obras atrasadas
        </Link>
        <span className="font-mono text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
          {work.isDemoData ? "[DADOS DEMONSTRATIVOS]" : "[DADOS OFICIAIS SIURB / PMSP]"}
        </span>
      </div>

      {/* 1. IDENTIFICAÇÃO DA OBRA (Seção 9.1) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <DelaySeverityBadge delayMonths={work.schedule.delayMonths} />
            <ExecutionDiscrepancyBadge
              financialExecutionPct={work.costs.financialExecutionPct}
              physicalExecutionPct={work.costs.physicalExecutionPct}
            />
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
              {work.schedule.currentStatus}
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Código Oficial: {work.officialCode}
          </span>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-900">
            {work.secretariat} • {work.subprefecture}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {work.name}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">{work.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Localização / Endereço</span>
            <strong className="text-slate-900 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-blue-800 shrink-0" />
              {work.addressLocation}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Empresa Contratada & CNPJ</span>
            <Link
              href={`/empresas/${work.companyCnpjFormatted.replace(/\D/g, "")}`}
              className="font-bold text-blue-900 hover:underline block mt-0.5"
            >
              {work.companyName} ({work.companyCnpjFormatted})
            </Link>
          </div>
          <div>
            <span className="text-slate-500 block">Número do Contrato</span>
            <strong className="font-mono text-slate-900 text-sm block mt-0.5">
              {work.contractNumber}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Processo Administrativo (SEI)</span>
            <strong className="font-mono text-slate-900 text-sm block mt-0.5">
              {work.adminProcessNumber}
            </strong>
          </div>
        </div>
      </section>

      {/* 2. CRONOGRAMA E ATRASO (Seção 9.1 e 9.2) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
            CRONOGRAMA E CÁLCULO DE ATRASO DOCUMENTADO
          </span>
          <h2 className="font-display text-xl font-bold text-slate-900 mt-2">
            Datas Previstas vs. Datas Reprogramadas
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Início Previsto</span>
            <strong className="font-mono text-sm text-slate-900 mt-1 block">
              {formatDateBR(work.schedule.plannedStartDate)}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Início Efetivo</span>
            <strong className="font-mono text-sm text-slate-900 mt-1 block">
              {formatDateBR(work.schedule.actualStartDate)}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-rose-900 block font-medium">
              Ano Previsto Original
            </span>
            <strong className="font-mono text-lg text-rose-900 mt-1 block">
              {work.schedule.expectedCompletionYear}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-rose-900 block font-medium">
              Data Contratual Original
            </span>
            <strong className="font-mono text-sm text-rose-900 mt-1 block">
              {formatDateBR(work.schedule.contractualEndDate)}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-amber-900 block font-medium">
              Data Atualizada (Aditivos)
            </span>
            <strong className="font-mono text-sm text-amber-950 mt-1 block">
              {formatDateBR(work.schedule.updatedEndDate)}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 text-white">
            <span className="text-slate-300 block">Tempo de Atraso</span>
            <strong className="font-mono text-lg text-amber-400 mt-1 block">
              {work.schedule.delayMonths} meses
            </strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <strong className="text-slate-800 uppercase font-mono block">
            Justificativa Oficial Registrada nos Termos Aditivos:
          </strong>
          <p className="text-slate-700 leading-relaxed">
            {work.schedule.officialJustification ??
              "Justificativa detalhada não disponibilizada na base estruturada."}
          </p>
        </div>
      </section>

      {/* 3. CUSTOS E INDICADORES VISUAIS DE EXECUÇÃO (Seção 9.1 e 9.2 - Regra 10) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
              CUSTOS E INDICADORES VISUAIS (SEPARAÇÃO FÍSICO VS. FINANCEIRO)
            </span>
            <h2 className="font-display text-xl font-bold text-slate-900 mt-2">
              Evolução Orçamentária, Pagamentos e Execução Física
            </h2>
          </div>
          <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-3 py-1 rounded border border-rose-200">
            Diferença Orçamento Inicial → Atualizado: +{formatBRL(budgetDifference)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">1. Orçamento Inicial</span>
            <strong className="font-mono text-sm text-slate-900 mt-1 block">
              {formatBRL(work.costs.initialBudget)}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">2. Valor Contratado</span>
            <strong className="font-mono text-sm text-slate-900 mt-1 block">
              {formatBRL(work.costs.contractedAmount)}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-amber-900 block font-medium">
              3. Atualizado após Aditivos
            </span>
            <strong className="font-mono text-sm text-amber-950 mt-1 block">
              {formatBRL(work.costs.updatedAmountAfterAmendments)}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">4. Valor Empenhado</span>
            <strong className="font-mono text-sm text-slate-900 mt-1 block">
              {formatBRL(work.costs.committedAmount)}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-blue-900 block font-medium">
              5. Valor Pago (Financeiro)
            </span>
            <strong className="font-mono text-sm text-blue-950 mt-1 block">
              {formatBRL(work.costs.paidAmount)}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-900 block font-medium">
              6. Executado Fisicamente
            </span>
            <strong className="font-mono text-sm text-emerald-950 mt-1 block">
              {formatBRL(work.costs.physicalExecutedValue)}
            </strong>
          </div>
        </div>

        {/* Gráfico Recharts Interativo de Balanço Financeiro vs Físico */}
        <WorkFinancialChart
          initialBudget={work.costs.initialBudget}
          updatedAmount={work.costs.updatedAmountAfterAmendments}
          paidAmount={work.costs.paidAmount}
          physicalExecutedAmount={work.costs.physicalExecutedValue}
        />

        {/* Alerta Metodológico de Descompasso Físico vs Financeiro (Regra 10) */}
        {work.costs.financialExecutionPct - (work.costs.physicalExecutionPct ?? 0) > 15 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">
                Alerta de Indicador: Descompasso entre Desembolso Financeiro e Medição Física (+
                {(work.costs.financialExecutionPct - (work.costs.physicalExecutionPct ?? 0)).toFixed(1)} pp)
              </strong>
              <p className="mt-1 leading-relaxed text-amber-900">
                O percentual pago à contratada ({work.costs.financialExecutionPct}%) supera a medição física atestada em engenharia ({work.costs.physicalExecutionPct ?? 0}%).
                Conforme a metodologia de fiscalização cidadã (Regra 10), pagamentos não devem ser equiparados à conclusão física sem medição atestada nos boletins da SIURB.
              </p>
            </div>
          </div>
        )}

        {/* Comparativo Visual de Barras: Execução Financeira vs. Execução Física */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="text-xs font-semibold text-slate-800">
            Comparativo Direto: Percentual Financeiro Pago vs. Percentual Físico Medido
            (Regra 10: Valor pago nunca é tratado como sinônimo de obra concluída)
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-blue-900">
                  Percentual Financeiro Executado (Valor Pago / Valor Atualizado)
                </span>
                <span className="font-mono font-bold text-blue-900">
                  {work.costs.financialExecutionPct}% ({formatBRL(work.costs.paidAmount)})
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="bg-blue-700 h-full rounded-full"
                  style={{ width: `${work.costs.financialExecutionPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-emerald-900">
                  Percentual Físico Executado (Medição de Engenharia Atestada)
                </span>
                <span className="font-mono font-bold text-emerald-900">
                  {work.costs.physicalExecutionPct ?? 0}% (
                  {formatBRL(work.costs.physicalExecutedValue)})
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${work.costs.physicalExecutionPct ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Histórico de Prorrogações / Termos Aditivos e Cronologia */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-slate-900">
              Histórico de Termos Aditivos e Prorrogações ({work.amendments.length})
            </h3>
            {work.amendments.map((ad) => (
              <div
                key={ad.id}
                className="p-4 rounded-xl border border-slate-200 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-mono">
                    {ad.amendmentNumber} — {ad.type}
                  </strong>
                  <span className="font-mono text-slate-500">
                    {formatDateBR(ad.date)}
                  </span>
                </div>
                <div className="flex gap-4 font-mono text-slate-800">
                  <span>Prazo adicional: +{ad.daysAdded} dias</span>
                  <span>
                    Acréscimo de valor:{" "}
                    {ad.valueDelta > 0 ? `+${formatBRL(ad.valueDelta)}` : "R$ 0,00"}
                  </span>
                </div>
                <p className="text-slate-600">Motivo oficial: {ad.justification}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-slate-900">
              Histórico Cronológico Documentado
            </h3>
            <div className="relative pl-5 border-l-2 border-slate-200 space-y-3">
              {work.chronology.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono text-slate-500">
                    <span>{formatDateBR(item.date)}</span>
                    <span>Fonte: {item.sourceName}</span>
                  </div>
                  <div className="font-bold text-slate-900">{item.title}</div>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SEÇÃO 9.3 — "DENUNCIE OU INFORME PROBLEMAS NESTA OBRA"
         ===================================================================== */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4 space-y-2">
          <span className="text-xs font-mono uppercase text-amber-400 font-semibold">
            Seção 9.3 • Fiscalização Cidadã Colaborativa e Moderada
          </span>
          <h2 className="font-display text-2xl font-bold">
            Denuncie ou informe problemas nesta obra
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            Envie relatos sobre paralisação, abandono, ausência de trabalhadores,
            problemas visíveis de qualidade ou divergências entre a realidade no local
            e os dados oficiais. Cada manifestação passa por moderação objetiva antes
            de ser publicada.
          </p>
        </div>

        {/* Aviso Obrigatório e Links para Canais Oficiais (Seção 9.3) */}
        <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500/50 text-xs space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block text-sm mb-0.5">
                Aviso Importante de Natureza Institucional:
              </strong>
              O Observatório Cidadão de São Paulo é uma plataforma independente.{" "}
              <strong>
                O envio de relato ou fotografia a este site não equivale automaticamente
                a uma denúncia formal perante os órgãos públicos de controle.
              </strong>{" "}
              Para protocolo oficial com efeito administrativo/legal, utilize também os
              canais institucionais abaixo:
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="https://portal.tcm.sp.gov.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 hover:text-white font-semibold"
            >
              Ouvidoria / Denúncias TCM-SP
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://transparencia.prefeitura.sp.gov.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 hover:text-white font-semibold"
            >
              Controladoria Geral do Município (CGM-SP)
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.mpsp.mp.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 hover:text-white font-semibold"
            >
              Ministério Público do Estado de SP (MPSP)
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Formulário de Envio de Relato Cidadão */}
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tipo de ocorrência observada no local (Seção 9.3)
              </label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
              >
                <option value="Relatar abandono">Relatar abandono do canteiro</option>
                <option value="Informar paralisação">Informar paralisação</option>
                <option value="Relatar ausência de trabalhadores">
                  Relatar ausência de trabalhadores em horário comercial
                </option>
                <option value="Informar problemas de qualidade">
                  Informar problemas visíveis de qualidade na execução
                </option>
                <option value="Questionar o andamento">Questionar o andamento</option>
                <option value="Informar divergência entre realidade e dados oficiais">
                  Informar possíveis divergências entre a realidade e os dados oficiais
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Evidência fotográfica (Opcional)
              </label>
              <button
                type="button"
                onClick={() => setHasPhotoMock(!hasPhotoMock)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 ${
                  hasPhotoMock
                    ? "bg-emerald-900/50 border-emerald-500 text-emerald-200"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>
                  {hasPhotoMock
                    ? "Fotografia demonstrativa anexada (placa_canteiro_out2026.jpg)"
                    : "Selecionar fotografias do local da obra"}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Descrição objetiva do que foi constatado no local
            </label>
            <textarea
              rows={3}
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Informe data e horário em que passou pelo local, estado do canteiro, placa da obra e situação observada..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500"
            />
          </div>

          <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedDisclaimer}
              onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
              className="mt-0.5 rounded border-slate-600"
            />
            <span>
              Declaro que o relato descreve fatos observados sem acusações pessoais não
              comprovadas e estou ciente de que este envio passa por moderação e não
              substitui denúncia formal junto ao TCM-SP ou Controladoria Geral do
              Município.
            </span>
          </label>

          <button
            type="submit"
            disabled={!reportDescription.trim() || !acceptedDisclaimer}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 disabled:opacity-40"
          >
            Enviar manifestação para fila de moderação (Simulação Fase 1)
          </button>

          {reportSubmitted && (
            <div className="p-3.5 rounded-lg bg-emerald-950 border border-emerald-700 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Relato demonstrativo enviado para a fila de moderação do Painel
                Administrativo.
              </span>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
