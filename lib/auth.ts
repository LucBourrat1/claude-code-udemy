import { betterAuth } from "better-auth";
import { headers } from "next/headers";
import { db } from "./db";

export const auth = betterAuth({
  database: db,
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
});

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
