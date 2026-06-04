"use client";

import { X } from "lucide-react";
import { useEffect, useId } from "react";

type Props = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  variant = "default",
  isLoading = false,
  onClose,
  onConfirm,
}: Props) {
  const titleId = useId();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || isLoading) return;
      event.stopPropagation();
      onClose();
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isLoading, onClose]);

  const confirmButtonClass =
    variant === "danger"
      ? "rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      : "rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/10 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50";

  const handleConfirm = () => {
    void onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={() => !isLoading && onClose()}
      role="presentation"
    >
      <div
        className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between">
          <h3 id={titleId} className="text-lg font-bold text-zinc-900">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="font-bold text-zinc-400 transition hover:text-zinc-600 disabled:opacity-50"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-zinc-600">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={confirmButtonClass}
          >
            {isLoading ? "Removendo..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
