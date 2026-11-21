import React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Building2,
  HardHat,
  AlertOctagon,
  Calendar,
  ArrowRight,
  Users,
  CheckCircle2,
  Scale,
  ExternalLink,
  Clock,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import {
  getAttentionContracts,
  getCalculatedLiveIndicators,
  getCompanies,
  getDelayedWorks,
  getProcurements,
} from "@/lib/data-provider";
import { formatBRL, formatCompactBRL, formatDateBR } from "@/lib/formatters";
import { DelaySeverityBadge } from "@/components/badges/DelaySeverityBadge";

export default function HomePage() {
  const indicators = getCalculatedLiveIndicators();
  const procurements = getProcurements();
  const companies = getCompanies();
  const delayedWorks = getDelayedWorks();
  const attentionContracts = getAttentionContracts();

  // Licitações publicadas ordenadas inicialmente pelas datas de sessão mais próximas (Seção 5.2)
  const publishedProcurements = procurements
    .filter((p) => p.recordType === "PUBLISHED_BID")
    .sort(
      (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
    );

  // Empresas com maior número de contratos/manifestações
  const highlightedCompanies = [...companies].sort((a, b) => {
    if (b.votes.totalVotes !== a.votes.totalVotes) {
      return b.votes.totalVotes - a.votes.totalVotes;
    }
    return b.totalContractedAmount - a.totalContractedAmount;
  });

  return (
    <div className="space-y-14 pb-12">
      {/* Cabeçalho Editorial Principal - Tema Paulista (Preto, Vermelho e Branco) */}
      <section className="bg-neutral-950 text-white border-b border-red-950/60 pt-10 pb-14 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/90 border border-red-700/60 text-red-200 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>São Paulo • Controle Social Ativo</span>
              <span>•</span>
              <span className="text-red-300">Base Oficial Integrada (PNCP & SIURB)</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Acompanhe como os recursos públicos de São Paulo são licitados, contratados e executados.
            </h1>
            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed">
              Transformamos editais, atas de lances, cronogramas de obras e relatórios de fiscalização em informação clara, visual e verificável para qualquer cidadão paulistano.
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                href="/licitacoes"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-red-700 text-white font-bold text-sm hover:bg-red-800 transition-all shadow-md active:scale-95 border border-red-800"
              >
                Explorar Licitações Abertas
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/obras-atrasadas"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-neutral-900 text-white border border-neutral-700 font-semibold text-sm hover:bg-neutral-800 transition-colors"
              >
                Consultar Obras Atrasadas
              </Link>
              <Link
                href="/contratacoes-atencao"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-red-400 hover:text-red-300 font-semibold text-sm"
              >
                <AlertOctagon className="w-4 h-4 text-red-500" />
                Top 5 Indicadores de Atenção
              </Link>
            </div>
          </div>

          {/* 5.1 Indicadores Principais (6 Cards) */}
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-red-600 inline-block rounded-full"></span>
                5.1 Indicadores Principais em Tempo Real
              </h2>
              <span className="text-xs font-mono text-neutral-300 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Base Oficial Integrada • Atualizado em {indicators.lastCalculationTimestamp}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-neutral-300">
                    Licitações futuras publicadas
                  </span>
                  <FileSpreadsheet className="w-5 h-5 text-red-500 shrink-0" />
                </div>
                <div className="my-3">
                  <div className="font-mono text-3xl font-bold text-white">
                    {indicators.futurePublishedBidsCount}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    + {indicators.pcaPlannedCount} previstas em seção separada do PCA 2027
                  </div>
                </div>
                <div className="text-[11px] text-neutral-400 border-t border-neutral-800 pt-2">
                  Recorte: Editais abertos (Fonte: PNCP São Paulo)
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-neutral-300">
                    Valor total estimado (Editais publicados)
                  </span>
                  <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>
                <div className="my-3">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400">
                    {formatBRL(indicators.totalEstimatedFuturePublishedValue)}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Exclui editais sob sigilo legal temporário (Lei 14.133, art. 24)
                  </div>
                </div>
                <div className="text-[11px] text-neutral-400 border-t border-neutral-800 pt-2">
                  Calculado sem estimativas artificiais
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-neutral-300">
                    Empresas fornecedoras identificadas
                  </span>
                  <Building2 className="w-5 h-5 text-red-500 shrink-0" />
                </div>
                <div className="my-3">
                  <div className="font-mono text-3xl font-bold text-white">
                    {indicators.identifiedParticipatingCompaniesCount}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Associadas exclusivamente por CNPJ de 14 dígitos
                  </div>
                </div>
                <div className="text-[11px] text-neutral-400 border-t border-neutral-800 pt-2">
                  Votação popular auditável com token HMAC e LGPD
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-neutral-300">
                    Obras com atraso documentado
                  </span>
                  <HardHat className="w-5 h-5 text-amber-500 shrink-0" />
                </div>
                <div className="my-3">
                  <div className="font-mono text-3xl font-bold text-amber-400">
                    {indicators.delayedWorksDocumentedCount}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Atraso médio documentado frente ao contrato original
                  </div>
                </div>
                <div className="text-[11px] text-neutral-400 border-t border-neutral-800 pt-2">
                  Fonte: Gesconfi SIURB & Obras Abertas PMSP
                </div>
              </div>

              {/* Card 5 */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-neutral-300">
                    Valor contratado nas obras monitoradas
                  </span>
                  <Scale className="w-5 h-5 text-amber-500 shrink-0" />
                </div>
                <div className="my-3">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-white">
                    {formatBRL(indicators.totalContractedInDelayedWorksValue)}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Valores atualizados após termos aditivos oficiais
                  </div>
                </div>
                <div className="text-[11px] text-neutral-400 border-t border-neutral-800 pt-2">
                  Medição física descolada da financeira sob alerta
                </div>
              </div>

              {/* Card 6 */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-neutral-300">
                    Contratos com ocorrências documentadas
                  </span>
                  <AlertOctagon className="w-5 h-5 text-red-500 shrink-0" />
                </div>
                <div className="my-3">
                  <div className="font-mono text-3xl font-bold text-red-400">
                    {indicators.contractsWithOccurrencesCount}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Ocorrências oficiais documentadas nos últimos 6 meses
                  </div>
                </div>
                <div className="text-[11px] text-neutral-400 border-t border-neutral-800 pt-2">
                  Indicadores objetivos auditáveis (Seção 10)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 5.2 Licitações em Destaque */}
        <section aria-labelledby="heading-licitacoes-destaque">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-red-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                Seção 5.2 • Próximas Aberturas Oficiais
              </div>
              <h2
                id="heading-licitacoes-destaque"
                className="font-display text-2xl font-black text-neutral-900 mt-1"
              >
                Licitações Publicadas em Destaque
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Editais efetivamente publicados com sessão agendada ou recebimento de propostas aberto.
              </p>
            </div>
            <Link
              href="/licitacoes"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-red-700 hover:text-red-800 shrink-0"
            >
              Ver todas as licitações e filtros
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publishedProcurements.slice(0, 4).map((lic) => (
              <article
                key={lic.id}
                className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-neutral-100 text-neutral-900 border border-neutral-200">
                      <Calendar className="w-3.5 h-3.5 text-red-600" />
                      Sessão: {formatDateBR(lic.sessionDate)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {lic.statusLabel}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                    {lic.secretariat}
                  </div>
                  <h3 className="font-display text-lg font-bold text-neutral-900 leading-snug mb-3">
                    {lic.simplifiedTitle}
                  </h3>

                  <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 mb-4">
                    <div className="text-[11px] font-mono uppercase text-neutral-500">
                      Valor Estimado Oficial no Edital
                    </div>
                    {lic.costs.isBudgetConfidential ? (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          Orçamento sob sigilo legal temporário (Art. 24, Lei 14.133/2021)
                        </span>
                      </div>
                    ) : (
                      <div className="font-mono text-2xl font-bold text-neutral-900 mt-0.5">
                        {formatBRL(lic.costs.estimatedValue)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-neutral-600 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      {lic.participantsCount !== null
                        ? `${lic.participantsCount} empresas`
                        : "Participantes após sessão"}
                    </span>
                    <span className="font-mono text-[11px] text-neutral-400">
                      [OFICIAL PNCP]
                    </span>
                  </div>

                  <Link
                    href={`/licitacoes/${lic.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                  >
                    Consultar detalhes
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 5.3 Empresas em Destaque */}
        <section aria-labelledby="heading-empresas-destaque">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-red-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                Seção 5.3 • Percepção Popular Paulista (1 CPF = 1 Voto)
              </div>
              <h2
                id="heading-empresas-destaque"
                className="font-display text-2xl font-black text-neutral-900 mt-1"
              >
                Empresas com Maior Volume de Manifestações Cidadãs
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                A avaliação reflete a percepção voluntária de cidadãos paulistanos verificados por CPF.
              </p>
            </div>
            <Link
              href="/empresas"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-red-700 hover:text-red-800 shrink-0"
            >
              Acessar Ranking de Fornecedores
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlightedCompanies.slice(0, 3).map((comp) => (
              <div
                key={comp.id}
                className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:border-red-200 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 font-mono mb-2">
                    <span>CNPJ: {comp.cnpjFormatted}</span>
                    <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-bold">
                      {comp.votes.totalVotes} votos
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-neutral-900 leading-snug">
                    {comp.legalName}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 mb-4">{comp.sector}</p>

                  <div className="space-y-2 my-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-emerald-700">
                        Recomendo ({comp.votes.recommendPct}%)
                      </span>
                      <span className="text-red-700">
                        Não recomendo ({comp.votes.rejectPct}%)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-neutral-100 overflow-hidden flex">
                      <div
                        style={{ width: `${comp.votes.recommendPct}%` }}
                        className="bg-emerald-600 h-full"
                      />
                      <div
                        style={{ width: `${comp.votes.neutralPct}%` }}
                        className="bg-neutral-400 h-full"
                      />
                      <div
                        style={{ width: `${comp.votes.rejectPct}%` }}
                        className="bg-red-600 h-full"
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-neutral-500">
                      <span>{comp.votes.recommendCount} apoios</span>
                      <span>{comp.votes.neutralCount} neutros</span>
                      <span>{comp.votes.rejectCount} rejeições</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
                    <div>
                      <span className="text-neutral-500 block">Contratos na PMSP</span>
                      <strong className="font-mono text-sm text-neutral-900">
                        {comp.identifiedContractsCount} contratos
                      </strong>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Total contratado</span>
                      <strong className="font-mono text-sm text-neutral-900">
                        {formatCompactBRL(comp.totalContractedAmount)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">
                    Regularidade CNPJ verificada
                  </span>
                  <Link
                    href={`/empresas/${comp.cnpjNormalized}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-800"
                  >
                    Ver perfil e votar
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5.4 Obras Atrasadas em Destaque */}
        <section aria-labelledby="heading-obras-destaque">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-red-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                Seção 5.4 • Fiscalização de Obras Públicas
              </div>
              <h2
                id="heading-obras-destaque"
                className="font-display text-2xl font-black text-neutral-900 mt-1"
              >
                Obras Públicas com Atraso Documentado
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Comparação entre prazo contratual original, aditivos de prorrogação e execução física.
              </p>
            </div>
            <Link
              href="/obras-atrasadas"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-red-700 hover:text-red-800 shrink-0"
            >
              Ver todas as obras e relatar problemas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {delayedWorks.slice(0, 3).map((work) => (
              <article
                key={work.id}
                className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:border-red-200 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <DelaySeverityBadge delayMonths={work.schedule.delayMonths} />
                    <span className="text-xs font-medium text-neutral-600">
                      {work.subprefecture}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-neutral-900 leading-snug mb-2">
                    {work.name}
                  </h3>
                  <div className="text-xs text-neutral-600 mb-4">
                    <strong>Contratada:</strong> {work.companyName}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs mb-4">
                    <div>
                      <span className="text-neutral-500 block">Ano previsto</span>
                      <strong className="font-mono text-sm text-red-700">
                        Ano {work.schedule.expectedCompletionYear}
                      </strong>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Prazo atual</span>
                      <strong className="font-mono text-sm text-neutral-900">
                        {formatDateBR(work.schedule.updatedEndDate)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Orçamento inicial</span>
                      <strong className="font-mono text-neutral-800">
                        {formatCompactBRL(work.costs.initialBudget)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Valor após aditivos</span>
                      <strong className="font-mono text-neutral-900">
                        {formatCompactBRL(work.costs.updatedAmountAfterAmendments)}
                      </strong>
                    </div>
                  </div>

                  {/* Separação física vs. financeira */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-neutral-600">Valor Pago (Financeiro)</span>
                        <span className="font-mono font-bold text-neutral-900">
                          {formatCompactBRL(work.costs.paidAmount)} ({work.costs.financialExecutionPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className="bg-neutral-800 h-full"
                          style={{ width: `${work.costs.financialExecutionPct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-neutral-600">Execução Física Medida</span>
                        <span className="font-mono font-bold text-amber-700">
                          {work.costs.physicalExecutionPct !== null
                            ? `${work.costs.physicalExecutionPct}% (${formatCompactBRL(work.costs.physicalExecutedValue)})`
                            : "Aguardando medição"}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className="bg-amber-600 h-full"
                          style={{ width: `${work.costs.physicalExecutionPct ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-neutral-500">
                    {work.schedule.currentStatus}
                  </span>
                  <Link
                    href={`/obras-atrasadas/${work.id}`}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                  >
                    Acompanhar
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 5.5 Ranking de Atenção */}
        <section
          aria-labelledby="heading-ranking-problemas"
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-red-700 font-bold">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Seção 5.5 • Indicadores Objetivos
              </div>
              <h2
                id="heading-ranking-problemas"
                className="font-display text-2xl font-black text-neutral-900 mt-1"
              >
                Contratações que Merecem Atenção (Top 5)
              </h2>
              <p className="text-sm text-neutral-600 mt-1 max-w-3xl">
                Pontuação calculada exclusivamente por dados documentados (aditivos de valor, prorrogações sucessivas e apontamentos de controle).
              </p>
            </div>
            <Link
              href="/contratacoes-atencao"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-red-700 transition-colors shrink-0"
            >
              Ver metodologia e pesos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-neutral-200 mt-2">
            {attentionContracts.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 text-red-900 font-mono font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                    #{item.rankPosition}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span className="font-mono font-semibold text-neutral-700">
                        Contrato {item.contractNumber}
                      </span>
                      <span>•</span>
                      <span>{item.secretariat}</span>
                      <span>•</span>
                      <span>Registro: {formatDateBR(item.lastRecordDate)}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-neutral-900 mt-0.5">
                      {item.simplifiedName}
                    </h3>
                    <div className="text-xs text-neutral-600 mt-1">
                      <strong>Contratada:</strong> {item.companyName} ({item.companyCnpjFormatted})
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.primaryOccurrenceTypes.map((occ, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium"
                        >
                          {occ}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex sm:items-center justify-between lg:justify-end gap-4 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-neutral-100">
                  <div className="text-left lg:text-right">
                    <div className="text-[11px] text-neutral-500 uppercase font-mono">
                      Valor Atualizado
                    </div>
                    <div className="font-mono text-base font-bold text-neutral-900">
                      {formatBRL(item.currentContractValue)}
                    </div>
                    <div className="text-[11px] text-red-700 font-bold">
                      {item.documentedOccurrencesCount} ocorrências • Score:{" "}
                      <strong className="font-mono">{item.totalAttentionScore}/100 pts</strong>
                    </div>
                  </div>
                  <Link
                    href={`/contratacoes-atencao#${item.id}`}
                    className="px-3 py-2 rounded-lg border border-neutral-300 text-xs font-bold text-neutral-800 hover:bg-neutral-50"
                  >
                    Ver dossiê
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
