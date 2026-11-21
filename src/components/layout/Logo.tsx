import React from "react";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", variant = "full", size = "md" }: LogoProps) {
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
      {/* Ícone: Farol da Transparência Paulista */}
      <div className={`relative ${iconDimensions} shrink-0 drop-shadow-md group-hover:scale-105 transition-transform`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Fundo do emblema: Squircle preto nobre com borda de precisão */}
          <rect width="48" height="48" rx="12" fill="#09090B" />
          <rect
            x="0.75"
            y="0.75"
            width="46.5"
            height="46.5"
            rx="11.25"
            stroke="#DC2626"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Feixes de Luz da Transparência Cívica (Iluminando a escuridão) */}
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

          {/* Base / Rochedo do Farol */}
          <path
            d="M13 41H35L33 37H15L13 41Z"
            fill="#27272A"
          />

          {/* Torre do Farol (Listras Paulistas: Preto, Vermelho e Branco) */}
          {/* Faixa 1 (Inferior): Grafite escuro com porta de entrada */}
          <path
            d="M15.5 37L16.8 31H31.2L32.5 37H15.5Z"
            fill="#18181B"
          />
          <rect x="22.5" y="33" width="3" height="4" rx="1" fill="#DC2626" />

          {/* Faixa 2 (Central): Vermelho Paulista */}
          <path
            d="M16.8 31L18.2 24H29.8L31.2 31H16.8Z"
            fill="#DC2626"
          />
          {/* Janela circular do farol */}
          <circle cx="24" cy="27.5" r="1.3" fill="#FFFFFF" />

          {/* Faixa 3 (Superior): Branco Puro de Alto Contraste */}
          <path
            d="M18.2 24L19.5 18H28.5L29.8 24H18.2Z"
            fill="#F8FAFC"
          />

          {/* Plataforma / Varanda do Farol */}
          <rect
            x="17"
            y="16.5"
            width="14"
            height="2"
            rx="0.5"
            fill="#18181B"
            stroke="#DC2626"
            strokeWidth="0.8"
          />

          {/* Lanterna Luminosa (A Luz da Fiscalização) */}
          <rect x="20" y="11.5" width="8" height="5.5" rx="1" fill="#FBBF24" />
          <rect x="21" y="12" width="6" height="4.5" rx="0.5" fill="#FEF08A" />
          <line x1="24" y1="11.5" x2="24" y2="17" stroke="#B91C1C" strokeWidth="1" />

          {/* Ponto focal de brilho máximo da lâmpada */}
          <circle cx="24" cy="14" r="2.2" fill="#FFFFFF" />

          {/* Cúpula do Farol em Vermelho Paulista */}
          <path
            d="M19 12C19 8.5 24 7 24 7C24 7 29 8.5 29 12H19Z"
            fill="#DC2626"
          />
          <circle cx="24" cy="6.5" r="1.2" fill="#FBBF24" />

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

        {/* Glow dourado/vermelho sutil ao redor da luz */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-400/20 rounded-full blur-sm -z-10" />
      </div>

      {variant === "full" && (
        <div className="flex flex-col">
          <div className={`font-black text-neutral-900 ${titleSizes} leading-tight tracking-tight flex items-center gap-1.5`}>
            <span>FAROL</span>
            <span className="text-red-700 font-black">CIDADÃO</span>
          </div>
          <div className={`${subSizes} font-bold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5`}>
            <span className="inline-block w-2 h-0.5 bg-red-600"></span>
            <span>SÃO PAULO</span>
            <span className="text-neutral-300">•</span>
            <span className="text-neutral-500 font-medium">Transparência Pública</span>
          </div>
        </div>
      )}
    </div>
  );
}
