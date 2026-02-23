export function Card({ children }: { children: React.ReactNode }) {
  return (
    <article
      style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-1)",
        padding: "var(--space-4)"
      }}
    >
      {children}
    </article>
  );
}
