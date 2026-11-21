"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Menu,
  X,
  UserCheck,
  Scale,
  CheckCircle2,
  FileText,
  Building2,
  AlertOctagon,
  TrendingDown,
  HelpCircle,
  Info,
  Bell,
} from "lucide-react";
import { Logo } from "./Logo";
import { NotificationCenterModal } from "@/components/pwa/NotificationCenterModal";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";

const NAV_ITEMS = [
  { label: "Início", href: "/", icon: null },
  { label: "Licitações", href: "/licitacoes", icon: FileText },
  { label: "Empresas", href: "/empresas", icon: Building2 },
  { label: "Obras atrasadas", href: "/obras-atrasadas", icon: AlertOctagon },
  { label: "Ranking de atenção", href: "/contratacoes-atencao", icon: TrendingDown },
  { label: "Como funciona", href: "/como-funciona", icon: HelpCircle },
  { label: "Sobre o projeto", href: "/sobre", icon: Info },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  // Fecha o menu mobile automaticamente ao trocar de rota
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Bloqueia rolagem do body quando o menu mobile está aberto
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      {/* Notificação Fixa de Modo Offline (visível se sem conexão ou teste simulado) */}
      <OfflineBanner />

      {/* Faixa permanente de independência institucional com estilo cívico paulista */}
      <div className="bg-neutral-950 text-neutral-100 text-xs py-2 px-4 border-b border-red-900/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="leading-tight">
              <strong className="text-white">Plataforma Cidadã Independente:</strong> Este observatório{" "}
              <span className="underline decoration-red-500/80 font-medium">
                não pertence nem representa o governo ou prefeitura
              </span>{" "}
              e não possui efeito jurídico sobre licitações.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-red-950/80 text-red-300 border border-red-700/50">
              <CheckCircle2 className="w-3 h-3 text-red-400" />
              SÃO PAULO • DADOS OFICIAIS
            </span>
          </div>
        </div>
      </div>

      {/* Barra principal de navegação */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo Oficial Paulista */}
          <Link href="/" className="group py-1 shrink-0">
            <Logo size="md" />
          </Link>

          {/* Menu Principal Desktop */}
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
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-neutral-900 text-white shadow-sm border-b-2 border-red-600"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Acesso à conta e alertas cívicos */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setAlertsOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-950 border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
              title="Central de Alertas Cívicos e Notificações Nativas"
            >
              <Bell className="w-3.5 h-3.5 text-red-600" />
              <span>Alertas</span>
            </button>
            <Link
              href="/conta"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-red-700 hover:bg-red-800 text-white transition-all shadow-sm border border-red-800 active:scale-95"
            >
              <UserCheck className="w-4 h-4 text-white" />
              <span>Conta Cidadã (CPF)</span>
            </Link>
          </div>

          {/* Botões Mobile (Entrar + Alertas + Hamburger) */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setAlertsOpen(true)}
              className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 border border-neutral-300 flex items-center justify-center"
              title="Alertas Cívicos"
              aria-label="Abrir Alertas Cívicos"
            >
              <Bell className="w-4 h-4 text-red-600" />
            </button>
            <Link
              href="/conta"
              className="inline-flex md:hidden items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-red-700 text-white shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-lg text-neutral-800 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors"
              aria-expanded={mobileOpen}
              aria-label="Abrir menu de navegação"
            >
              {mobileOpen ? <X className="w-6 h-6 text-red-700" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer / Menu Mobile com Overlay suave */}
      {mobileOpen && (
        <div className="xl:hidden fixed inset-0 top-[105px] z-50 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white border-b border-neutral-200 px-5 pt-4 pb-8 space-y-2 shadow-2xl max-h-[calc(100vh-105px)] overflow-y-auto">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-3 pb-1">
              Menu de Navegação
            </div>

            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-red-50 text-red-700 border-l-4 border-red-700 font-bold"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${isActive ? "text-red-700" : "text-neutral-500"}`} />}
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-neutral-200 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setAlertsOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-neutral-300 text-neutral-800 hover:bg-neutral-50"
              >
                <Bell className="w-4 h-4 text-red-600" />
                Central de Alertas & Notificações Nativas
              </button>
              <Link
                href="/conta"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold bg-red-700 text-white shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                Acessar Conta Verificada por CPF
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal da Central de Notificações Cívicas */}
      <NotificationCenterModal isOpen={alertsOpen} onClose={() => setAlertsOpen(false)} />
    </header>
  );
}
