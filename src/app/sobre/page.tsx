import React from "react";
import { Scale, CheckCircle2, XCircle, Shield, Mail } from "lucide-react";

const FUNDAMENTAL_OBJECTIVES = [
  "1. Centralizar as informações públicas sobre licitações municipais.",
  "2. Apresentar os dados em linguagem simples.",
  "3. Dar destaque aos valores envolvidos nas contratações.",
  "4. Mostrar empresas participantes e suas propostas, quando publicamente disponíveis.",
  "5. Apresentar o histórico de lances das disputas.",
  "6. Permitir que cidadãos votem utilizando identidade verificada por CPF.",
  "7. Criar rankings populares das empresas participantes.",
  "8. Identificar obras públicas municipais com atrasos documentados nos últimos cinco anos.",
  "9. Criar páginas individuais para acompanhamento de cada obra atrasada.",
  "10. Identificar contratações com indicadores relevantes de risco, irregularidades documentadas ou problemas contratuais.",
  "11. Automatizar a atualização das informações utilizando fontes oficiais.",
  "12. Transformar os dados em relatórios públicos que possam ser compartilhados.",
];

export default function SobrePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-blue-800 font-semibold">
          Seção 7 do Menu Principal • Identidade Institucional, Escopo e Governança
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
          Sobre o Observatório Cidadão de São Paulo
        </h1>
        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
          O Observatório Cidadão de São Paulo é uma plataforma web independente de
          transparência, participação popular e fiscalização cidadã criada para
          aproximar moradores de São Paulo do acompanhamento dos gastos públicos
          municipais.
        </p>
      </div>

      {/* Natureza Independente e Limites Institucionais (Seção 1 e Seção 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900">
            <Scale className="w-6 h-6 text-blue-800" />
            <h2 className="font-display text-xl font-bold">
              Independência Institucional (Seção 1)
            </h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Este projeto foi construído <strong>para o cidadão, e não para a Administração Pública</strong>.
            O Observatório não representa a Prefeitura Municipal de São Paulo, não
            realiza licitações e não possui autoridade jurídica ou administrativa para
            aprovar, suspender, cancelar ou impedir contratações.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <strong className="text-slate-900 block">
              Recorte Temporal Inicial (Seção 2.1 e Seção 9):
            </strong>
            <p className="text-slate-600">
              • <strong>Licitações futuras e Planejamento (PCA):</strong> 07/11/2026 até
              30/06/2027.
            </p>
            <p className="text-slate-600">
              • <strong>Obras públicas com atraso documentado:</strong> 07/11/2021 até
              07/11/2026 (cinco anos).
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Escopo Institucional Estrito (Seção 2)
          </h2>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Incluído:</strong> Exclusivamente Prefeitura Municipal de São
                Paulo (Administração Direta e entidades municipais abrangidas pelo
                escopo de dados).
              </span>
            </div>
            <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200 text-rose-950 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <span>
                <strong>Não incluído inicialmente:</strong> Governo do Estado de São
                Paulo, Governo Federal (exceto como provedor de APIs nacionais como o
                PNCP e CEIS/CNEP), prefeituras de outros municípios e empresas privadas.
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Os 12 Objetivos Fundamentais (Seção 1.1) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
        <h2 className="font-display text-xl font-bold text-slate-900">
          Os 12 Objetivos Fundamentais do Produto (Seção 1.1)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {FUNDAMENTAL_OBJECTIVES.map((obj) => (
            <div
              key={obj}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800"
            >
              {obj}
            </div>
          ))}
        </div>
      </section>

      {/* Canal de Titulares de Dados (LGPD) e Direito de Resposta Empresarial (Seção 8.3 e 14) */}
      <section
        id="direito-resposta"
        className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-amber-400" />
          <h2 className="font-display text-xl font-bold">
            Canal do Titular de Dados (LGPD) e Solicitação de Correção Factual
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Em cumprimento à Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e às
          regras de governança da Seção 14, qualquer cidadão titular de dados ou
          representante legal de empresa fornecedora pode solicitar confirmação de
          tratamento, revogação de conta, exclusão de dados pessoais ou retificação de
          informações factuais mediante comprovação documental oficial.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-amber-300">
          <span className="inline-flex items-center gap-1.5">
            <Mail className="w-4 h-4" />
            Canal Demonstrativo do Encarregado (DPO) e Ouvidoria Documental:
            governanca@observatoriocidadaosp.org.br
          </span>
        </div>
      </section>
    </div>
  );
}
