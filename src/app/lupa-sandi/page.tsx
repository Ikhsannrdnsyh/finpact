import type { Metadata } from "next";
import { AuthPageShell } from "@/components/layout/AuthPageShell";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Lupa Kata Sandi" };

export default function LupaSandiPage() {
  return (
    <AuthPageShell title="Lupa kata sandi?" description="Kami kirimkan link untuk membuat kata sandi baru.">
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}