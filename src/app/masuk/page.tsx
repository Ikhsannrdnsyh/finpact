import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageShell } from "@/components/layout/AuthPageShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { AuthForm } from "@/features/auth/components/AuthForm";

export const metadata: Metadata = { title: "Masuk" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function AuthFormWithParams({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return <AuthForm callbackError={params.error === "callback"} />;
}

export default function MasukPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <AuthPageShell title="Selamat datang!" description="Masuk supaya catatan uangmu tersimpan aman di akunmu.">
      <Suspense fallback={<LoadingState />}>
        <AuthFormWithParams searchParams={searchParams} />
      </Suspense>
    </AuthPageShell>
  );
}