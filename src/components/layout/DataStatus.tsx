"use client";

import { CloudOff, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useFinanceData } from "@/hooks/use-finance-data";
import { reloadFinanceData } from "@/store/finance-store";

/** Ditampilkan halaman selama data belum siap: loading, atau error + tombol coba lagi. */
export function DataStatus() {
  const { status, loadError } = useFinanceData();
  if (status !== "error") return <LoadingState />;

  return (
    <Card>
      <EmptyState
        icon={CloudOff}
        title="Data belum bisa dimuat"
        description={loadError ?? "Terjadi kesalahan. Coba lagi sebentar lagi."}
        action={
          <Button onClick={() => void reloadFinanceData()}>
            <RotateCw className="size-4" />
            Coba lagi
          </Button>
        }
      />
    </Card>
  );
}