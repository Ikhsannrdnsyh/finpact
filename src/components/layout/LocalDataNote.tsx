import { HardDrive } from "lucide-react";
import { cn } from "@/lib/cn";

export function LocalDataNote({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 rounded-xl bg-primary-light p-3 text-xs text-primary-dark", className)}>
      <HardDrive className="mt-0.5 size-4 shrink-0" />
      <span>
        Datamu tersimpan di browser ini saja, bukan di cloud. Kalau ganti browser atau perangkat,
        datanya tidak ikut pindah.
      </span>
    </p>
  );
}