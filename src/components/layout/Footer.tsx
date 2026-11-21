import React from "react";
import Link from "next/link";
import { ExternalLink, Shield, Database, Scale, FileText, Lock } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-red-950/60 mt-20 pb-24 xl:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Coluna 1: Identidade e Natureza */}
          <div className="space-y-4">
            <Logo size="sm" />
            <p className="text-xs text-neutral-400 leading-relaxed">
              Plataforma independente de transparência pública, controle social e
              fiscalização cívica sobre editais, contratos e obras no
              Município de São Paulo.
            </p>
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 shadow-inner">
              <strong className="text-red-400 block mb-1 font-semibold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                Aviso Legal de Independência:
              </strong>
              Este projeto é de iniciativa cívica independente, não pertence ao Governo do Estado ou Prefeitura de São Paulo e não possui efeitos jurídicos sobre processos licitatórios.
            </div>
          </div>

          {/* Coluna 2: Navegação Estrutural */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-500" />
              Módulos da Plataforma
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-red-400 transition-colors">
                  1. Visão Geral e Indicadores Cívicos
                </Link>
              </li>
              <li>
                <Link href="/licitacoes" className="hover:text-red-400 transition-colors">
                  2. Licitações e Planejamento (PCA)
                </Link>
              </li>
              <li>
                <Link href="/empresas" className="hover:text-red-400 transition-colors">
                  3. Ranking de Percepção de Empresas
                </Link>
              </li>
              <li>
                <Link href="/obras-atrasadas" className="hover:text-red-400 transition-colors">
                  4. Obras Públicas com Atraso Documentado
                </Link>
              </li>
              <li>
                <Link href="/contratacoes-atencao" className="hover:text-red-400 transition-colors">
                  5. Contratações com Indicadores de Atenção
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="hover:text-red-400 transition-colors">
                  6. Como Funciona, Algoritmo e Regras
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-red-400 transition-colors">
                  7. Sobre o Projeto, LGPD e Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Fontes Oficiais de Dados */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-red-500" />
              Fontes Oficiais Primárias
            </h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <a
                  href="https://pncp.gov.br/api/consulta/swagger-ui/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  Portal Nacional de Contratações (PNCP)
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
                  Tribunal de Contas do Município (TCM-SP)
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
                  Portal de Dados Abertos de SP
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
                  Portal da Transparência de SP
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
                  Nova Lei de Licitações (Lei 14.133/2021)
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Privacidade, LGPD e Segurança */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-red-500" />
              Segurança & LGPD
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-3">
              Nenhum CPF é armazenado em texto aberto. Utilizamos tokenização HMAC-SHA256 irreversível, anonimização e conformidade com o{" "}
              <a
                href="https://www.gov.br/anpd/pt-br"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-neutral-200 hover:text-white"
              >
                Guia de Segurança da ANPD
              </a>
              .
            </p>
            <div className="space-y-1.5 text-[11px] text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-red-400" />
                <span>Canal do Titular e Direito de Resposta:</span>
              </div>
              <div>
                <Link
                  href="/sobre#direito-resposta"
                  className="text-red-400 hover:underline font-semibold"
                >
                  Manifestação empresarial ou correção factual →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <div className="flex items-center gap-2">
            <span>Farol Cidadão de São Paulo • Versão 1.5.1 • PWA & Controle Social Paulista</span>
            <Link
              href="/admin"
              className="text-neutral-800 hover:text-neutral-500 transition-colors inline-flex items-center"
              title="Acesso Restrito ao Sistema"
              aria-label="Acesso Restrito"
            >
              <Lock className="w-3 h-3 opacity-30 hover:opacity-100" />
            </Link>
          </div>
          <div className="font-mono text-[11px] text-red-500/80">
            [SEGURANÇA REFORÇADA • RATE LIMITING • CRIPTOGRAFIA HMAC • LGPD]
          </div>
        </div>
      </div>
    </footer>
  );
}
