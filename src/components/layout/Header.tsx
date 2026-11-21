"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Menu,
  X,
  UserCheck,
  AlertTriangle,
  Info,
  Scale,
  CheckCircle2,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Início", href: "/" },
  { label: "Licitações", href: "/licitacoes" },
  { label: "Empresas", href: "/empresas" },
  { label: "Obras atrasadas", href: "/obras-atrasadas" },
  { label: "Ranking de problemas", href: "/contratacoes-atencao" },
  { label: "Como funciona", href: "/como-funciona" },
  { label: "Sobre o projeto", href: "/sobre" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {/* Faixa permanente de independência institucional e identificação explícita da Fase 1 */}
      <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Plataforma Cidadã Independente:</strong> Este observatório{" "}
              <span className="underline decoration-amber-400/80">
                não pertence nem representa a Prefeitura de São Paulo
              </span>{" "}
              e não possui efeito jurídico sobre licitações.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              FASE 2: BASES OFICIAIS INTEGRADAS
            </span>
          </div>
        </div>
      </div>

      {/* Barra principal de navegação */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Identidade Visual Editorial */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-lg tracking-tighter shadow-sm group-hover:bg-blue-900 transition-colors">
              OC<span className="text-amber-400">SP</span>
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base leading-tight tracking-tight">
                Observatório Cidadão
              </div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                São Paulo • Fiscalização Pública
              </div>
            </div>
          </Link>

          {/* Menu Principal Desktop (7 itens obrigatórios da Seção 4) */}
          <nav
            aria-label="Navegação Principal"
            className="hidden xl:flex items-center gap-1"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Acesso à conta do usuário no cabeçalho (Seção 4) */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link
              href="/admin"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
              title="Painel Administrativo e Auditoria"
            >
              Painel Admin
            </Link>
            <Link
              href="/conta"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-900 text-white hover:bg-slate-900 transition-colors shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-emerald-300" />
              <span>Conta Cidadã (CPF)</span>
            </Link>
          </div>

          {/* Botão Mobile */}
          <div className="flex xl:hidden items-center gap-2">
            <Link
              href="/conta"
              className="inline-flex md:hidden items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-blue-900 text-white"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Conta</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900"
              aria-expanded={mobileOpen}
              aria-label="Abrir menu de navegação"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Responsivo */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5 shadow-lg">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-3 mt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
            <Link
              href="/conta"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-900 text-white"
            >
              <ShieldCheck className="w-4 h-4" />
              Acessar Conta Verificada (CPF)
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-300 text-slate-700"
            >
              <Info className="w-4 h-4" />
              Painel Administrativo & Auditoria
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
