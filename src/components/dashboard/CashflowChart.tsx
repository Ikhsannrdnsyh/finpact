"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartPoint } from "@/features/transactions/calculations";
import { formatCompactRupiah, formatRupiah } from "@/lib/money";

// Recharts menulis warna sebagai atribut SVG, jadi samakan manual dengan token di globals.css.
const CHART_COLORS = { income: "#15803d", expense: "#c81e1e", grid: "#e2ecf8", tick: "#64748b" } as const;

export function CashflowChart({ data }: { data: readonly ChartPoint[] }) {
  const hasData = data.some((point) => point.income > 0 || point.expense > 0);

  if (!hasData) {
    return (
      <p className="flex h-48 items-center justify-center rounded-xl bg-primary-light/60 px-4 text-center text-sm text-muted">
        Belum ada transaksi di periode ini, jadi grafiknya masih kosong.
      </p>
    );
  }

  return (
    <figure>
      <div className="h-52 w-full" role="img" aria-label="Grafik batang uang masuk dan uang keluar per periode">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[...data]} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={2}>
            <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: CHART_COLORS.tick }}
              minTickGap={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fontSize: 12, fill: CHART_COLORS.tick }}
              tickFormatter={(value: number) => formatCompactRupiah(value)}
            />
            <Tooltip formatter={(value) => formatRupiah(Number(value))} cursor={{ fill: "#eaf4ff" }} />
            <Bar dataKey="income" name="Uang Masuk" fill={CHART_COLORS.income} radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Bar dataKey="expense" name="Uang Keluar" fill={CHART_COLORS.expense} radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-3 flex justify-center gap-5 text-sm text-muted">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-income" /> Uang Masuk
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-expense" /> Uang Keluar
        </span>
      </figcaption>
    </figure>
  );
}