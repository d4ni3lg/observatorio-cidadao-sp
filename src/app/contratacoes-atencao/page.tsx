import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Scale,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calculator,
} from "lucide-react";
import { DEMO_ATTENTION_CONTRACTS } from "@/lib/demo-data";
import { getAttentionContracts } from "@/lib/data-provider";
import { formatBRL, formatDateBR } from "@/lib/formatters";

const TEN_OBJECTIVE_INDICATORS = [
  { num: 1, name: "Atraso documentado na execução", maxPts: 15 },
  { num: 2, name: "Penalidades contratuais oficialmente registradas", maxPts: 15 },
  { num: 3, name: "Rescisão contratual documentada", maxPts: 15 },
  { num: 4, name: "Suspensão ou paralisação registrada", maxPts: 12 },
  { num: 5, name: "Aditivos com aumento relevante de valor", maxPts: 10 },
  { num: 6, name: "Aditivos de prazo sucessivos", maxPts: 8 },
  { num: 7, name: "Diferença entre valor inicialmente estimado e valor final", maxPts: 5 },
  { num: 8, name: "Inexecução parcial ou total oficialmente registrada", maxPts: 10 },
  { num: 9, name: "Determinações ou apontamentos de órgãos de controle", maxPts: 6 },
  { num: 10, name: "Ausência de atualização de informações obrigatórias", maxPts: 4 },
];

export default function ContratacoesAtencaoPage() {
  const attentionContracts = getAttentionContracts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Cabeçalho com Título Oficial exigido na Seção 10 */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-rose-800 font-semibold">
          <ShieldAlert className="w-4 h-4" />
          Módulo 10 • Monitoramento dos Últimos 6 Meses
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
          Contratações que merecem atenção
        </h1>
        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
          Identificação automatizada e auditável das cinco contratações municipais dos
          últimos seis meses com maiores indicadores objetivos de risco ou problemas
          contratuais documentados em bases oficiais.
        </p>
      </div>

      {/* Salvaguardas Jurídicas e Metodológicas Obrigatórias (Seção 10.1 e 10.3) */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4">
        <div className="flex items-start gap-3">
          <Scale className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
            <strong className="text-white text-sm block">
              Regras de Interpretação Pública e Reprodutibilidade (Seção 10.1 a 10.3):
            </strong>
            <p>
              • <strong>Indicador de atenção ≠ Condenação de ilegalidade:</strong> O
              Observatório jamais classifica automaticamente uma contratação como
              fraudulenta, ilegal ou irregular.
            </p>
            <p>
              • <strong>Aditivos e ausência de dados:</strong> Aumento de valor ou
              aditivo contratual isoladamente não significa irregularidade; a ausência
              de atualização obrigatória é contabilizada como alerta de transparência
              (máx. 4 pts) e não como prova de ilícito.
            </p>
            <p>
              • <strong>Zero opinião de IA na pontuação:</strong> O algoritmo soma
              exclusivamente pesos matemáticos determinísticos com evidência
              documental vinculada.
            </p>
          </div>
        </div>

        {/* Tabela dos 10 Indicadores Considerados (Seção 10.1) */}
        <div className="pt-3 border-t border-slate-800">
          <div className="text-xs font-mono uppercase text-amber-400 mb-3 flex items-center gap-1.5">
            <Calculator className="w-4 h-4" />
            Matriz Configurável dos 10 Indicadores Objetivos (Total Máximo: 100 pontos)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
            {TEN_OBJECTIVE_INDICATORS.map((ind) => (
              <div
                key={ind.num}
                className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700 flex flex-col justify-between"
              >
                <span className="text-slate-300 font-medium">
                  {ind.num}. {ind.name}
                </span>
                <span className="font-mono text-amber-300 font-bold mt-1.5 block">
                  Peso máx: {ind.maxPts} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exibição Detalhada das 5 Contratações (Seção 10.3) */}
      <div className="space-y-8">
        {attentionContracts.map((item) => (
          <article
            key={item.id}
            id={item.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
          >
            {/* Topo do Card */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-rose-900 text-white font-mono text-xs font-bold">
                    POSIÇÃO #{item.rankPosition} • INDICADOR DE ATENÇÃO
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-semibold">
                    Contrato: {item.contractNumber}
                  </span>
                  <span className="text-xs text-slate-500">
                    Último registro oficial: {formatDateBR(item.lastRecordDate)}
                  </span>
                  <span className="font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {item.isDemoData ? "[DEMO]" : "[BASE OFICIAL SIURB]"}
                  </span>
                </div>

                <div className="text-xs font-semibold uppercase tracking-wide text-blue-900">
                  {item.secretariat}
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  {item.simplifiedName}
                </h2>
                <div className="text-xs text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>
                    <strong>Empresa Responsável:</strong>{" "}
                    <Link
                      href={`/empresas/${item.companyCnpjFormatted.replace(/\D/g, "")}`}
                      className="text-blue-900 font-semibold hover:underline"
                    >
                      {item.companyName} ({item.companyCnpjFormatted})
                    </Link>
                  </span>
                </div>
              </div>

              <div className="flex sm:items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                <div>
                  <div className="text-[11px] font-mono uppercase text-slate-500">
                    Valor Contratual Atual
                  </div>
                  <div className="font-mono text-xl font-bold text-slate-900">
                    {formatBRL(item.currentContractValue)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Estimado inicial: {formatBRL(item.initialEstimatedValue)}
                  </div>
                </div>
                <div className="pl-4 border-l border-slate-200 text-center">
                  <div className="text-[11px] font-mono uppercase text-rose-800 font-bold">
                    Pontuação
                  </div>
                  <div className="font-mono text-2xl font-bold text-rose-900">
                    {item.totalAttentionScore}
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {item.documentedOccurrencesCount} ocorrências
                  </div>
                </div>
              </div>
            </div>

            {/* Explicação do motivo da inclusão (Seção 10.3) */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
              <strong className="text-amber-950 uppercase font-mono block">
                Explicação Objetiva do Motivo da Inclusão neste Painel:
              </strong>
              <p className="text-slate-800 leading-relaxed">
                {item.inclusionExplanation}
              </p>
            </div>

            {/* SEPARAÇÃO RIGOROSA DAS 4 CATEGORIAS EXIGIDAS NA SEÇÃO 10.3 */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase font-bold text-slate-700">
                Separação Estrita de Escopo das Ocorrências Registradas (Seção 10.3)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Ocorrências desta contratação */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>1. Ocorrências desta contratação específica</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 font-mono">
                      {item.separatedOccurrences.thisContractOccurrences.length}
                    </span>
                  </div>
                  {item.separatedOccurrences.thisContractOccurrences.map((occ, i) => (
                    <div key={i} className="p-2.5 rounded bg-white border border-slate-200">
                      <div className="font-medium text-slate-900">{occ.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Data: {formatDateBR(occ.date)} • Fonte: {occ.source}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Ocorrências de outros contratos da mesma empresa */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>2. Ocorrências em outros contratos da mesma empresa</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 font-mono">
                      {
                        item.separatedOccurrences.otherContractsSameCompanyOccurrences
                          .length
                      }
                    </span>
                  </div>
                  {item.separatedOccurrences.otherContractsSameCompanyOccurrences
                    .length === 0 ? (
                    <p className="text-slate-500">
                      Nenhuma ocorrência adicional registrada em outros contratos na
                      amostra.
                    </p>
                  ) : (
                    item.separatedOccurrences.otherContractsSameCompanyOccurrences.map(
                      (occ, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded bg-white border border-slate-200"
                        >
                          <div className="font-mono text-[11px] text-blue-900 font-semibold">
                            {occ.contractRef}
                          </div>
                          <div className="font-medium text-slate-900">{occ.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Data: {formatDateBR(occ.date)} • Fonte: {occ.source}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>

                {/* 3. Penalidades administrativas definitivas */}
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
                  <div className="font-bold text-rose-950 flex items-center justify-between">
                    <span>3. Penalidades administrativas definitivas</span>
                    <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-950 font-mono">
                      {item.separatedOccurrences.definitiveAdministrativePenalties.length}
                    </span>
                  </div>
                  {item.separatedOccurrences.definitiveAdministrativePenalties.length ===
                  0 ? (
                    <p className="text-slate-600">
                      Nenhuma penalidade administrativa definitiva registrada para este
                      contrato.
                    </p>
                  ) : (
                    item.separatedOccurrences.definitiveAdministrativePenalties.map(
                      (pen, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded bg-white border border-rose-200"
                        >
                          <div className="font-semibold text-rose-950">
                            {pen.penaltyType}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Data: {formatDateBR(pen.date)} • Abrangência: {pen.scope}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>

                {/* 4. Apontamentos ainda em análise */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                  <div className="font-bold text-amber-950 flex items-center justify-between">
                    <span>4. Apontamentos de controle ainda em análise</span>
                    <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 font-mono">
                      {
                        item.separatedOccurrences.controlOrganPointingsUnderAnalysis
                          .length
                      }
                    </span>
                  </div>
                  {item.separatedOccurrences.controlOrganPointingsUnderAnalysis
                    .length === 0 ? (
                    <p className="text-slate-600">
                      Nenhum apontamento pendente de análise no momento.
                    </p>
                  ) : (
                    item.separatedOccurrences.controlOrganPointingsUnderAnalysis.map(
                      (pt, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded bg-white border border-amber-200"
                        >
                          <div className="font-mono text-[11px] text-amber-900 font-bold">
                            {pt.organ} • Processo {pt.processRef}
                          </div>
                          <div className="text-slate-800 mt-0.5">{pt.summary}</div>
                          <div className="text-[11px] text-amber-900 font-medium mt-1">
                            Situação: {pt.status}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Memória de Cálculo Reproduzível dos Indicadores (Seção 10.2) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono uppercase font-bold text-slate-700">
                Memória de Cálculo Reproduzível (Pesos, Fontes e Evidências Documentais)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-mono uppercase text-[11px]">
                      <th className="py-2 pr-3">Indicador</th>
                      <th className="py-2 px-3">Pontos</th>
                      <th className="py-2 px-3">Critério Aplicado</th>
                      <th className="py-2 px-3">Fonte & Atualização</th>
                      <th className="py-2 pl-3">Evidência Documental</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {item.indicatorsBreakdown.map((ind) => (
                      <tr key={ind.indicatorNumber}>
                        <td className="py-2.5 pr-3 font-semibold text-slate-900">
                          #{ind.indicatorNumber} — {ind.indicatorName}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-800">
                          +{ind.weightPointsAwarded}/{ind.maxWeightPossible} pts
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {ind.calculationCriterion}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono">
                          {ind.sourceName} ({formatDateBR(ind.updatedAt)})
                        </td>
                        <td className="py-2.5 pl-3">
                          <a
                            href={ind.evidenceDocUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-800 font-semibold hover:underline"
                          >
                            {ind.evidenceDocTitle}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
