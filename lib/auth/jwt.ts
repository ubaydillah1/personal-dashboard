import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";

export const AUTH_COOKIE_NAME = "tracker_token";

const TOKEN_EXPIRY = "7d";
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 7;

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("Missing JWT_SECRET.");
  }
  return new TextEncoder().encode(jwtSecret);
}

export async function signAuthToken() {
  return new SignJWT({ sub: "ubay" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload.sub === "ubay";
}

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const isValid = await verifyAuthToken(token);
    if (!isValid) redirect("/login");
  } catch {
    redirect("/login");
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_EXPIRY_SECONDS,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
