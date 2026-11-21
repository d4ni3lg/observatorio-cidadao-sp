"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { formatBRL } from "@/lib/formatters";

interface BidChartProps {
  bids: {
    id: string;
    companyName: string;
    value: number;
    timestamp: string;
    isWinningBid: boolean;
  }[];
  estimatedValue: number | null;
}

export function BidTimelineChart({ bids, estimatedValue }: BidChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !bids || bids.length === 0) {
    return (
      <div className="w-full h-72 sm:h-80 bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-center text-xs text-slate-400">
        Carregando visualização gráfica...
      </div>
    );
  }

  const data = bids.map((b, idx) => ({
    name: `Lance #${idx + 1}`,
    empresa: b.companyName,
    valor: b.value,
    hora: new Date(b.timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    vencedor: b.isWinningBid,
  }));

  return (
    <div className="w-full h-72 sm:h-80 bg-white p-4 rounded-xl border border-slate-200">
      <div className="flex flex-wrap items-center justify-between text-xs mb-3">
        <span className="font-semibold text-slate-800">
          Evolução dos Preços e Deságio Concorrido
        </span>
        {estimatedValue && (
          <span className="font-mono text-slate-500">
            Teto Estimado: {formatBRL(estimatedValue)}
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`}
            tick={{ fontSize: 11 }}
            domain={["auto", "auto"]}
          />
          <Tooltip
            formatter={(value: any) => [formatBRL(Number(value)), "Valor do Lance"]}
            labelFormatter={(label, payload) => {
              const item = payload?.[0]?.payload;
              return `${label} (${item?.hora || ""}) - ${item?.empresa || ""}`;
            }}
            contentStyle={{
              backgroundColor: "#09090b",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "12px",
              border: "1px solid #27272a",
            }}
          />
          {estimatedValue && (
            <ReferenceLine
              y={estimatedValue}
              label={{ value: "Teto Estimado Oficial", fill: "#71717a", fontSize: 10 }}
              stroke="#71717a"
              strokeDasharray="4 4"
            />
          )}
          <Line
            type="monotone"
            dataKey="valor"
            stroke="#dc2626"
            strokeWidth={3}
            dot={{ r: 5, fill: "#b91c1c" }}
            activeDot={{ r: 8, fill: "#ef4444" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
