"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  FileText,
  ExternalLink,
  TrendingDown,
  ShieldCheck,
  Share2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Lock,
  Building2,
  Clock,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  BookOpen,
  UserCheck,
} from "lucide-react";
import { DEMO_PROCUREMENTS } from "@/lib/demo-data";
import { getProcurements } from "@/lib/data-provider";
import { formatBRL, formatDateBR, formatDateTimeBR } from "@/lib/formatters";
import { BidTimelineChart } from "@/components/charts/BidTimelineChart";
import {
  getClientCitizenSession,
  StoredCitizenSession,
} from "@/lib/citizen-auth/client-session";
import { notifyVoteRegistered } from "@/lib/pwa/notifications";
import { enqueueOfflineAction } from "@/lib/pwa/offline-queue";

export default function LicitacaoDetailPage() {
  const params = useParams<{ id: string }>();
  const procurements = getProcurements();
  const procurement =
    procurements.find((p) => p.id === params.id) ?? procurements[0];

  // Sessão Cidadã e Estado de Votação (Seção 7.3 e Seção 8 - LGPD)
  const [citizenSession, setCitizenSession] = useState<StoredCitizenSession | null>(null);
  const [selectedVote, setSelectedVote] = useState<
    "SUPPORT" | "OPPOSE" | "NEEDS_CLARIFICATION" | null
  >(null);
  const [justification, setJustification] = useState("");
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteFeedback, setVoteFeedback] = useState<string | null>(null);
  const [showShareReport, setShowShareReport] = useState(false);

  const [voteStats, setVoteStats] = useState(procurement.voteStats);
  const [publicJustifications, setPublicJustifications] = useState<any[]>([]);

  useEffect(() => {
    const session = getClientCitizenSession();
    if (session) {
      setCitizenSession(session);
    }

    // Carrega estatísticas atualizadas da API
    fetch(`/api/vote/procurement?procurementId=${encodeURIComponent(procurement.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.totalVotes !== undefined) {
          setVoteStats({
            totalVotes: data.totalVotes,
            supportCount: data.supportCount,
            opposeCount: data.opposeCount,
            needsClarificationCount: data.needsClarificationCount,
            commentsCount: data.publicJustifications?.length || 0,
            lastUpdatedAt: new Date().toISOString(),
          });
          if (data.publicJustifications) {
            setPublicJustifications(data.publicJustifications);
          }
        }
      })
      .catch((err) => console.error("Erro ao carregar votos da licitação:", err));
  }, [procurement.id]);

  const totalVotes = voteStats.totalVotes;
  const supportCount = voteStats.supportCount;
  const opposeCount = voteStats.opposeCount;
  const clarifyCount = voteStats.needsClarificationCount;

  const supportPct = totalVotes > 0 ? ((supportCount / totalVotes) * 100).toFixed(1) : "0.0";
  const opposePct = totalVotes > 0 ? ((opposeCount / totalVotes) * 100).toFixed(1) : "0.0";
  const clarifyPct = totalVotes > 0 ? ((clarifyCount / totalVotes) * 100).toFixed(1) : "0.0";

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVote) return;

    if (!citizenSession) {
      setVoteFeedback("Você precisa verificar seu CPF na área 'Conta' antes de votar (Regra de Unicidade 1 CPF = 1 Voto).");
      return;
    }

    setVoteLoading(true);
    setVoteFeedback(null);

    try {
      const res = await fetch("/api/vote/procurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizenToken: citizenSession.citizenToken,
          procurementId: procurement.id,
          voteType: selectedVote,
          justification,
          _hp: "",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setVoteSubmitted(true);
        setVoteFeedback(data.message);
        notifyVoteRegistered(
          procurement.simplifiedTitle,
          selectedVote === "SUPPORT" ? "Apoio" : selectedVote === "OPPOSE" ? "Não Apoio" : "Necessita Esclarecimento"
        );
        if (data.stats) {
          setVoteStats({
            totalVotes: data.stats.totalVotes,
            supportCount: data.stats.supportCount,
            opposeCount: data.stats.opposeCount,
            needsClarificationCount: data.stats.needsClarificationCount,
            commentsCount: data.stats.publicJustifications?.length || 0,
            lastUpdatedAt: new Date().toISOString(),
          });
          setPublicJustifications(data.stats.publicJustifications || []);
        }
      } else {
        setVoteFeedback(data.error || "Erro ao registrar voto.");
      }
    } catch {
      // Fallback em caso de indisponibilidade de rede (Modo Offline PWA)
      try {
        await enqueueOfflineAction({
          type: "VOTE_PROCUREMENT",
          payload: {
            citizenToken: citizenSession.citizenToken,
            procurementId: procurement.id,
            voteType: selectedVote,
            justification,
          },
        });
        setVoteSubmitted(true);
        setVoteFeedback("Modo Offline: Seu voto foi armazenado no dispositivo e será sincronizado quando a conexão retornar.");
        notifyVoteRegistered(procurement.simplifiedTitle, "Voto Salvo Offline");
      } catch {
        setVoteFeedback("Erro de conexão ao salvar voto.");
      }
    } finally {
      setVoteLoading(false);
    }
  };

  const handleWhatsAppShare = () => {
    const summaryText = `📊 *Relatório Cidadão — Observatório Cidadão de SP*\n\n*Contratação:* ${procurement.simplifiedTitle}\n*Secretaria:* ${procurement.secretariat}\n*Processo:* ${procurement.processNumber}\n*Valor Estimado:* ${
      procurement.costs.isBudgetConfidential
        ? "Sob sigilo legal temporário (Lei 14.133, art. 24)"
        : formatBRL(procurement.costs.estimatedValue)
    }\n*Sessão:* ${formatDateBR(procurement.sessionDate)}\n*Participação Popular:* ${totalVotes} manifestações verificadas (${supportPct}% apoiam | ${clarifyPct}% pedem esclarecimentos)\n*Fonte Oficial:* ${procurement.sourceName} (${procurement.sourceUrl})`;
    const url = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Barra superior de retorno e ações de compartilhamento (Seção 16) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/licitacoes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a listagem de licitações
        </Link>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            type="button"
            onClick={() => setShowShareReport(!showShareReport)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Share2 className="w-3.5 h-3.5 text-red-700" />
            Gerar Relatório Compartilhável
          </button>
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
          >
            Compartilhar no WhatsApp
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* Modal/Card de Relatório Resumido Compartilhável (Seção 16) */}
      {showShareReport && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-700 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-amber-400">
                Seção 16 • Relatório Público Pronto para Compartilhamento
              </span>
              <h2 className="font-display text-lg font-bold">
                Ficha Síntese Cidadã — {procurement.processNumber}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowShareReport(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Fechar [X]
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700">
              <div className="text-slate-400">Objeto Simplificado</div>
              <div className="font-semibold text-white mt-1">
                {procurement.simplifiedTitle}
              </div>
              <div className="text-slate-400 mt-2">
                Secretaria: {procurement.secretariat}
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700">
              <div className="text-slate-400">Valores Oficiais Separados</div>
              <div className="font-mono text-base font-bold text-emerald-300 mt-1">
                Estimado: {formatBRL(procurement.costs.estimatedValue)}
              </div>
              <div className="text-slate-400 mt-1">
                Contratado: {formatBRL(procurement.costs.contractedValue, "Aguardando homologação")}
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700">
              <div className="text-slate-400">Votação Popular & Fonte</div>
              <div className="font-semibold text-white mt-1">
                Amostra: {totalVotes} votos ({supportPct}% Apoiam | {clarifyPct}% Revisão)
              </div>
              <div className="text-slate-400 mt-1">
                Fonte: {procurement.sourceName} • Atualizado em{" "}
                {formatDateTimeBR(procurement.lastSyncedAt)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SEÇÃO A — IDENTIFICAÇÃO DA CONTRATAÇÃO (Seção 6.2.A)
         ===================================================================== */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200">
              SEÇÃO A • IDENTIFICAÇÃO OFICIAL
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {procurement.statusLabel}
            </span>
          </div>
          <span className="font-mono text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
            {procurement.isDemoData ? "[DADOS DEMONSTRATIVOS]" : "[DADOS OFICIAIS PNCP]"}
          </span>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-red-700">
            {procurement.secretariat}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {procurement.simplifiedTitle}
          </h1>
        </div>

        {/* Grade de metadados administrativos obrigatórios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-500 block">Número do Processo</span>
            <strong className="font-mono text-slate-900 text-sm">
              {procurement.processNumber}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Número de Controle no PNCP</span>
            <strong className="font-mono text-slate-900 text-sm">
              {procurement.pncpNumber}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Unidade Compradora</span>
            <strong className="text-slate-900">{procurement.purchasingUnit}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Modalidade Legal</span>
            <strong className="text-slate-900">{procurement.modality}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Data de Publicação</span>
            <strong className="font-mono text-slate-900">
              {formatDateBR(procurement.publishedAt, "Item de Planejamento (PCA)")}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Data de Abertura / Sessão</span>
            <strong className="font-mono text-red-700">
              {formatDateTimeBR(procurement.sessionDate)}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Região / Abrangência</span>
            <strong className="text-slate-900">{procurement.region}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Última Sincronização Oficial</span>
            <strong className="font-mono text-slate-900">
              {formatDateTimeBR(procurement.lastSyncedAt)}
            </strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div className="font-semibold text-slate-700 uppercase font-mono">
            Objeto Original Publicado no Edital / Sistema Oficial:
          </div>
          <p className="text-slate-700 leading-relaxed">{procurement.originalObject}</p>
        </div>
      </section>

      {/* =====================================================================
          SEÇÃO C — CUSTOS EM DESTAQUE (Colocado em alta visibilidade - Seção 6.2.C)
         ===================================================================== */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
              SEÇÃO C • CUSTOS EM DESTAQUE (SEPARAÇÃO ESTRITA — REGRA 10)
            </span>
            <h2 className="font-display text-xl font-bold text-slate-900 mt-2">
              Quadro Financeiro da Contratação
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Valores estimados, homologados, contratados e pagos nunca são misturados.
          </span>
        </div>

        {procurement.costs.isBudgetConfidential && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-sm mb-1">
                Orçamento Estimado sob Sigilo Legal Temporário (Art. 24 da Lei 14.133/2021)
              </strong>
              {procurement.costs.confidentialityLegalBasis}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 text-white">
            <div className="text-[11px] font-mono uppercase text-slate-300">
              1. Orçamento Estimado
            </div>
            <div className="font-mono text-xl font-bold text-emerald-300 mt-2">
              {procurement.costs.isBudgetConfidential
                ? "Sigilo Legal (Art. 24)"
                : formatBRL(procurement.costs.estimatedValue)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Previsão oficial da Administração
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-mono uppercase text-slate-500">
              2. Valor Máximo Aceitável
            </div>
            <div className="font-mono text-lg font-bold text-slate-900 mt-2">
              {formatBRL(
                procurement.costs.maxAcceptableValue,
                "Não divulgado / Indisponível"
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Teto editalício para aceitação
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-mono uppercase text-slate-500">
              3. Valor Homologado
            </div>
            <div className="font-mono text-lg font-bold text-slate-900 mt-2">
              {formatBRL(
                procurement.costs.homologatedValue,
                "Ainda não homologado"
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Resultado final após julgamento
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-mono uppercase text-slate-500">
              4. Valor Contratado
            </div>
            <div className="font-mono text-lg font-bold text-slate-900 mt-2">
              {formatBRL(
                procurement.costs.contractedValue,
                "Contrato ainda não assinado"
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Valor formalizado em contrato
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-mono uppercase text-slate-500">
              5. Valor Efetivamente Pago
            </div>
            <div className="font-mono text-lg font-bold text-slate-900 mt-2">
              {formatBRL(procurement.costs.paidValue, "R$ 0,00 (Fase pré-contratual)")}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Desembolso liquidado e pago
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SEÇÃO B — RESUMO EM LINGUAGEM SIMPLES COM CITAÇÃO DOCUMENTAL (Seção 6.2.B)
         ===================================================================== */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1.5">
              <Bot className="w-4 h-4" />
              SEÇÃO B • TRADUÇÃO CIDADÃ EM LINGUAGEM SIMPLES
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Ancorado exclusivamente nos documentos oficiais publicados (Seção 12)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pergunta 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">
              1. O que a Prefeitura pretende comprar ou contratar?
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed">
              {procurement.aiSummary.whatIsBeingPurchased.text}
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200/70">
              Fonte: {procurement.aiSummary.whatIsBeingPurchased.sourceDocTitle} (
              {procurement.aiSummary.whatIsBeingPurchased.sourceClause})
            </div>
          </div>

          {/* Pergunta 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">
              2. Qual é a finalidade da contratação?
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed">
              {procurement.aiSummary.purpose.text}
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200/70">
              Fonte: {procurement.aiSummary.purpose.sourceDocTitle} (
              {procurement.aiSummary.purpose.sourceClause})
            </div>
          </div>

          {/* Pergunta 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">
              3. Onde será utilizado?
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed">
              {procurement.aiSummary.whereItWillBeUsed.text}
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200/70">
              Fonte: {procurement.aiSummary.whereItWillBeUsed.sourceDocTitle} (
              {procurement.aiSummary.whereItWillBeUsed.sourceClause})
            </div>
          </div>

          {/* Pergunta 4 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">
              4. Qual é o valor estimado e como foi calculado?
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed">
              {procurement.aiSummary.estimatedCostExplanation.text}
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200/70">
              Fonte: {procurement.aiSummary.estimatedCostExplanation.sourceDocTitle} (
              {procurement.aiSummary.estimatedCostExplanation.sourceClause})
            </div>
          </div>

          {/* Pergunta 5 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">
              5. Qual é o prazo previsto?
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed">
              {procurement.aiSummary.expectedTimeline.text}
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200/70">
              Fonte: {procurement.aiSummary.expectedTimeline.sourceDocTitle} (
              {procurement.aiSummary.expectedTimeline.sourceClause})
            </div>
          </div>

          {/* Pergunta 6 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">
              6. Quem será beneficiado?
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed">
              {procurement.aiSummary.beneficiaries.text}
            </p>
            <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200/70">
              Fonte: {procurement.aiSummary.beneficiaries.sourceDocTitle} (
              {procurement.aiSummary.beneficiaries.sourceClause})
            </div>
          </div>
        </div>

        {procurement.aiSummary.missingInformationNotice && (
          <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-300 text-xs text-slate-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <div>
              <strong>Registro Expresso de Dados Ainda Não Disponíveis: </strong>
              {procurement.aiSummary.missingInformationNotice}
            </div>
          </div>
        )}

        {procurement.aiSummary.glossary && procurement.aiSummary.glossary.length > 0 && (
          <div className="p-4 rounded-xl bg-red-50/70 border border-red-200/90 space-y-3">
            <h4 className="text-xs font-mono uppercase font-bold text-red-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-red-600" />
              Glossário Cidadão: Termos Técnicos Desta Contratação Explicados (Regra 9)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {procurement.aiSummary.glossary.map((item, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-red-100">
                  <strong className="text-red-950 block">{item.term}</strong>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{item.simpleExplanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          SEÇÃO D — EMPRESAS PARTICIPANTES (Seção 6.2.D)
         ===================================================================== */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
            SEÇÃO D • EMPRESAS PARTICIPANTES IDENTIFICADAS
          </span>
          <h2 className="font-display text-xl font-bold text-slate-900 mt-2">
            Licitantes e Propostas Publicamente Divulgadas
          </h2>
        </div>

        {procurement.participants.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            {procurement.bidHistoryLimitationNote ??
              "A lista de empresas participantes ainda não foi publicada na fonte oficial (a divulgação ocorre após a abertura das propostas)."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {procurement.participants.map((part) => (
              <div
                key={part.companyId}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-700 text-white">
                      {part.rankingPosition
                        ? `${part.rankingPosition}º Lugar na Disputa`
                        : "Proposta Cadastrada"}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      CNPJ: {part.cnpjFormatted}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {part.companyName}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mt-4 p-3 rounded-lg bg-white border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block">Proposta Inicial</span>
                      <strong className="font-mono text-slate-800">
                        {formatBRL(part.initialProposalValue, "Sigilo até abertura")}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Lance Final Registrado</span>
                      <strong className="font-mono text-emerald-800">
                        {formatBRL(part.finalBidValue, "Aguardando disputa")}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Situação</span>
                      <strong className="text-slate-900">
                        {part.participationStatus}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Resultado</span>
                      <strong className="text-slate-900">{part.disputeResult}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                  <span className="text-slate-500">
                    Avalie esta empresa no ranking popular
                  </span>
                  <Link
                    href={`/empresas/${part.cnpjNormalized}`}
                    className="inline-flex items-center gap-1 font-semibold text-red-700 hover:underline"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Abrir perfil da empresa →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================================
          SEÇÃO E — HISTÓRICO DE LANCES E GRÁFICO DE EVOLUÇÃO (Seção 6.2.E)
         ===================================================================== */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
            SEÇÃO E • LINHA DO TEMPO E EVOLUÇÃO DE LANCES
          </span>
          <h2 className="font-display text-xl font-bold text-slate-900 mt-2">
            Histórico Público de Lances da Disputa
          </h2>
        </div>

        {!procurement.bidHistoryAvailable || procurement.bids.length === 0 ? (
          <div className="p-6 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2">
            <div className="font-bold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-800" />
              Informação sobre Limitação da Fase Atual:
            </div>
            <p>
              {procurement.bidHistoryLimitationNote ??
                "O histórico detalhado de lances ainda não está disponível na API do PNCP para esta contratação. Nenhum lance é reconstruído ou estimado sem documentação oficial."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Gráfico Visual Interativo Recharts de Evolução de Preços (Seção 6.2.E) */}
            <div className="space-y-2">
              <BidTimelineChart
                bids={procurement.bids}
                estimatedValue={procurement.costs.estimatedValue}
              />
            </div>

            {/* Gráfico Visual de Evolução dos Preços (Seção 6.2.E) */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase font-bold text-slate-700 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-emerald-700" />
                  Gráfico de Evolução de Preços na Disputa (Comparativo com o Estimado)
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  Orçamento Estimado Base: {formatBRL(procurement.costs.estimatedValue)}
                </span>
              </div>

              <div className="space-y-3">
                {procurement.bids.map((bid, idx) => {
                  const baseVal =
                    procurement.costs.estimatedValue ?? bid.value * 1.05;
                  const pctOfEstimated = Math.min(
                    100,
                    Math.max(25, (bid.value / baseVal) * 100)
                  );
                  return (
                    <div key={bid.id} className="space-y-1">
                      <div className="flex flex-wrap items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">
                          Lance #{idx + 1} • {bid.companyName} (
                          {new Date(bid.timestamp).toLocaleTimeString("pt-BR")})
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatBRL(bid.value)}{" "}
                          {bid.isWinningBid && (
                            <span className="ml-1.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px]">
                              MENOR LANCE ATUAL
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            bid.isWinningBid ? "bg-emerald-600" : "bg-red-800"
                          }`}
                          style={{ width: `${pctOfEstimated}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Linha do Tempo Cronológica de Lances */}
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
              {procurement.bids.map((bid) => (
                <div
                  key={bid.id}
                  className={`p-4 rounded-xl border ${
                    bid.isWinningBid
                      ? "bg-emerald-50/60 border-emerald-300"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono text-slate-500">
                      Horário: {formatDateTimeBR(bid.timestamp)} • Posição:{" "}
                      <strong>{bid.positionAtMoment}º lugar</strong>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Fonte: {bid.sourceDocTitle}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                    <div className="font-semibold text-sm text-slate-900">
                      {bid.companyName}{" "}
                      <span className="font-mono text-xs text-slate-500">
                        ({bid.cnpjFormatted})
                      </span>
                    </div>
                    <div className="font-mono text-lg font-bold text-slate-900">
                      {formatBRL(bid.value)}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Movimentação: {bid.rankingShift}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================================
          SEÇÃO F — DOCUMENTOS OFICIAIS COM LINK DE ORIGEM (Seção 6.2.F)
         ===================================================================== */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
            SEÇÃO F • DOCUMENTOS OFICIAIS E FONTES PRIMÁRIAS
          </span>
          <h2 className="font-display text-xl font-bold text-slate-900 mt-2">
            Editais, Termos de Referência, Atas e Contratos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {procurement.documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl border border-slate-200 hover:border-red-800 hover:bg-red-50/30 transition-all flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                    {doc.type}
                  </span>
                  <span className="font-mono">{formatDateBR(doc.publishedAt)}</span>
                </div>
                <div className="font-semibold text-sm text-slate-900 group-hover:text-red-700 flex items-start gap-2">
                  <FileText className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
                  <span>{doc.title}</span>
                </div>
              </div>
              <div className="text-xs font-semibold text-red-700 inline-flex items-center gap-1">
                Consultar na fonte original ({doc.sourceName})
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* =====================================================================
          SEÇÃO 7.3 — VOTAÇÃO POPULAR VINCULADA À LICITAÇÃO
         ===================================================================== */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono uppercase text-emerald-400 font-semibold">
              Seção 7.3 • Participação Cidadã Verificada por CPF
            </span>
            <h2 className="font-display text-2xl font-bold mt-1">
              Manifeste sua opinião sobre este processo de contratação
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Esta votação avalia o processo de contratação e é independente da
              avaliação individual das empresas.{" "}
              <strong>
                O voto popular não determina o vencedor da licitação nem tem efeito jurídico.
              </strong>
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono shrink-0">
            Tamanho da amostra: <strong>{totalVotes} cidadãos verificados</strong>
          </div>
        </div>

        {/* Resultados Públicos (Seção 7.4) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-xs text-emerald-300 font-semibold">
              Apoio à contratação
            </div>
            <div className="font-mono text-2xl font-bold mt-1">
              {supportPct}%{" "}
              <span className="text-xs font-normal text-slate-400">
                ({supportCount} votos)
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-xs text-amber-300 font-semibold">
              Precisa de esclarecimentos ou revisão
            </div>
            <div className="font-mono text-2xl font-bold mt-1">
              {clarifyPct}%{" "}
              <span className="text-xs font-normal text-slate-400">
                ({clarifyCount} votos)
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-xs text-rose-300 font-semibold">
              Sou contrário à contratação
            </div>
            <div className="font-mono text-2xl font-bold mt-1">
              {opposePct}%{" "}
              <span className="text-xs font-normal text-slate-400">
                ({opposeCount} votos)
              </span>
            </div>
          </div>
        </div>

        {/* Formulário de Votação (Demonstração Interativa Fase 1) */}
        <form onSubmit={handleVoteSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedVote("SUPPORT");
                setVoteSubmitted(false);
              }}
              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                selectedVote === "SUPPORT"
                  ? "bg-emerald-900/60 border-emerald-400 text-white"
                  : "bg-slate-800/60 border-slate-700 text-slate-200 hover:border-slate-500"
              }`}
            >
              <ThumbsUp className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs font-semibold">Apoio à contratação</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedVote("NEEDS_CLARIFICATION");
                setVoteSubmitted(false);
              }}
              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                selectedVote === "NEEDS_CLARIFICATION"
                  ? "bg-amber-900/60 border-amber-400 text-white"
                  : "bg-slate-800/60 border-slate-700 text-slate-200 hover:border-slate-500"
              }`}
            >
              <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs font-semibold">
                A contratação precisa de esclarecimentos ou revisão
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedVote("OPPOSE");
                setVoteSubmitted(false);
              }}
              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                selectedVote === "OPPOSE"
                  ? "bg-rose-900/60 border-rose-400 text-white"
                  : "bg-slate-800/60 border-slate-700 text-slate-200 hover:border-slate-500"
              }`}
            >
              <ThumbsDown className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="text-xs font-semibold">
                Sou contrário à contratação
              </div>
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Justificativa opcional (sujeita a moderação por critérios objetivos e públicos)
            </label>
            <textarea
              rows={2}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Descreva de forma objetiva sua avaliação ou dúvida sobre o edital..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              {citizenSession ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  Identidade Ativa: {citizenSession.pseudonym} ({citizenSession.maskedCpf})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  Voto requer CPF validado:{" "}
                  <Link href="/conta" className="underline font-bold hover:text-white">
                    Validar CPF na aba Conta →
                  </Link>
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={!selectedVote || voteLoading}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 disabled:opacity-40 transition-colors shrink-0 flex items-center gap-2"
            >
              {voteLoading
                ? "Gravando manifestação..."
                : voteSubmitted
                ? "Atualizar Manifestação Cidadã ✓"
                : "Confirmar e Registrar Voto (1 CPF = 1 Voto)"}
            </button>
          </div>

          {voteFeedback && (
            <div className="p-3 rounded-lg bg-emerald-950/90 border border-emerald-700 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{voteFeedback}</span>
            </div>
          )}
        </form>

        {/* Justificativas Cidadãs Públicas Moderadas (Seção 7.3) */}
        {publicJustifications.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Manifestações e Justificativas de Cidadãos Verificados ({publicJustifications.length})
            </h3>
            <div className="space-y-2.5">
              {publicJustifications.map((comm, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-emerald-400">
                      {comm.authorPseudonym}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300">
                      {comm.voteType === "SUPPORT"
                        ? "Apoia"
                        : comm.voteType === "OPPOSE"
                        ? "Contrário"
                        : "Pede Esclarecimento"}
                    </span>
                  </div>
                  <p className="text-slate-200 italic">&quot;{comm.justification}&quot;</p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Registrado em {new Date(comm.date).toLocaleString("pt-BR")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
