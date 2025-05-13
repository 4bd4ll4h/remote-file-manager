export const SESSION_COOKIE_NAME = "sessionId";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 1 day in seconds
};
