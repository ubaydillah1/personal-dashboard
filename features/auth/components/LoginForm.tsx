"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginAction, type LoginState } from "../actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-3">
      <label className="text-sm font-medium text-zinc-200" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        className="h-11 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-50 outline-none transition focus:border-emerald-400"
        autoComplete="current-password"
        required
      />
      {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      <Button type="submit" className="h-10 gap-2" disabled={isPending}>
        <LogIn className="size-4" />
        {isPending ? "Masuk..." : "Masuk"}
      </Button>
    </form>
  );
}
