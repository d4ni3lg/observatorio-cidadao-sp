"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Building2,
  AlertOctagon,
  UserCheck,
} from "lucide-react";

const MOBILE_NAV_ITEMS = [
  { label: "Início", href: "/", icon: Home },
  { label: "Licitações", href: "/licitacoes", icon: FileText },
  { label: "Empresas", href: "/empresas", icon: Building2 },
  { label: "Obras", href: "/obras-atrasadas", icon: AlertOctagon },
  { label: "Conta", href: "/conta", icon: UserCheck },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
      <nav aria-label="Navegação Rápida Mobile" className="grid grid-cols-5 h-16 max-w-md mx-auto px-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-all relative py-1 text-xs select-none active:scale-95 ${
                isActive
                  ? "text-red-700 font-bold"
                  : "text-neutral-500 hover:text-neutral-800 font-medium"
              }`}
            >
              <div
                className={`w-9 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isActive ? "bg-red-50 text-red-700" : "text-neutral-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
              </div>
              <span className="text-[10px] tracking-tight leading-none truncate max-w-[56px] text-center">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-1 w-1.5 h-1.5 bg-red-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
