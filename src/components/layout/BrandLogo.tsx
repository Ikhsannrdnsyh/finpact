import Link from "next/link";
import { Wallet } from "lucide-react";

export function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-xl" aria-label="FinPact, ke Home">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
        <Wallet className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-extrabold text-primary-dark">FinPact</span>
        <span className="block text-xs font-medium text-muted">Money Tracker</span>
      </span>
    </Link>
  );
}