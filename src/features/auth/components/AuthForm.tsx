"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { CircleAlert, CircleCheck, Eye, EyeOff, LoaderCircle, LogIn, UserPlus } from "lucide-react";
import { Alert, type Feedback } from "@/components/ui/Alert";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, TextInput, fieldA11y } from "@/components/ui/FormField";
import { LoadingState } from "@/components/ui/LoadingState";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import { MIN_PASSWORD_LENGTH, getAuthErrorMessage } from "../messages";
import { useAuth } from "../use-auth";

type Mode = "login" | "register";

interface AuthValues {
  email: string;
  password: string;
  agreed: boolean;
}

type AuthErrors = Partial<Record<keyof AuthValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(mode: Mode, values: AuthValues): AuthErrors {
  const errors: AuthErrors = {};
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Masukkan email yang valid.";
  if (!values.password) errors.password = "Kata sandi wajib diisi.";
  else if (mode === "register" && values.password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  if (mode === "register" && !values.agreed) errors.agreed = "Centang pernyataan ini untuk membuat akun.";
  return errors;
}

function callbackUrl(): string {
  return `${window.location.origin}/auth/callback`;
}

export function AuthForm({ callbackError }: { callbackError: boolean }) {
  const router = useRouter();
  const auth = useAuth();
  const formId = useId();
  const [mode, setMode] = useState<Mode>("login");
  const [values, setValues] = useState<AuthValues>({ email: "", password: "", agreed: false });
  const [errors, setErrors] = useState<AuthErrors>({});
  const [feedback, setFeedback] = useState<Feedback | null>(
    callbackError ? { kind: "error", message: "Gagal menyelesaikan proses masuk. Coba lagi." } : null,
  );
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (auth.status === "disabled") {
    return (
      <Card>
        <EmptyState
          icon={LogIn}
          title="Login belum diaktifkan"
          description="Isi variabel Supabase di .env.local (lihat .env.example), lalu jalankan ulang aplikasi."
        />
      </Card>
    );
  }
  if (auth.status === "loading") return <LoadingState />;
  if (auth.user) {
    return (
      <Card>
        <EmptyState
          icon={CircleCheck}
          title="Kamu sudah masuk"
          description={`Masuk sebagai ${auth.user.email ?? "pengguna"}.`}
          action={
            <Link href="/" className={buttonClasses("primary")}>
              Ke Home
            </Link>
          }
        />
      </Card>
    );
  }

  const fieldId = (name: keyof AuthValues) => `${formId}-${name}`;

  function update<K extends keyof AuthValues>(key: K, value: AuthValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFeedback(null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const nextErrors = validate(mode, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFeedback({ kind: "error", message: "Ada isian yang perlu diperbaiki." });
      return;
    }

    const supabase = createClient();
    if (!supabase) return;
    const email = values.email.trim();

    setPending(true);
    setFeedback(null);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: values.password });
        if (error) {
          setFeedback({ kind: "error", message: getAuthErrorMessage(error) });
          return;
        }
        router.push("/");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: values.password,
        options: { emailRedirectTo: callbackUrl() },
      });
      if (error) {
        setFeedback({ kind: "error", message: getAuthErrorMessage(error) });
        return;
      }
      if (data.session) {
        router.push("/");
        return;
      }
      setFeedback({
        kind: "success",
        message: `Akun dibuat! Buka email ${email} dan klik link konfirmasi untuk mengaktifkan akun.`,
      });
    } catch {
      setFeedback({ kind: "error", message: "Tidak bisa terhubung. Periksa koneksi internetmu." });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <div role="group" aria-label="Pilih masuk atau daftar" className="mb-5 grid grid-cols-2 rounded-xl bg-primary-light p-1">
        {(["login", "register"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => switchMode(option)}
            className={cn(
              "min-h-10 rounded-lg text-sm font-semibold transition-colors",
              mode === option ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            {option === "login" ? "Masuk" : "Daftar"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field id={fieldId("email")} label="Email" error={errors.email}>
          <TextInput
            id={fieldId("email")}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="nama@email.com"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            {...fieldA11y(fieldId("email"), errors.email)}
          />
        </Field>

        <Field
          id={fieldId("password")}
          label="Kata sandi"
          error={errors.password}
          hint={mode === "register" ? `Minimal ${MIN_PASSWORD_LENGTH} karakter.` : undefined}
        >
          <div className="relative">
            <TextInput
              id={fieldId("password")}
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={values.password}
              onChange={(event) => update("password", event.target.value)}
              className="pr-12"
              {...fieldA11y(fieldId("password"), errors.password, mode === "register")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute inset-y-0 right-1 my-auto flex size-10 items-center justify-center rounded-lg text-muted hover:text-ink"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        {mode === "register" && (
          <div className="space-y-1.5">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={values.agreed}
                onChange={(event) => update("agreed", event.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-primary"
                aria-invalid={errors.agreed ? true : undefined}
                aria-describedby={errors.agreed ? `${fieldId("agreed")}-error` : undefined}
              />
              <span>
                Saya Sudah mendapat izin untuk membuat akun dan
                menyimpan catatan keuanganku di FinPact.
              </span>
            </label>
            {errors.agreed && (
              <p id={`${fieldId("agreed")}-error`} className="flex items-center gap-1.5 text-sm font-medium text-expense">
                <CircleAlert className="size-4 shrink-0" />
                {errors.agreed}
              </p>
            )}
          </div>
        )}

        {feedback && <Alert feedback={feedback} onDismiss={() => setFeedback(null)} />}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : mode === "login" ? (
            <LogIn className="size-4" />
          ) : (
            <UserPlus className="size-4" />
          )}
          {mode === "login" ? "Masuk" : "Buat Akun"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
        <button
          type="button"
          onClick={() => switchMode(mode === "login" ? "register" : "login")}
          className="font-semibold text-primary hover:underline"
        >
          {mode === "login" ? "Daftar di sini" : "Masuk di sini"}
        </button>
      </p>
    </Card>
  );
}