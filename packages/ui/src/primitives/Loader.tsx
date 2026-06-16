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
      <Loader2 size={size} className="spin" />
      {label && <p style={{ fontSize: "0.9rem" }}>{label}</p>}
      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
