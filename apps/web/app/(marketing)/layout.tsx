import { auth } from "@/lib/auth/server";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import "./marketing.css";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  return (
    <div className="site-wrapper">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />
      <MarketingNavbar userId={userId} />

      <main>{children}</main>
    </div>
  );
}
