"use server";

import { redirect } from "next/navigation";
import { clearAuthCookie, setAuthCookie, signAuthToken } from "@/lib/auth/jwt";
import { verifyDailyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/validators/auth.schema";

export type LoginState = {
  error?: string;
};

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  try {
    if (!verifyDailyPassword(parsed.data.password)) {
      return { error: "Password harian tidak cocok." };
    }

    const token = await signAuthToken();
    await setAuthCookie(token);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Login gagal.",
    };
  }

  redirect("/board");
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect("/login");
}
