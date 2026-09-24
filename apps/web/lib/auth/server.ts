import { getSession } from "./session";

export async function auth() {
  const session = await getSession();
  if (!session) {
    return { userId: null, orgId: null, session: null };
  }
  return {
    userId: session.userId,
    orgId: session.orgId,
    orgName: session.orgName,
    email: session.email,
    session
  };
}
