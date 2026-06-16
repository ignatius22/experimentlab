import React from "react";
import { Loader2 } from "lucide-react";

export function Loader({ size = 24, label }: { size?: number, label?: string }) {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "48px",
      gap: 12,
      color: "var(--color-text-dim)"
    }}>
      <Loader2 size={size} className="ui-spin" />
      {label && <p style={{ fontSize: "0.9rem" }}>{label}</p>}
    </div>
  );
}
