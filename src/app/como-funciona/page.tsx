import React from "react";
import {
  Database,
  Bot,
  ShieldCheck,
  RefreshCw,
  Scale,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

const OFFICIAL_SOURCES = [
  {
    code: "Fonte 1: PNCP",
    name: "Portal Nacional de Contratações Públicas",
    url: "https://pncp.gov.br/api/consulta/swagger-ui/index.html",
    frequency: "A cada 6 horas (Licitações futuras) / Diária (Contratos e Atas)",
    dataCollected:
      "Editais, datas de recebimento de propostas, sessões agendadas, valores estimados, propostas abertas, atas, lances, resultados e Plano de Contratações Anual (PCA).",
  },
  {
    code: "Fonte 2: TCM-SP",
    name: "Tribunal de Contas do Município de São Paulo — Dados Abertos",
    url: "https://portal.tcm.sp.gov.br/Pagina/78382",
    frequency: "Diária",
    dataCollected:
      "Execução orçamentária, empenhos, liquidações, pagamentos, fiscalizações de obras e apontamentos técnicos colegiados.",
  },
  {
    code: "Fonte 3: Obras Abertas",
    name: "Portal Obras Abertas da Prefeitura de São Paulo",
    url: "https://obrasabertas.prefeitura.sp.gov.br/",
    frequency: "Diária / Semanal conforme atualização oficial",
    dataCollected:
      "Localização georreferenciada, subprefeituras, empresas contratadas, datas previstas/atualizadas, medições físicas e fotografias oficiais.",
  },
  {
    code: "Fonte 4: Dados Abertos SP",
    name: "Portal de Dados Abertos da Prefeitura de São Paulo",
    url: "https://dados.prefeitura.sp.gov.br/",
    frequency: "Diária",
    dataCollected:
      "Bases estruturadas de contratos, termos aditivos, despesas, secretarias e equipamentos públicos.",
  },
  {
    code: "Fonte 5: Transparência SP",
    name: "Portal da Transparência Municipal de São Paulo",
    url: "https://transparencia.prefeitura.sp.gov.br/",
    frequency: "Diária",
    dataCollected:
      "Detalhamento de execução financeira, aditivos contratuais e sanções contratuais municipais.",
  },
  {
    code: "Fonte 6: CEIS e CNEP",
    name: "Cadastros Nacionais de Empresas Inidôneas, Suspensas e Punidas",
    url: "https://portaldatransparencia.gov.br/sancoes",
    frequency: "Diária",
    dataCollected:
      "Verificação de sanções administrativas vigentes vinculadas por CNPJ completo de 14 dígitos, respeitando a abrangência e vigência de cada registro.",
  },
];

const AI_MANDATORY_RULES = [
  "1. Não inventar dados sob nenhuma hipótese.",
  "2. Não criar datas inexistentes.",
  "3. Não inventar nem estimar valores ausentes ou sob sigilo legal.",
  "4. Não afirmar irregularidade sem evidência documental oficial.",
  "5. Não confundir suspeita ou apontamento em análise com comprovação.",
  "6. Citar obrigatoriamente o documento oficial de origem em cada resposta.",
  "7. Identificar expressamente quando uma informação estiver ausente.",
  "8. Informar quando o resumo não puder ser produzido com segurança.",
  "9. Jamais utilizar comentários de usuários como fonte de fatos administrativos.",
  "10. Jamais alterar diretamente registros oficiais importados das APIs.",
];

export default function ComoFuncionaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-red-700 font-semibold">
          Seção 6 do Menu Principal • Metodologia, Fontes, IA e Segurança
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
          Como funciona o Observatório Cidadão de São Paulo
        </h1>
        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
          Conheça em detalhes de onde vêm os dados, com qual frequência são
          atualizados, como a Inteligência Artificial resume editais sem inventar
          informações e como garantimos a proteção do seu CPF conforme a LGPD e o Guia
          da ANPD.
        </p>
      </div>

      {/* 1. As 6 Fontes Oficiais e Frequência de Sincronização (Seção 11) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <Database className="w-6 h-6 text-red-700" />
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              1. Fontes Oficiais Prioritárias e Estratégia de Sincronização (Seção 11)
            </h2>
            <p className="text-xs text-slate-500">
              Nenhuma fonte não verificada é utilizada para alimentar indicadores
              factuais. Registros históricos nunca são apagados caso deixem de aparecer
              em uma consulta recente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {OFFICIAL_SOURCES.map((src) => (
            <div
              key={src.code}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-red-700 text-white font-mono text-xs font-bold">
                    {src.code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800">
                    <RefreshCw className="w-3 h-3" />
                    {src.frequency.split(" ")[0]}
                  </span>
                </div>
                <h3 className="font-display font-bold text-sm text-slate-900">
                  {src.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {src.dataCollected}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 space-y-1.5 text-xs">
                <div className="text-[11px] text-slate-500">
                  <strong>Frequência:</strong> {src.frequency}
                </div>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-red-700 hover:underline"
                >
                  Acessar portal/documentação oficial
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Governança de Inteligência Artificial (Seção 12) */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <Bot className="w-6 h-6 text-emerald-700" />
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              2. As 10 Regras Obrigatórias da Inteligência Artificial (Seção 12)
            </h2>
            <p className="text-xs text-slate-500">
              A IA funciona exclusivamente como ferramenta de interpretação e tradução
              cidadã, jamais como autoridade de julgamento.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {AI_MANDATORY_RULES.map((rule) => (
            <div
              key={rule}
              className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-center gap-2.5 text-slate-800 font-medium"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Identificação por CPF, LGPD e Guia ANPD (Seção 7.1 e 14) */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="font-display text-xl font-bold">
              3. Verificação por CPF, Pseudonimização e Conformidade LGPD / ANPD
            </h2>
            <p className="text-xs text-slate-300">
              Como impedimos votos duplicados e bots sem jamais expor nem armazenar o
              CPF em texto aberto.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
            <strong className="text-amber-300 block text-sm">
              Zero CPF em Texto Aberto
            </strong>
            <p className="text-slate-300 leading-relaxed">
              O banco de dados armazena exclusivamente um identificador criptográfico
              irreversível (`pseudonymized_cpf_token` via HMAC-SHA256 com segredo de
              hardware) e o token do provedor de verificação. O CPF nunca é exibido
              publicamente nem usado como ID de URL.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
            <strong className="text-emerald-300 block text-sm">
              CPF ≠ Comprovação Automática de Residência
            </strong>
            <p className="text-slate-300 leading-relaxed">
              Conforme a Seção 7.1, o sistema não presume que o número de CPF
              isoladamente comprova domicílio no Município de São Paulo. Caso uma
              votação exija restrição territorial, um fator adicional de comprovação é
              acionado.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
            <strong className="text-blue-300 block text-sm">
              Trava Pré-Produção Obrigatória
            </strong>
            <p className="text-slate-300 leading-relaxed">
              A votação real em produção só é ativada após validação jurídica formal da
              base legal, Relatório de Impacto à Proteção de Dados Pessoais (RIPD) e
              conformidade com o{" "}
              <a
                href="https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-white"
              >
                Guia de Segurança da ANPD
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
