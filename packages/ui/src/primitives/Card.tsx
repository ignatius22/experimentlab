import React from "react";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "accent";
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, variant = "default", className = "", style }: CardProps) {
  const variantClass = variant === "accent" ? "ui-card-accent" : "";
  const classes = `ui-card ${variantClass} ${className}`.trim();

  return (
    <article className={classes} style={style}>
      {children}
    </article>
  );
}
