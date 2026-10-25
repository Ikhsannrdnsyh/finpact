import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { AuthPageShell } from "@/components/layout/AuthPageShell";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Lupa Kata Sandi" };

export default function LupaSandiPage() {
  return (
    <AuthPageShell title="Lupa kata sandi?">
      <Card>
        <EmptyState
          icon={KeyRound}
          title="Minta bantuan pengelola"
          description="Hubungi guru atau pengelola FinPact dan sebutkan email akunmu. Kamu akan diberi kata sandi sementara. Setelah masuk, segera ganti lewat menu Ganti kata sandi."
          action={
            <Link href="/masuk" className={buttonClasses("primary")}>
              Kembali ke halaman masuk
            </Link>
          }
        />
      </Card>
    </AuthPageShell>
  );
}