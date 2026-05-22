import { betterAuth } from 'better-auth';
import { headers } from 'next/headers';
import { db } from './db';

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) throw new Error('BETTER_AUTH_SECRET env var is not set');

export const auth = betterAuth({
  database: db,
  emailAndPassword: { enabled: true },
  secret,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
});

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
