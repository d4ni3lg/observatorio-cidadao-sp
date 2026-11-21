"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Scale,
  FileWarning,
  MessageSquare,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import {
  DEMO_ATTENTION_CONTRACTS,
  DEMO_COMPANIES,
  DEMO_DELAYED_WORKS,
  DEMO_PROCUREMENTS,
} from "@/lib/demo-data";
import {
  getAttentionContracts,
  getCompanies,
  getDelayedWorks,
  getProcurements,
} from "@/lib/data-provider";
import { formatBRL, formatDateBR, formatDateTimeBR } from "@/lib/formatters";
import {
  getClientCitizenSession,
  StoredCitizenSession,
} from "@/lib/citizen-auth/client-session";
import { notifyVoteRegistered } from "@/lib/pwa/notifications";
import { enqueueOfflineAction } from "@/lib/pwa/offline-queue";

export default function EmpresaProfilePage() {
  const params = useParams<{ cnpj: string }>();
  const companies = getCompanies();
  const procurements = getProcurements();
  const delayedWorks = getDelayedWorks();
  const attentionContracts = getAttentionContracts();

  const company =
    companies.find((c) => c.cnpjNormalized === params.cnpj) ??
    companies[0];

  // Sessão Cidadã e Votação em Empresas (Seção 7.1 e 7.2)
  const [citizenSession, setCitizenSession] = useState<StoredCitizenSession | null>(null);
  const [userVote, setUserVote] = useState<
    "RECOMMEND" | "DO_NOT_RECOMMEND" | "NO_OPINION" | null
  >(null);
  const [commentText, setCommentText] = useState("");
  const [voteSaved, setVoteSaved] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteFeedback, setVoteFeedback] = useState<string | null>(null);
  const [voteHistoryLog, setVoteHistoryLog] = useState<string[]>([]);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [correctionSent, setCorrectionSent] = useState(false);

  const [companyVotes, setCompanyVotes] = useState(company.votes);
  const [liveComments, setLiveComments] = useState<any[]>(company.comments || []);

  useEffect(() => {
    const session = getClientCitizenSession();
    if (session) {
      setCitizenSession(session);
    }

    // Carrega estatísticas atualizadas da API
    fetch(`/api/vote/company?companyCnpj=${encodeURIComponent(company.cnpjNormalized)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.totalVotes !== undefined && data.totalVotes > 0) {
          setCompanyVotes((prev) => ({
            ...prev,
            totalVotes: data.totalVotes,
            recommendCount: data.recommendCount,
            rejectCount: data.doNotRecommendCount,
            neutralCount: data.noOpinionCount,
            recommendPct: data.recommendPct,
            rejectPct: data.doNotRecommendPct,
            neutralPct: data.noOpinionPct,
            meetsMinimumSampleForLeadership: data.totalVotes >= 50,
          }));
          if (data.publicComments && data.publicComments.length > 0) {
            setLiveComments([...data.publicComments, ...(company.comments || [])]);
          }
        }
      })
      .catch((err) => console.error("Erro ao carregar votos da empresa:", err));
  }, [company.cnpjNormalized, company.comments]);

  const relatedProcurements = procurements.filter((p) =>
    p.participants.some((part) => part.cnpjNormalized === company.cnpjNormalized)
  );
  const relatedWorks = delayedWorks.filter(
    (w) => w.companyId === company.id || (w.companyCnpjFormatted && w.companyCnpjFormatted.replace(/\D/g, "") === company.cnpjNormalized)
  );
  const relatedAttentionContracts = attentionContracts.filter(
    (a) => a.companyId === company.id || (a.companyCnpjFormatted && a.companyCnpjFormatted.replace(/\D/g, "") === company.cnpjNormalized)
  );

  const totalVotes = companyVotes.totalVotes;
  const recCount = companyVotes.recommendCount;
  const rejCount = companyVotes.rejectCount;
  const neuCount = companyVotes.neutralCount;

  const recPct = totalVotes > 0 ? ((recCount / totalVotes) * 100).toFixed(1) : "0.0";
  const rejPct = totalVotes > 0 ? ((rejCount / totalVotes) * 100).toFixed(1) : "0.0";
  const neuPct = totalVotes > 0 ? ((neuCount / totalVotes) * 100).toFixed(1) : "0.0";

  const handleSelectOption = (
    option: "RECOMMEND" | "DO_NOT_RECOMMEND" | "NO_OPINION"
  ) => {
    const labelMap = {
      RECOMMEND: "Recomendo a empresa",
      DO_NOT_RECOMMEND: "Não recomendo a empresa",
      NO_OPINION: "Não tenho opinião formada",
    };
    if (voteSaved && userVote && userVote !== option) {
      setVoteHistoryLog((prev) => [
        ...prev,
        `Alterado de "${labelMap[userVote]}" para "${labelMap[option]}" em ${new Date().toLocaleTimeString(
          "pt-BR"
        )} (sem duplicar contagem total)`,
      ]);
    }
    setUserVote(option);
  };

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userVote) return;

    if (!citizenSession) {
      setVoteFeedback("Você precisa verificar seu CPF na área 'Conta' antes de votar (Regra de Unicidade 1 CPF = 1 Voto).");
      return;
    }

    setVoteLoading(true);
    setVoteFeedback(null);

    try {
      const res = await fetch("/api/vote/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizenToken: citizenSession.citizenToken,
          companyCnpj: company.cnpjNormalized,
          voteType: userVote,
          justification: commentText,
          _hp: "",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setVoteSaved(true);
        setVoteFeedback(data.message);
        notifyVoteRegistered(
          company.tradeName || company.legalName,
          userVote === "RECOMMEND" ? "Recomendo" : userVote === "DO_NOT_RECOMMEND" ? "Não Recomendo" : "Sem Opinião"
        );
        if (data.stats) {
          setCompanyVotes((prev) => ({
            ...prev,
            totalVotes: data.stats.totalVotes,
            recommendCount: data.stats.recommendCount,
            rejectCount: data.stats.doNotRecommendCount,
            neutralCount: data.stats.noOpinionCount,
            recommendPct: data.stats.recommendPct,
            rejectPct: data.stats.doNotRecommendPct,
            neutralPct: data.stats.noOpinionPct,
            meetsMinimumSampleForLeadership: data.stats.totalVotes >= 50,
          }));
          if (data.stats.publicComments) {
            setLiveComments([...data.stats.publicComments, ...(company.comments || [])]);
          }
        }
      } else {
        setVoteFeedback(data.error || "Erro ao registrar voto.");
      }
    } catch {
      // Fallback em caso de indisponibilidade de rede (Modo Offline PWA)
      try {
        await enqueueOfflineAction({
          type: "VOTE_COMPANY",
          payload: {
            citizenToken: citizenSession.citizenToken,
            companyCnpj: company.cnpjNormalized,
            voteType: userVote,
            justification: commentText,
          },
        });
        setVoteSaved(true);
        setVoteFeedback("Modo Offline: Seu voto foi armazenado no dispositivo e será sincronizado quando a conexão retornar.");
        notifyVoteRegistered(company.tradeName || company.legalName, "Voto Salvo Offline");
      } catch {
        setVoteFeedback("Erro de conexão ao salvar voto.");
      }
    } finally {
      setVoteLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex items-center justify-between">
        <Link
          href="/empresas"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Ranking de Empresas
        </Link>
        <span className="font-mono text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
          {company.isDemoData ? "[DADOS DEMONSTRATIVOS]" : "[FORNECEDOR OFICIAL PMSP]"}
        </span>
      </div>

      {/* Cabeçalho do Perfil da Empresa */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                CNPJ: {company.cnpjFormatted}
              </span>
              <span className="text-xs text-slate-500">
                Associação exclusiva por CNPJ normalizado ({company.cnpjNormalized})
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
              <Building2 className="w-7 h-7 text-red-700 shrink-0" />
              <span>{company.legalName}</span>
            </h1>
            <p className="text-sm text-slate-600">{company.sector}</p>
          </div>

          <button
            type="button"
            onClick={() => setShowCorrectionForm(!showCorrectionForm)}
            className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 shrink-0"
          >
            Solicitar correção factual / Manifestação empresarial (Seção 8.3)
          </button>
        </div>

        {/* Quadro de Indicadores Oficiais e Populares (Seção 8.1) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">
              Licitações identificadas
            </span>
            <strong className="font-mono text-2xl text-slate-900 mt-1 block">
              {company.identifiedProcurementsCount}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">
              Contratos identificados
            </span>
            <strong className="font-mono text-2xl text-slate-900 mt-1 block">
              {company.identifiedContractsCount}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 text-white md:col-span-2">
            <span className="text-xs text-slate-300 block">
              Volume total em contratos públicos identificados
            </span>
            <strong className="font-mono text-2xl text-emerald-300 mt-1 block">
              {formatBRL(company.totalContractedAmount)}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <span className="text-xs text-red-700 block font-medium">
              Amostra popular verificada
            </span>
            <strong className="font-mono text-2xl text-red-950 mt-1 block">
              {totalVotes} votos
            </strong>
          </div>
        </div>

        {/* Status em Bases de Sanções CEIS e CNEP (Seção 11.1 - Fonte 6) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-red-700" />
              Consulta de Sanções Administrativas (CEIS / CNEP — Fonte 6):
            </div>
            <p className="text-slate-700">{company.ceisCnepStatus.summary}</p>
            <p className="text-[11px] text-slate-500">
              Última verificação: {formatDateTimeBR(company.ceisCnepStatus.lastCheckedAt)} •{" "}
              <em>
                Ocorrências não definitivas não tornam a empresa irregular (Seção 11.1).
              </em>
            </p>
          </div>
          <a
            href={company.ceisCnepStatus.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-red-700 hover:underline shrink-0"
          >
            Consultar CEIS/CNEP oficial
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Direito de Resposta / Manifestação Oficial da Empresa (Seção 8.3) */}
        {company.companyOfficialResponse && (
          <div className="p-5 rounded-xl bg-red-50/70 border border-red-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <strong className="text-red-950 uppercase font-mono">
                Manifestação Pública Oficial da Empresa (Seção 8.3 — Direito de Resposta)
              </strong>
              <span className="text-slate-500">
                Publicado em {formatDateTimeBR(company.companyOfficialResponse.submittedAt)}
              </span>
            </div>
            <p className="text-slate-800 leading-relaxed">
              {company.companyOfficialResponse.statement}
            </p>
            <div className="text-[11px] text-slate-600">
              Responsável: {company.companyOfficialResponse.representativeRole}
            </div>
          </div>
        )}

        {/* Formulário de Solicitação de Correção Factual por Representante (Seção 8.3) */}
        {showCorrectionForm && (
          <div className="p-5 rounded-xl bg-slate-100 border border-slate-300 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-900">
              Canal de Correção de Informações Factuais e Direito de Resposta Empresarial
            </h3>
            <p className="text-slate-600">
              Representantes legais vinculados ao CNPJ podem enviar documentos
              oficiais (certidões, termos de recebimento, decisões administrativas)
              para retificação imediata de dados factuais ou publicação de nota de
              esclarecimento.
            </p>
            {correctionSent ? (
              <div className="p-3 rounded bg-emerald-100 text-emerald-900 font-medium">
                Solicitação demonstrativa registrada no log de auditoria administrativa.
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  placeholder="Informe o dado factual a ser retificado e o link/número SEI do documento comprobatório..."
                  className="w-full p-3 rounded-lg border border-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setCorrectionSent(true)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold"
                >
                  Enviar solicitação para auditoria
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* =====================================================================
          SEÇÃO 7.2 e 7.4 — ÁREA DE AVALIAÇÃO POPULAR DA EMPRESA
         ===================================================================== */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono uppercase text-emerald-400 font-semibold">
              Seção 7.2 • Avaliação Popular da Empresa (Independente e Sem Efeito Jurídico)
            </span>
            <h2 className="font-display text-2xl font-bold mt-1">
              Qual é a sua avaliação sobre a atuação desta empresa?
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Cada cidadão verificado por CPF pode registrar 1 manifestação válida
              por empresa no ciclo, podendo atualizar seu voto mantendo histórico
              auditável sem dupla contagem.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono shrink-0">
            <div>Amostra: {totalVotes} participantes voluntários</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              (Não equivale a pesquisa estatística amostral da população)
            </div>
          </div>
        </div>

        {/* Resultados Públicos e Evolução das Manifestações (Seção 7.4) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase text-slate-300">
              Distribuição Atual de Posicionamentos
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60">
                <div className="text-xs text-emerald-300 font-semibold">
                  Recomendo
                </div>
                <div className="font-mono text-2xl font-bold mt-1">{recPct}%</div>
                <div className="text-[11px] text-slate-400">{recCount} votos</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700">
                <div className="text-xs text-slate-300 font-semibold">
                  Sem opinião
                </div>
                <div className="font-mono text-2xl font-bold mt-1">{neuPct}%</div>
                <div className="text-[11px] text-slate-400">{neuCount} votos</div>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-700/60">
                <div className="text-xs text-rose-300 font-semibold">
                  Não recomendo
                </div>
                <div className="font-mono text-2xl font-bold mt-1">{rejPct}%</div>
                <div className="text-[11px] text-slate-400">{rejCount} votos</div>
              </div>
            </div>
          </div>

          {/* Evolução Histórica das Manifestações (Seção 7.4 e 8.1) */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-300">
              Evolução Temporal das Manifestações ({company.votes.evaluationPeriod})
            </h3>
            <div className="space-y-2">
              {company.voteEvolution.map((pt) => (
                <div key={pt.month} className="text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-mono">{pt.month} (n={pt.sampleSize})</span>
                    <span>
                      {pt.recommendPct}% Recomendo • {pt.rejectPct}% Não recomendo
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${pt.recommendPct}%` }}
                    />
                    <div
                      className="bg-slate-500 h-full"
                      style={{ width: `${pt.neutralPct}%` }}
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{ width: `${pt.rejectPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Opções de Voto Obrigatórias (Seção 7.2) */}
        <form onSubmit={handleVoteSubmit} className="space-y-4 pt-3 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleSelectOption("RECOMMEND")}
              className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                userVote === "RECOMMEND"
                  ? "bg-emerald-900/60 border-emerald-400 text-white"
                  : "bg-slate-800/70 border-slate-700 text-slate-200 hover:border-slate-500"
              }`}
            >
              <ThumbsUp className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold">Recomendo a empresa</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectOption("DO_NOT_RECOMMEND")}
              className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                userVote === "DO_NOT_RECOMMEND"
                  ? "bg-rose-900/60 border-rose-400 text-white"
                  : "bg-slate-800/70 border-slate-700 text-slate-200 hover:border-slate-500"
              }`}
            >
              <ThumbsDown className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="text-xs font-semibold">Não recomendo a empresa</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectOption("NO_OPINION")}
              className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                userVote === "NO_OPINION"
                  ? "bg-slate-700 border-slate-300 text-white"
                  : "bg-slate-800/70 border-slate-700 text-slate-200 hover:border-slate-500"
              }`}
            >
              <MinusCircle className="w-5 h-5 text-slate-300 shrink-0" />
              <span className="text-xs font-semibold">Não tenho opinião formada</span>
            </button>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">
              Comentário opcional com justificativa (passa por moderação com critérios objetivos; acusações sem comprovação não são publicadas)
            </label>
            <textarea
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Relate sua percepção com base em obras, entregas ou serviços públicos verificáveis..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500"
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
                  Avaliação requer CPF validado:{" "}
                  <Link href="/conta" className="underline font-bold hover:text-white">
                    Validar CPF na aba Conta →
                  </Link>
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={!userVote || voteLoading}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 disabled:opacity-40 transition-colors flex items-center gap-2"
            >
              {voteLoading
                ? "Gravando manifestação..."
                : voteSaved
                ? "Atualizar voto popular ✓"
                : "Confirmar voto popular (1 CPF = 1 Voto)"}
            </button>
          </div>

          {voteFeedback && (
            <div className="p-3 rounded-lg bg-emerald-950/90 border border-emerald-700 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{voteFeedback}</span>
            </div>
          )}

          {voteHistoryLog.length > 0 && (
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-emerald-300">
              Histórico de alterações nesta sessão: {voteHistoryLog.join(" | ")}
            </div>
          )}
        </form>
      </section>

      {/* Comentários Moderados e Vínculos com Licitações / Obras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-700" />
            <span>Comentários Cidadãos Moderados ({liveComments.length})</span>
          </h2>
          {liveComments.length === 0 ? (
            <p className="text-xs text-slate-500">
              Nenhum comentário público registrado até o momento.
            </p>
          ) : (
            <div className="space-y-3">
              {liveComments.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900">{c.authorPseudonym}</strong>
                    <span className="font-mono text-slate-500">
                      {formatDateBR(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{c.content}</p>
                  <div className="text-[11px] text-emerald-800 font-mono">
                    Critério de moderação: {c.moderationRuleApplied}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-amber-700" />
            <span>Licitações, Obras e Contratos Vinculados a este CNPJ</span>
          </h2>

          <div className="space-y-3 text-xs">
            {relatedProcurements.map((p) => (
              <Link
                key={p.id}
                href={`/licitacoes/${p.id}`}
                className="block p-3.5 rounded-xl border border-slate-200 hover:border-red-800 transition-colors"
              >
                <div className="text-[11px] font-mono text-red-700 font-semibold">
                  LICITAÇÃO PARTICIPANTE • {p.processNumber}
                </div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {p.simplifiedTitle}
                </div>
              </Link>
            ))}

            {relatedWorks.map((w) => (
              <Link
                key={w.id}
                href={`/obras-atrasadas/${w.id}`}
                className="block p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:border-amber-600 transition-colors"
              >
                <div className="text-[11px] font-mono text-amber-900 font-semibold">
                  OBRA MONITORADA ({w.schedule.delayMonths} MESES DE ATRASO) • Contrato{" "}
                  {w.contractNumber}
                </div>
                <div className="font-bold text-slate-900 mt-0.5">{w.name}</div>
              </Link>
            ))}

            {relatedAttentionContracts.map((att) => (
              <Link
                key={att.id}
                href={`/contratacoes-atencao#${att.id}`}
                className="block p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 hover:border-rose-600 transition-colors"
              >
                <div className="text-[11px] font-mono text-rose-900 font-semibold">
                  INDICADOR DE ATENÇÃO #{att.rankPosition} ({att.totalAttentionScore}/100 pts)
                </div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {att.simplifiedName}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
