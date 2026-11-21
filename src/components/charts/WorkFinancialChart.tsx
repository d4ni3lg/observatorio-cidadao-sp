"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatBRL } from "@/lib/formatters";

interface FinancialBreakdownProps {
  initialBudget: number;
  updatedAmount: number;
  paidAmount: number;
  physicalExecutedAmount: number | null;
}

export function WorkFinancialChart({
  initialBudget,
  updatedAmount,
  paidAmount,
  physicalExecutedAmount,
}: FinancialBreakdownProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-80 bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-center text-xs text-slate-400">
        Carregando comparativo orçamentário e físico...
      </div>
    );
  }

  const data = [
    {
      categoria: "Orçamento & Aditivos",
      "Orçamento Inicial": initialBudget,
      "Acréscimo Aditivos": Math.max(0, updatedAmount - initialBudget),
    },
    {
      categoria: "Execução & Pagamento",
      "Valor Efetivamente Pago": paidAmount,
      "Medição Física Atestada": physicalExecutedAmount || 0,
    },
  ];

  return (
    <div className="w-full h-80 bg-white p-4 rounded-xl border border-slate-200">
      <div className="text-xs font-semibold text-slate-800 mb-2">
        Balanço Financeiro e Comparativo de Execução
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
          <XAxis dataKey="categoria" tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: any, name: any) => [
              formatBRL(Number(value)),
              String(name),
            ]}
            contentStyle={{
              backgroundColor: "#0f172a",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Bar dataKey="Orçamento Inicial" fill="#64748b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Acréscimo Aditivos" fill="#b45309" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Valor Efetivamente Pago" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Medição Física Atestada" fill="#047857" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
