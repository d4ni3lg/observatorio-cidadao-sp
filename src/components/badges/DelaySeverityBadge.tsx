"use client";

import React from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface DelaySeverityBadgeProps {
  delayMonths: number;
  className?: string;
}

export function DelaySeverityBadge({
  delayMonths,
  className = "",
}: DelaySeverityBadgeProps) {
  if (delayMonths >= 18) {
    return (
      <span
        className={`px-3 py-1 rounded-md bg-rose-100 text-rose-900 border border-rose-300 font-mono text-xs font-bold inline-flex items-center gap-1.5 ${className}`}
        title="Atraso crítico documentado superior a 18 meses"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
        {delayMonths} meses de atraso (Crítico &gt; 18m)
      </span>
    );
  }

  if (delayMonths >= 6) {
    return (
      <span
        className={`px-3 py-1 rounded-md bg-amber-100 text-amber-950 border border-amber-300 font-mono text-xs font-bold inline-flex items-center gap-1.5 ${className}`}
        title="Atraso significativo documentado entre 6 e 18 meses"
      >
        <Clock className="w-3.5 h-3.5 text-amber-800" />
        {delayMonths} meses de atraso (Significativo 6-18m)
      </span>
    );
  }

  return (
    <span
      className={`px-3 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-300 font-mono text-xs font-bold inline-flex items-center gap-1.5 ${className}`}
      title="Atraso moderado documentado inferior a 6 meses"
    >
      <Clock className="w-3.5 h-3.5 text-slate-600" />
      {delayMonths} meses de atraso (Moderado &lt; 6m)
    </span>
  );
}
