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
      {/* Escudo Cívico Paulista */}
      <div className={`relative ${iconDimensions} shrink-0 drop-shadow-sm`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Base do Escudo Nobre (Preto) */}
          <path
            d="M24 4L7 10V22C7 33.2 14.3 43.6 24 46C33.7 43.6 41 33.2 41 22V10L24 4Z"
            fill="#09090B"
            stroke="#DC2626"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Faixas Paulistas (Listras Preto, Branco e Vermelho) */}
          <g clipPath="url(#shield-clip)">
            {/* Faixa Superior Branca */}
            <rect x="7" y="14" width="34" height="3" fill="#FFFFFF" opacity="0.95" />
            {/* Faixa Central Vermelha */}
            <rect x="7" y="20" width="34" height="4" fill="#DC2626" />
            {/* Faixa Inferior Branca */}
            <rect x="7" y="27" width="34" height="3" fill="#FFFFFF" opacity="0.95" />

            {/* Brasão Interno: Triângulo Paulista Vermelho */}
            <path
              d="M24 13L16 29H32L24 13Z"
              fill="#991B1B"
              stroke="#FEE2E2"
              strokeWidth="1"
            />

            {/* Estrela Cívica Central (Dourada / Transparência) */}
            <path
              d="M24 18L25.3 22.2H29.5L26.1 24.8L27.4 29L24 26.4L20.6 29L21.9 24.8L18.5 22.2H22.7L24 18Z"
              fill="#FBBF24"
            />

            {/* Balança / Lupa Cívica no Vértice Inferior */}
            <circle cx="24" cy="35" r="4.5" fill="#09090B" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="27.5" y1="38.5" x2="31" y2="42" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
          </g>

          <defs>
            <clipPath id="shield-clip">
              <path d="M24 4L7 10V22C7 33.2 14.3 43.6 24 46C33.7 43.6 41 33.2 41 22V10L24 4Z" />
            </clipPath>
          </defs>
        </svg>

        {/* Efeito de brilho institucional sutil */}
        <div className="absolute -inset-0.5 bg-red-600/10 rounded-full blur-sm -z-10" />
      </div>

      {variant === "full" && (
        <div className="flex flex-col">
          <div className={`font-black text-neutral-900 ${titleSizes} leading-tight tracking-tight flex items-center gap-1.5`}>
            <span>OBSERVATÓRIO</span>
            <span className="text-red-700 font-extrabold">CIDADÃO</span>
          </div>
          <div className={`${subSizes} font-bold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5`}>
            <span className="inline-block w-2 h-0.5 bg-red-600"></span>
            <span>SÃO PAULO</span>
            <span className="text-neutral-300">•</span>
            <span className="text-neutral-500 font-medium">Controle Social</span>
          </div>
        </div>
      )}
    </div>
  );
}
