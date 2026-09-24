import { auth } from "@/lib/auth/server";
import { CoupAppShell } from "@/components/app-shell/CoupAppShell";
import { prisma } from "@experiment/db";
import "@/app/app-coup.css";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const account = session?.userId ? await prisma.user.findUnique({ where: { id: session.userId }, include: { organization: { select: { name: true, plan: true } } } }) : null;
  const user = account ? { email: account.email, name: account.name, orgName: account.organization.name, orgId: account.organizationId, plan: account.organization.plan } : null;

  return <CoupAppShell user={user}>{children}</CoupAppShell>;
}
