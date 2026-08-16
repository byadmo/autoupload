const requiredEnv = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'] as const;

type RequiredEnv = (typeof requiredEnv)[number];

export function getEnv(name: RequiredEnv): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getCookieSecret(): string {
  return process.env.AUTH_COOKIE_SECRET ?? 'dev-only-cookie-secret-change-me';
}
