/** Browser cookie helpers for the admin session gate in middleware. */

export function authCookieFlags(maxAge: number): string {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  return `path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function setAuthCookies(accessToken: string, refreshToken?: string) {
  document.cookie = `sb-access-token=${accessToken}; ${authCookieFlags(60 * 60 * 24 * 7)}`;
  if (refreshToken) {
    document.cookie = `sb-refresh-token=${refreshToken}; ${authCookieFlags(60 * 60 * 24 * 30)}`;
  }
}

export function clearAuthCookies() {
  document.cookie = `sb-access-token=; ${authCookieFlags(0)}`;
  document.cookie = `sb-refresh-token=; ${authCookieFlags(0)}`;
}
