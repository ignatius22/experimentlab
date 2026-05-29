"use client";

import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "danger" | "warning";
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const variantClass = `ui-button-${variant}`;
  const classes = `ui-button ${variant !== "primary" ? variantClass : ""} ${className}`.trim();

  return (
    <button
      className={classes}
      {...props}
    />
  );
}
