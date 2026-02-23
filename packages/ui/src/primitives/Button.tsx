"use client";

import type { ButtonHTMLAttributes } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        background: "var(--color-primary)",
        color: "var(--color-primary-contrast)",
        border: "none",
        borderRadius: "var(--radius-sm)",
        padding: "10px 14px",
        cursor: "pointer"
      }}
    />
  );
}
