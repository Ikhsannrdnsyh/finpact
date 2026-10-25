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

interface PasswordValues {
  current: string;
  password: string;
  confirm: string;
}

type PasswordErrors = Partial<Record<keyof PasswordValues, string>>;

function validate(values: PasswordValues): PasswordErrors {
  const errors: PasswordErrors = {};
  if (!values.current) errors.current = "Kata sandi saat ini wajib diisi.";
  if (values.password.length < MIN_PASSWORD_LENGTH) errors.password = `Minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  else if (values.password === values.current) errors.password = "Kata sandi baru harus berbeda dari yang lama.";
  if (values.confirm !== values.password) errors.confirm = "Konfirmasi kata sandi belum sama.";
  return errors;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const auth = useAuth();
  const formId = useId();
  const [values, setValues] = useState<PasswordValues>({ current: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<PasswordErrors>({});
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
          title="Masuk dulu"
          description="Untuk mengganti kata sandi, masuk dengan kata sandi lama atau kata sandi sementara dari pengelola."
          action={
            <Link href="/masuk" className={buttonClasses("primary")}>
              Ke halaman masuk
            </Link>
          }
        />
      </Card>
    );
  }

  const fieldId = (name: keyof PasswordValues) => `${formId}-${name}`;
  const email = auth.user.email ?? null;

  function update(key: keyof PasswordValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFeedback(null);
  }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const supabase = createClient();
    if (!supabase) return;
    if (!email) {
      setFeedback({ kind: "error", message: "Akun ini tidak memiliki email. Hubungi pengelola FinPact." });
      return;
    }

    setPending(true);
    setFeedback(null);
    try {
      // 1) Verifikasi kata sandi saat ini sekaligus buat sesi baru yang segar.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: values.current,
      });
      if (signInError) {
        if (signInError.code === "invalid_credentials") {
          setErrors({ current: "Kata sandi saat ini salah." });
        } else {
          setFeedback({ kind: "error", message: getAuthErrorMessage(signInError) });
        }
        return;
      }

      // 2) Ganti kata sandi.
      const { error } = await supabase.auth.updateUser({
        password: values.password,
        current_password: values.current,
      });
      if (error) {
        console.error("[FinPact] Gagal mengganti kata sandi:", error);
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
        Mengganti kata sandi untuk <strong className="text-ink">{auth.user.email}</strong>.
      </p>
      <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-4">
        <Field
          id={fieldId("current")}
          label="Kata sandi saat ini"
          error={errors.current}
          hint="Kalau baru di-reset pengelola, isi dengan kata sandi sementara."
        >
          <TextInput
            id={fieldId("current")}
            type="password"
            autoComplete="current-password"
            value={values.current}
            onChange={(event) => update("current", event.target.value)}
            {...fieldA11y(fieldId("current"), errors.current, true)}
          />
        </Field>
        <Field
          id={fieldId("password")}
          label="Kata sandi baru"
          error={errors.password}
          hint={`Minimal ${MIN_PASSWORD_LENGTH} karakter.`}
        >
          <TextInput
            id={fieldId("password")}
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => update("password", event.target.value)}
            {...fieldA11y(fieldId("password"), errors.password, true)}
          />
        </Field>
        <Field id={fieldId("confirm")} label="Ulangi kata sandi baru" error={errors.confirm}>
          <TextInput
            id={fieldId("confirm")}
            type="password"
            autoComplete="new-password"
            value={values.confirm}
            onChange={(event) => update("confirm", event.target.value)}
            {...fieldA11y(fieldId("confirm"), errors.confirm)}
          />
        </Field>

        {feedback && <Alert feedback={feedback} onDismiss={() => setFeedback(null)} />}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
          {pending ? "Menyimpan..." : "Simpan Kata Sandi"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm">
        <Link href="/" className="font-semibold text-primary hover:underline">
          Batal, kembali ke Home
        </Link>
      </p>
    </Card>
  );
}