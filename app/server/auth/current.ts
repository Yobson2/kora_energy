import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession, type Session } from "@/app/server/auth/session";

export async function currentSession(): Promise<Session | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

/** Second gate for admin PAGES. Server components call this before reading data. */
export async function requireAdminPage(): Promise<Session> {
  const session = await currentSession();
  if (!session) redirect("/admin/login");
  return session;
}
