/** This app is Postgres-only. DATABASE_URL is required at runtime. */
export function isPlainPostgres(): boolean {
  return !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

export function authJwtSecret(): string {
  return (
    process.env.AUTH_JWT_SECRET ||
    process.env.JWT_SECRET ||
    "dev-auth-secret-change-me"
  );
}
