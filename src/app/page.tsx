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
      {/* Cabeçalho Editorial Principal */}
      <section className="bg-slate-900 text-white border-b border-slate-800 pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/70 border border-blue-700 text-blue-200 text-xs font-medium">
              <span>Município de São Paulo</span>
              <span>•</span>
              <span>Monitoramento Cidadão Independente (Nov/2026 – Jun/2027)</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Acompanhe como o dinheiro público municipal é licitado, contratado e executado.
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Transformamos editais, atas de lances, cronogramas de obras e relatórios
              de fiscalização em informação clara, visual e verificável para qualquer
              cidadão paulistano.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/licitacoes"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors"
              >
                Explorar Licitações Abertas
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/obras-atrasadas"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 text-white border border-slate-700 font-semibold text-sm hover:bg-slate-700 transition-colors"
              >
                Consultar Obras Atrasadas
              </Link>
              <Link
                href="/contratacoes-atencao"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-amber-300 hover:text-amber-200 font-medium text-sm"
              >
                <AlertOctagon className="w-4 h-4" />
                Ver Top 5 Indicadores de Atenção
              </Link>
            </div>
          </div>

          {/* 5.1 Indicadores Principais (6 Cards Obrigatórios) */}
          <div className="mt-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                5.1 Indicadores Principais Calculados da Base Disponível
              </h2>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 px-2.5 py-1 rounded">
                {indicators.isLive
                  ? `Base Oficial Integrada • Atualizado em ${indicators.lastCalculationTimestamp}`
                  : `Base Demonstrativa Fase 1 • Atualizado em ${indicators.lastCalculationTimestamp}`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    Licitações futuras publicadas
                  </span>
                  <FileSpreadsheet className="w-5 h-5 text-blue-400 shrink-0" />
                </div>
                <div className="my-3">
                  <div className="font-mono text-3xl font-bold text-white">
                    {indicators.futurePublishedBidsCount}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    + {indicators.pcaPlannedCount} previstas em seção separada do PCA 2027
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 border-t border-slate-700/80 pt-2">
                  Recorte: 07/11/2026 até 30/06/2027 (Fonte: PNCP Demo)
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    Valor total estimado (Editais publicados)
                  </span>
                  <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>
                <div className="my-3">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-300">
                    {formatBRL(indicators.totalEstimatedFuturePublishedValue)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Exclui {indicators.confidentialBudgetsExcludedCount} edital sob sigilo legal temporário (Lei 14.133, art. 24)
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 border-t border-slate-700/80 pt-2">
                  Calculado sem estimativas artificiais (Regra 5.1)
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    Empresas participantes identificadas
                  </span>
                  <Building2 className="w-5 h-5 text-blue-400 shrink-0" />
                </div>
                <div className="my-3">
                  <div className="font-mono text-3xl font-bold text-white">
                    {indicators.identifiedParticipatingCompaniesCount}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Associadas exclusivamente por CNPJ de 14 dígitos
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 border-t border-slate-700/80 pt-2">
                  1.237 manifestações populares verificadas registradas
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    Obras com atraso documentado
                  </span>
                  <HardHat className="w-5 h-5 text-amber-400 shrink-0" />
                </div>
                <div className="my-3">
                  <div className="font-mono text-3xl font-bold text-amber-300">
                    {indicators.delayedWorksDocumentedCount}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Atraso médio documentado: 25 meses frente ao contrato inicial
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 border-t border-slate-700/80 pt-2">
                  Recorte quinquenal: 07/11/2021 a 07/11/2026
                </div>
              </div>

              {/* Card 5 */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    Valor contratado atualizado nas obras monitoradas
                  </span>
                  <Scale className="w-5 h-5 text-amber-400 shrink-0" />
                </div>
                <div className="my-3">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-white">
                    {formatBRL(indicators.totalContractedInDelayedWorksValue)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Orçamento inicial somado: {formatCompactBRL(115500000)} (+14,7% em aditivos)
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 border-t border-slate-700/80 pt-2">
                  Fonte: Obras Abertas PMSP & Transparência SP (Demo)
                </div>
              </div>

              {/* Card 6 */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    Contratos com ocorrências documentadas
                  </span>
                  <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                </div>
                <div className="my-3">
                  <div className="font-mono text-3xl font-bold text-rose-300">
                    {indicators.contractsWithOccurrencesCount}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    20 ocorrências documentadas nos últimos 6 meses
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 border-t border-slate-700/80 pt-2">
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
              <div className="text-xs font-mono uppercase tracking-wider text-blue-800 font-semibold">
                Seção 5.2 • Próximas Aberturas (Ordenadas pela data mais próxima)
              </div>
              <h2
                id="heading-licitacoes-destaque"
                className="font-display text-2xl font-bold text-slate-900 mt-1"
              >
                Licitações Publicadas em Destaque
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Editais efetivamente publicados com sessão agendada ou recebimento de
                propostas aberto. Itens do Plano de Contratações Anual (PCA) ficam
                separados na aba de Planejamento.
              </p>
            </div>
            <Link
              href="/licitacoes"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-800 hover:text-blue-950 shrink-0"
            >
              Ver todas as licitações e filtros avançados
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publishedProcurements.map((lic) => (
              <article
                key={lic.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                      <Calendar className="w-3.5 h-3.5" />
                      Sessão: {formatDateBR(lic.sessionDate)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {lic.statusLabel}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    {lic.secretariat}
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 leading-snug mb-3">
                    {lic.simplifiedTitle}
                  </h3>

                  {/* Destaque Monetário (Seção 3.1 e 5.2) */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 mb-4">
                    <div className="text-[11px] font-mono uppercase text-slate-500">
                      Valor Estimado Oficial no Edital
                    </div>
                    {lic.costs.isBudgetConfidential ? (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          Orçamento sob sigilo legal temporário (Art. 24, Lei 14.133/2021)
                        </span>
                      </div>
                    ) : (
                      <div className="font-mono text-2xl font-bold text-slate-900 mt-0.5">
                        {formatBRL(lic.costs.estimatedValue)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {lic.participantsCount !== null
                        ? `${lic.participantsCount} empresas participantes`
                        : "Participantes após abertura"}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {lic.isDemoData ? "[DEMO]" : "[OFICIAL PNCP]"}
                    </span>
                  </div>

                  <Link
                    href={`/licitacoes/${lic.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-blue-900 transition-colors"
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
              <div className="text-xs font-mono uppercase tracking-wider text-blue-800 font-semibold">
                Seção 5.3 • Percepção Popular Verificada por CPF
              </div>
              <h2
                id="heading-empresas-destaque"
                className="font-display text-2xl font-bold text-slate-900 mt-1"
              >
                Empresas com Maior Volume de Manifestações Cidadãs
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                A avaliação reflete exclusivamente a percepção voluntária de cidadãos
                verificados e <strong>não classifica uma empresa como regular ou irregular</strong>.
              </p>
            </div>
            <Link
              href="/empresas"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-800 hover:text-blue-950 shrink-0"
            >
              Acessar Ranking de Empresas Completo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlightedCompanies.slice(0, 3).map((comp) => (
              <div
                key={comp.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 font-mono mb-2">
                    <span>CNPJ: {comp.cnpjFormatted}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      Amostra: {comp.votes.totalVotes} votos
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                    {comp.legalName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">{comp.sector}</p>

                  {/* Distribuição dos posicionamentos (Seção 5.3) */}
                  <div className="space-y-2 my-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-emerald-800">
                        Recomendo ({comp.votes.recommendPct}%)
                      </span>
                      <span className="font-medium text-rose-800">
                        Não recomendo ({comp.votes.rejectPct}%)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                      <div
                        style={{ width: `${comp.votes.recommendPct}%` }}
                        className="bg-emerald-600 h-full"
                        title={`Recomendo: ${comp.votes.recommendPct}%`}
                      />
                      <div
                        style={{ width: `${comp.votes.neutralPct}%` }}
                        className="bg-slate-400 h-full"
                        title={`Sem opinião formada: ${comp.votes.neutralPct}%`}
                      />
                      <div
                        style={{ width: `${comp.votes.rejectPct}%` }}
                        className="bg-rose-600 h-full"
                        title={`Não recomendo: ${comp.votes.rejectPct}%`}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>{comp.votes.recommendCount} recomendações</span>
                      <span>{comp.votes.neutralCount} neutros</span>
                      <span>{comp.votes.rejectCount} rejeições</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                    <div>
                      <span className="text-slate-500 block">Contratos identificados</span>
                      <strong className="font-mono text-sm text-slate-900">
                        {comp.identifiedContractsCount} contratos
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Total contratado</span>
                      <strong className="font-mono text-sm text-slate-900">
                        {formatCompactBRL(comp.totalContractedAmount)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {comp.votes.commentsCount} comentários moderados
                  </span>
                  <Link
                    href={`/empresas/${comp.cnpjNormalized}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800 hover:underline"
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
              <div className="text-xs font-mono uppercase tracking-wider text-amber-800 font-semibold">
                Seção 5.4 • Monitoramento Quinquenal (07/11/2021 a 07/11/2026)
              </div>
              <h2
                id="heading-obras-destaque"
                className="font-display text-2xl font-bold text-slate-900 mt-1"
              >
                Obras Públicas com Atraso Documentado
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Comparação direta entre o ano original previsto de entrega, o orçamento
                inicial, o valor atualizado após aditivos e os percentuais físico e
                financeiro.
              </p>
            </div>
            <Link
              href="/obras-atrasadas"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-800 hover:text-blue-950 shrink-0"
            >
              Ver todas as obras atrasadas e relatar problemas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {delayedWorks.slice(0, 3).map((work) => (
              <article
                key={work.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <DelaySeverityBadge delayMonths={work.schedule.delayMonths} />
                    <span className="text-xs font-medium text-slate-600">
                      {work.subprefecture}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900 leading-snug mb-2">
                    {work.name}
                  </h3>
                  <div className="text-xs text-slate-600 mb-4">
                    <strong>Empresa responsável:</strong> {work.companyName}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs mb-4">
                    <div>
                      <span className="text-slate-500 block">Conclusão prevista</span>
                      <strong className="font-mono text-sm text-rose-800">
                        Ano {work.schedule.expectedCompletionYear}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Prazo reprogramado</span>
                      <strong className="font-mono text-sm text-slate-900">
                        {formatDateBR(work.schedule.updatedEndDate)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Orçamento inicial</span>
                      <strong className="font-mono text-slate-800">
                        {formatCompactBRL(work.costs.initialBudget)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Valor atualizado</span>
                      <strong className="font-mono text-slate-900">
                        {formatCompactBRL(work.costs.updatedAmountAfterAmendments)}
                      </strong>
                    </div>
                  </div>

                  {/* Separação entre execução financeira e física (Regra 10) */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-600">Valor Pago (Financeiro)</span>
                        <span className="font-mono font-semibold text-slate-900">
                          {formatCompactBRL(work.costs.paidAmount)} ({work.costs.financialExecutionPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="bg-blue-700 h-full"
                          style={{ width: `${work.costs.financialExecutionPct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-600">Execução Física Medida</span>
                        <span className="font-mono font-semibold text-amber-900">
                          {work.costs.physicalExecutionPct !== null
                            ? `${work.costs.physicalExecutionPct}% (${formatCompactBRL(work.costs.physicalExecutedValue)})`
                            : "Indisponível"}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="bg-amber-600 h-full"
                          style={{ width: `${work.costs.physicalExecutionPct ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">
                    {work.schedule.currentStatus}
                  </span>
                  <Link
                    href={`/obras-atrasadas/${work.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-blue-900 transition-colors"
                  >
                    Acompanhar obra
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 5.5 Ranking de Problemas (Top 5 Contratações que Merecem Atenção) */}
        <section
          aria-labelledby="heading-ranking-problemas"
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-rose-800 font-semibold">
                <ShieldAlert className="w-4 h-4" />
                Seção 5.5 e Seção 10 • Últimos 6 Meses
              </div>
              <h2
                id="heading-ranking-problemas"
                className="font-display text-2xl font-bold text-slate-900 mt-1"
              >
                Contratações que Merecem Atenção (Top 5 Indicadores Objetivos)
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                Pontuação calculada exclusivamente por eventos documentados em fontes
                oficiais (atrasos, aditivos sucessivos, glosas, penalidades e
                apontamentos do TCM-SP). <strong>Não constitui declaração de ilegalidade.</strong>
              </p>
            </div>
            <Link
              href="/contratacoes-atencao"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-blue-900 transition-colors shrink-0"
            >
              Ver metodologia de pesos e evidências
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-200 mt-2">
            {attentionContracts.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 font-mono font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                    #{item.rankPosition}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-slate-700">
                        Contrato {item.contractNumber}
                      </span>
                      <span>•</span>
                      <span>{item.secretariat}</span>
                      <span>•</span>
                      <span>Último registro: {formatDateBR(item.lastRecordDate)}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-900 mt-0.5">
                      {item.simplifiedName}
                    </h3>
                    <div className="text-xs text-slate-600 mt-1">
                      <strong>Empresa:</strong> {item.companyName} ({item.companyCnpjFormatted})
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.primaryOccurrenceTypes.map((occ, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {occ}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex sm:items-center justify-between lg:justify-end gap-4 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <div className="text-[11px] text-slate-500 uppercase font-mono">
                      Valor Atualizado
                    </div>
                    <div className="font-mono text-base font-bold text-slate-900">
                      {formatBRL(item.currentContractValue)}
                    </div>
                    <div className="text-[11px] text-rose-800 font-medium">
                      {item.documentedOccurrencesCount} ocorrências • Índice:{" "}
                      <strong className="font-mono">{item.totalAttentionScore}/100 pts</strong>
                    </div>
                  </div>
                  <Link
                    href={`/contratacoes-atencao#${item.id}`}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50"
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
