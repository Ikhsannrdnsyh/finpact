"use client";

import { Cloud, HardDrive } from "lucide-react";
import { useFinanceData } from "@/hooks/use-finance-data";
import { cn } from "@/lib/cn";

export function LocalDataNote({ className }: { className?: string }) {
  const { mode } = useFinanceData();
  const isAccount = mode === "account";

  return (
    <p className={cn("flex items-start gap-2 rounded-xl bg-primary-light p-3 text-xs text-primary-dark", className)}>
      {isAccount ? <Cloud className="mt-0.5 size-4 shrink-0" /> : <HardDrive className="mt-0.5 size-4 shrink-0" />}
      <span>
        {isAccount
          ? "Datamu tersimpan di akun, jadi bisa dibuka dari HP maupun laptop setelah masuk."
          : "Kamu belum masuk, jadi datamu tersimpan di browser ini saja. Masuk supaya data bisa dibuka dari perangkat lain."}
      </span>
    </p>
  );
}