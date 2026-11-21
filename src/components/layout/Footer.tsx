import React from "react";
import Link from "next/link";
import { ExternalLink, Shield, Database, Scale, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Coluna 1: Identidade e Natureza */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-slate-800 text-white flex items-center justify-center font-mono font-bold text-sm border border-slate-700">
                OC<span className="text-amber-400">SP</span>
              </div>
              <span className="font-bold text-white text-base">
                Observatório Cidadão de SP
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma web independente de transparência, participação popular e
              fiscalização cidadã sobre licitações, contratos e obras públicas do
              Município de São Paulo.
            </p>
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
              <strong className="text-amber-400 block mb-1">
                Aviso Legal de Independência:
              </strong>
              Este projeto não representa a Prefeitura Municipal de São Paulo, não
              realiza licitações e não possui autoridade para aprovar, cancelar ou
              impedir contratações públicas.
            </div>
          </div>

          {/* Coluna 2: Navegação Estrutural */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Módulos da Plataforma
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  1. Visão Geral e Indicadores
                </Link>
              </li>
              <li>
                <Link href="/licitacoes" className="hover:text-white transition-colors">
                  2. Licitações Publicadas e Planejamento (PCA)
                </Link>
              </li>
              <li>
                <Link href="/empresas" className="hover:text-white transition-colors">
                  3. Ranking de Percepção Popular de Empresas
                </Link>
              </li>
              <li>
                <Link href="/obras-atrasadas" className="hover:text-white transition-colors">
                  4. Obras Públicas com Atraso Documentado (2021–2026)
                </Link>
              </li>
              <li>
                <Link href="/contratacoes-atencao" className="hover:text-white transition-colors">
                  5. Contratações que Merecem Atenção (Top 5)
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="hover:text-white transition-colors">
                  6. Como Funciona, Algoritmo e Regras de IA
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-white transition-colors">
                  7. Sobre o Projeto, LGPD e Direito de Resposta
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Fontes Oficiais de Dados */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Fontes Oficiais Primárias
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://pncp.gov.br/api/consulta/swagger-ui/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  API do PNCP (Contratações e Atas)
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://portal.tcm.sp.gov.br/Pagina/78382"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  Dados Abertos TCM-SP (Fiscalização)
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://obrasabertas.prefeitura.sp.gov.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  Portal Obras Abertas PMSP
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://dados.prefeitura.sp.gov.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  Dados Abertos do Município de SP
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://transparencia.prefeitura.sp.gov.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  Portal da Transparência Municipal
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  Lei de Licitações nº 14.133/2021
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Privacidade, LGPD e ANPD */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Proteção de Dados (LGPD)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Nenhum CPF é armazenado em texto aberto nem exibido publicamente. A
              verificação de identidade segue os padrões de pseudonimização e o{" "}
              <a
                href="https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-slate-200 hover:text-white"
              >
                Guia de Segurança da ANPD
              </a>
              .
            </p>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-500" />
                <span>Canal do Titular de Dados e Direito de Resposta</span>
              </div>
              <div>
                <Link
                  href="/sobre#direito-resposta"
                  className="text-blue-400 hover:underline font-medium"
                >
                  Solicitar correção factual ou manifestação empresarial →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            Observatório Cidadão de São Paulo • Versão 1.0 (Novembro de 2026) • Escopo Exclusivo: Município de São Paulo
          </div>
          <div className="font-mono text-[11px] text-emerald-400/90">
            [FASE 2: INTEGRAÇÃO DE DADOS OFICIAIS ATIVA (PNCP, DADOS ABERTOS SP, SIURB E TCM-SP)]
          </div>
        </div>
      </div>
    </footer>
  );
}
