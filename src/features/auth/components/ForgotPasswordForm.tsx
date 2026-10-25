"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { LoaderCircle, Mail } from "lucide-react";
import { Alert, type Feedback } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, TextInput, fieldA11y } from "@/components/ui/FormField";
import { createClient } from "@/lib/supabase/client";
import { EMAIL_PATTERN, getAuthErrorMessage } from "../messages";

export function ForgotPasswordForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Masukkan email yang valid.");
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setFeedback({ kind: "error", message: "Login belum diaktifkan." });
      return;
    }

    setPending(true);
    setFeedback(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${window.location.origin}/auth/callback?next=/atur-sandi`,
      });
      if (resetError) {
        setFeedback({ kind: "error", message: getAuthErrorMessage(resetError) });
        return;
      }
      // Pesan sengaja sama untuk email terdaftar/tidak, agar daftar akun tidak bisa ditebak.
      setFeedback({
        kind: "success",
        message: `Kalau ${trimmed} terdaftar, link untuk membuat kata sandi baru sudah dikirim. Cek juga folder spam.`,
      });
    } catch {
      setFeedback({ kind: "error", message: "Tidak bisa terhubung. Periksa koneksi internetmu." });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-4">
        <Field id={id} label="Email akunmu" error={error}>
          <TextInput
            id={id}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(undefined);
              setFeedback(null);
            }}
            {...fieldA11y(id, error)}
          />
        </Field>

        {feedback && <Alert feedback={feedback} onDismiss={() => setFeedback(null)} />}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Mail className="size-4" />}
          {pending ? "Mengirim..." : "Kirim Link Reset"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm">
        <Link href="/masuk" className="font-semibold text-primary hover:underline">
          Kembali ke halaman masuk
        </Link>
      </p>
    </Card>
  );
}