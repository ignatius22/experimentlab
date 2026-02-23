export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 8px",
        borderRadius: 999,
        background: "#cffafe",
        color: "#0f766e",
        fontSize: 12,
        fontWeight: 700
      }}
    >
      {children}
    </span>
  );
}
