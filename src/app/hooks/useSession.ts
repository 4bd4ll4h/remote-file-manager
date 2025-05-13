import { cookies } from "next/headers";

export async function getSessionIdFromCookie() {
  return (await cookies()).get("sessionId")?.value ?? null;
}
