/** Browser cookie helpers for the admin session gate in middleware. */

export function authCookieFlags(maxAge: number): string {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  return `path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function setAuthCookies(accessToken: string, refreshToken?: string) {
  const flags = authCookieFlags(60 * 60 * 24 * 7);
  document.cookie = `pe-access-token=${accessToken}; ${flags}`;
  document.cookie = `sb-access-token=${accessToken}; ${flags}`;
  if (refreshToken) {
    const refreshFlags = authCookieFlags(60 * 60 * 24 * 30);
    document.cookie = `pe-refresh-token=${refreshToken}; ${refreshFlags}`;
    document.cookie = `sb-refresh-token=${refreshToken}; ${refreshFlags}`;
  }
}

export function clearAuthCookies() {
  const gone = authCookieFlags(0);
  document.cookie = `pe-access-token=; ${gone}`;
  document.cookie = `pe-refresh-token=; ${gone}`;
  document.cookie = `sb-access-token=; ${gone}`;
  document.cookie = `sb-refresh-token=; ${gone}`;
}
