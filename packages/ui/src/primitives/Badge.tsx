"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "neutral" | "accent";
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, variant = "neutral", className = "", style }: BadgeProps) {
  const classes = `ui-badge ui-badge-${variant} ${className}`.trim();
  return <span className={classes} style={style}>{children}</span>;
}
