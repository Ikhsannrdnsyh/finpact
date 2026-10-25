import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { AuthForm } from "@/features/auth/components/AuthForm";

export const metadata: Metadata = { title: "Masuk" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Membaca ?error=... dari URL. Dibungkus Suspense karena nilainya baru ada saat halaman dibuka. */
async function AuthFormWithParams({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return <AuthForm callbackError={params.error === "callback"} />;
}

export default function MasukPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Masuk ke FinPact" description="Simpan catatan uangmu di akun sendiri." />
      <Suspense fallback={<LoadingState />}>
        <AuthFormWithParams searchParams={searchParams} />
      </Suspense>
    </div>
  );
}