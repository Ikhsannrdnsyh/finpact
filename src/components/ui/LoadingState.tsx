import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-[40vh] items-center justify-center gap-3 text-muted">
      <LoaderCircle className="size-5 animate-spin" />
      {label}
    </div>
  );
}