import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/app/server/lib/session/constants";

/**
 * Reads the current session ID from the cookie (or returns null)
 */
export async function getSessionId(): Promise<string | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME);
  return cookie?.value || null;
}

/**
 * Creates a new session ID and sets it as a secure cookie
 */
export async function createSessionId(): Promise<string> {
  const sessionId = randomUUID();
  (await cookies()).set(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS);
  return sessionId;
}

/**
 * Clears the session cookie
 */
export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}
