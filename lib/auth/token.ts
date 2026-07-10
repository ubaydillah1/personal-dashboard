import { jwtVerify, SignJWT } from "jose";

export const AUTH_COOKIE_NAME = "tracker_token";

const TOKEN_EXPIRY = "7d";

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
