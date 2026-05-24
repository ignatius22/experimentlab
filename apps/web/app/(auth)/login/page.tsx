import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "var(--color-bg)"
    }}>
      <SignIn routing="path" path="/login" />
    </main>
  );
}
