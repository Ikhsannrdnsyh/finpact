import { LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Hapus",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-muted">{description}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={pending} autoFocus>
          Batal
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={pending}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          {pending ? "Menghapus..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}