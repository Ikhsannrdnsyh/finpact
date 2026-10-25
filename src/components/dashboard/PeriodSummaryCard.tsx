import { Card, CardHeader } from "@/components/ui/Card";
import type { ChartPoint, TransactionSummary } from "@/features/transactions/calculations";
import { PERIOD_LABELS } from "@/features/transactions/constants";
import { PeriodSelect } from "@/features/transactions/components/PeriodSelect";
import type { Period } from "@/types/finance";
import { CashflowChart } from "./CashflowChart";
import { FlowCard } from "./SummaryCards";

interface PeriodSummaryCardProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  summary: TransactionSummary;
  chartData: readonly ChartPoint[];
  className?: string;
}

export function PeriodSummaryCard({ period, onPeriodChange, summary, chartData, className }: PeriodSummaryCardProps) {
  return (
    <Card className={className}>
      <CardHeader
        title="Uang Masuk & Keluar"
        action={<PeriodSelect id="dashboard-period" value={period} onChange={onPeriodChange} />}
      />
      <p className="-mt-2 mb-4 text-sm text-muted">
        Menampilkan periode: <strong className="text-ink">{PERIOD_LABELS[period]}</strong>
      </p>
      <div className="grid grid-cols-2 gap-3">
        <FlowCard type="income" amount={summary.income} />
        <FlowCard type="expense" amount={summary.expense} />
      </div>
      <div className="mt-5">
        <CashflowChart data={chartData} />
      </div>
    </Card>
  );
}