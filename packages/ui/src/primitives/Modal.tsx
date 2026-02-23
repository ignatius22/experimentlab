"use client";

import { useEffect, useRef } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ open, title, onClose, children }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={title} style={{ padding: 16, background: "#11182722" }}>
      <div style={{ background: "white", borderRadius: 12, padding: 16 }}>
        <h3>{title}</h3>
        <div>{children}</div>
        <button ref={closeRef} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
