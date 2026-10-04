import { getStore } from "@/app/server/store";

export const dynamic = "force-dynamic";

/** GET /api/health  liveness plus a real read of the store, for uptime checks. */
export async function GET() {
  try {
    await getStore().read();
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "degraded" }, { status: 503 });
  }
}
