import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, signAuthToken, verifyAuthToken } from "./token";

const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 7;

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

export { AUTH_COOKIE_NAME, signAuthToken, verifyAuthToken };

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
