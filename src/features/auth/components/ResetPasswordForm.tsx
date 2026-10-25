"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { KeyRound, LoaderCircle, Save } from "lucide-react";
import { Alert, type Feedback } from "@/components/ui/Alert";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, TextInput, fieldA11y } from "@/components/ui/FormField";
import { LoadingState } from "@/components/ui/LoadingState";
import { createClient } from "@/lib/supabase/client";
import { setGuestMode } from "../guest-mode";
import { MIN_PASSWORD_LENGTH, getAuthErrorMessage } from "../messages";
import { useAuth } from "../use-auth";

interface ResetErrors {
  password?: string;
  confirm?: string;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const auth = useAuth();
  const formId = useId();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<ResetErrors>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, setPending] = useState(false);

  if (auth.status === "disabled") {
    return (
      <Card>
        <EmptyState icon={KeyRound} title="Login belum diaktifkan" description="Atur Supabase terlebih dahulu." />
      </Card>
    );
  }
  if (auth.status === "loading") return <LoadingState />;
  if (!auth.user) {
    return (
      <Card>
        <EmptyState
          icon={KeyRound}
          title="Link sudah tidak berlaku"
          description="Link reset hanya bisa dipakai sekali dan berlaku sebentar. Minta link baru, ya."
          action={
            <Link href="/lupa-sandi" className={buttonClasses("primary")}>
              Minta link baru
            </Link>
          }
        />
      </Card>
    );
  }

  const passwordId = `${formId}-password`;
  const confirmId = `${formId}-confirm`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const nextErrors: ResetErrors = {};
    if (password.length < MIN_PASSWORD_LENGTH) nextErrors.password = `Minimal ${MIN_PASSWORD_LENGTH} karakter.`;
    if (confirm !== password) nextErrors.confirm = "Konfirmasi kata sandi belum sama.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const supabase = createClient();
    if (!supabase) return;

    setPending(true);
    setFeedback(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setFeedback({ kind: "error", message: getAuthErrorMessage(error) });
        return;
      }
      setGuestMode(false);
      router.replace("/");
    } catch {
      setFeedback({ kind: "error", message: "Tidak bisa terhubung. Periksa koneksi internetmu." });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <p className="mb-4 text-sm text-muted">
        Membuat kata sandi baru untuk <strong className="text-ink">{auth.user.email}</strong>.
      </p>
      <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-4">
        <Field id={passwordId} label="Kata sandi baru" error={errors.password} hint={`Minimal ${MIN_PASSWORD_LENGTH} karakter.`}>
          <TextInput
            id={passwordId}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            {...fieldA11y(passwordId, errors.password, true)}
          />
        </Field>
        <Field id={confirmId} label="Ulangi kata sandi baru" error={errors.confirm}>
          <TextInput
            id={confirmId}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            {...fieldA11y(confirmId, errors.confirm)}
          />
        </Field>

        {feedback && <Alert feedback={feedback} onDismiss={() => setFeedback(null)} />}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
          {pending ? "Menyimpan..." : "Simpan Kata Sandi"}
        </Button>
      </form>
    </Card>
  );
}