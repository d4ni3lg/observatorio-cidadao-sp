"use client";

import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ExecutionDiscrepancyBadgeProps {
  financialExecutionPct: number;
  physicalExecutionPct: number | null;
  className?: string;
}

export function ExecutionDiscrepancyBadge({
  financialExecutionPct,
  physicalExecutionPct,
  className = "",
}: ExecutionDiscrepancyBadgeProps) {
  const physical = physicalExecutionPct ?? 0;
  const discrepancy = financialExecutionPct - physical;

  if (discrepancy > 15) {
    return (
      <span
        className={`px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-300 font-mono text-[11px] font-semibold inline-flex items-center gap-1.5 ${className}`}
        title={`Desembolso financeiro (${financialExecutionPct}%) supera avanço físico (${physical}%) em ${discrepancy.toFixed(1)} pp.`}
      >
        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
        Descompasso Financeiro vs Físico: +{discrepancy.toFixed(1)} pp
      </span>
    );
  }

  return (
    <span
      className={`px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-mono text-[11px] font-semibold inline-flex items-center gap-1.5 ${className}`}
      title={`Execução física (${physical}%) e desembolso financeiro (${financialExecutionPct}%) dentro da faixa esperada.`}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
      Medição Física Alinhada com Financeiro
    </span>
  );
}
