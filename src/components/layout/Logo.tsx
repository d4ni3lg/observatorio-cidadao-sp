"use client";

import React, { useState, useEffect } from "react";
import { useOnlineStatus } from "@/lib/pwa/useOnlineStatus";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  offline?: boolean; // Permite forçar o estado de farol apagado
}

export function Logo({
  className = "",
  variant = "full",
  size = "md",
  offline,
}: LogoProps) {
  const { isOffline: hookOffline } = useOnlineStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Se 'offline' foi passado explicitamente usa ele; senão usa o hook quando montado no cliente
  const isFarolApagado = offline !== undefined ? offline : mounted && hookOffline;

  const iconDimensions = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }[size];

  const titleSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }[size];

  const subSizes = {
    sm: "text-[9px]",
    md: "text-[11px]",
    lg: "text-xs",
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Ícone: Farol da Transparência Paulista (Aceso ou Apagado) */}
      <div
        className={`relative ${iconDimensions} shrink-0 drop-shadow-md group-hover:scale-105 transition-all duration-300`}
        title={isFarolApagado ? "Farol Apagado • Sem conexão com a internet" : "Farol Cidadão • Iluminando os gastos públicos de SP"}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transition-colors duration-300"
        >
          {/* Fundo do emblema: Squircle escuro */}
          <rect width="48" height="48" rx="12" fill={isFarolApagado ? "#18181B" : "#09090B"} />
          <rect
            x="0.75"
            y="0.75"
            width="46.5"
            height="46.5"
            rx="11.25"
            stroke={isFarolApagado ? "#52525B" : "#DC2626"}
            strokeWidth="1.5"
            strokeOpacity={isFarolApagado ? "0.6" : "0.4"}
          />

          {/* Feixes de Luz da Transparência Cívica (Apenas quando online/aceso) */}
          {!isFarolApagado && (
            <>
              <path
                d="M24 15L46 5V27L24 15Z"
                fill="url(#beam-right)"
                opacity="0.45"
              />
              <path
                d="M24 15L2 6V26L24 15Z"
                fill="url(#beam-left)"
                opacity="0.25"
              />
            </>
          )}

          {/* Base / Rochedo do Farol */}
          <path
            d="M13 41H35L33 37H15L13 41Z"
            fill={isFarolApagado ? "#27272A" : "#27272A"}
          />

          {/* Torre do Farol (Listras Paulistas: Preto, Vermelho e Branco) */}
          {/* Faixa 1 (Inferior): Grafite escuro com porta de entrada */}
          <path
            d="M15.5 37L16.8 31H31.2L32.5 37H15.5Z"
            fill="#18181B"
          />
          <rect
            x="22.5"
            y="33"
            width="3"
            height="4"
            rx="1"
            fill={isFarolApagado ? "#71717A" : "#DC2626"}
          />

          {/* Faixa 2 (Central): Vermelho Paulista (ou desbotado se offline) */}
          <path
            d="M16.8 31L18.2 24H29.8L31.2 31H16.8Z"
            fill={isFarolApagado ? "#991B1B" : "#DC2626"}
          />
          {/* Janela circular do farol */}
          <circle cx="24" cy="27.5" r="1.3" fill={isFarolApagado ? "#A1A1AA" : "#FFFFFF"} />

          {/* Faixa 3 (Superior): Branco Puro */}
          <path
            d="M18.2 24L19.5 18H28.5L29.8 24H18.2Z"
            fill={isFarolApagado ? "#D4D4D8" : "#F8FAFC"}
          />

          {/* Plataforma / Varanda do Farol */}
          <rect
            x="17"
            y="16.5"
            width="14"
            height="2"
            rx="0.5"
            fill="#18181B"
            stroke={isFarolApagado ? "#52525B" : "#DC2626"}
            strokeWidth="0.8"
          />

          {/* Lanterna do Farol: Aceso (Dourado/Amarelo) vs. Apagado (Cinza Escuro) */}
          {isFarolApagado ? (
            /* FAROL APAGADO (OFFLINE) */
            <>
              <rect x="20" y="11.5" width="8" height="5.5" rx="1" fill="#27272A" />
              <rect x="21" y="12" width="6" height="4.5" rx="0.5" fill="#3F3F46" />
              <line x1="24" y1="11.5" x2="24" y2="17" stroke="#52525B" strokeWidth="1" />
              {/* Lâmpada fria / filamento apagado */}
              <circle cx="24" cy="14" r="1.8" fill="#52525B" />
              {/* Cúpula do farol apagado */}
              <path d="M19 12C19 8.5 24 7 24 7C24 7 29 8.5 29 12H19Z" fill="#52525B" />
              <circle cx="24" cy="6.5" r="1.2" fill="#71717A" />
            </>
          ) : (
            /* FAROL ACESO (ONLINE) */
            <>
              <rect x="20" y="11.5" width="8" height="5.5" rx="1" fill="#FBBF24" />
              <rect x="21" y="12" width="6" height="4.5" rx="0.5" fill="#FEF08A" />
              <line x1="24" y1="11.5" x2="24" y2="17" stroke="#B91C1C" strokeWidth="1" />
              {/* Ponto focal de brilho máximo da lâmpada */}
              <circle cx="24" cy="14" r="2.2" fill="#FFFFFF" />
              {/* Cúpula do Farol em Vermelho Paulista */}
              <path d="M19 12C19 8.5 24 7 24 7C24 7 29 8.5 29 12H19Z" fill="#DC2626" />
              <circle cx="24" cy="6.5" r="1.2" fill="#FBBF24" />
            </>
          )}

          {/* Definições de Gradientes do Feixe de Luz */}
          <defs>
            <linearGradient id="beam-right" x1="24" y1="15" x2="48" y2="16" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" stopOpacity="0.9" />
              <stop offset="0.4" stopColor="#F59E0B" stopOpacity="0.4" />
              <stop offset="1" stopColor="#DC2626" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="beam-left" x1="24" y1="15" x2="0" y2="16" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" stopOpacity="0.7" />
              <stop offset="1" stopColor="#DC2626" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Glow dourado ao redor da luz (apenas quando aceso) */}
        {!isFarolApagado && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-400/20 rounded-full blur-sm -z-10" />
        )}
      </div>

      {variant === "full" && (
        <div className="flex flex-col">
          <div
            className={`font-black text-neutral-900 ${titleSizes} leading-tight tracking-tight flex items-center gap-1.5`}
          >
            <span>FAROL</span>
            <span className={isFarolApagado ? "text-neutral-500 font-black" : "text-red-700 font-black"}>
              CIDADÃO
            </span>
            {isFarolApagado && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700 animate-pulse">
                FAROL APAGADO
              </span>
            )}
          </div>
          <div
            className={`${subSizes} font-bold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5`}
          >
            <span
              className={`inline-block w-2 h-0.5 ${isFarolApagado ? "bg-neutral-400" : "bg-red-600"}`}
            ></span>
            <span>SÃO PAULO</span>
            <span className="text-neutral-300">•</span>
            <span className="text-neutral-500 font-medium">
              {isFarolApagado ? "Modo Offline • Contingência" : "Transparência Pública"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
