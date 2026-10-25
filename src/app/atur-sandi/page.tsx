import type { Metadata } from "next";
import { AuthPageShell } from "@/components/layout/AuthPageShell";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = { title: "Atur Kata Sandi" };

export default function AturSandiPage() {
  return (
    <AuthPageShell title="Buat kata sandi baru">
      <ResetPasswordForm />
    </AuthPageShell>
  );
}