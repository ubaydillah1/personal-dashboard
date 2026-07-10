"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

type PendingButtonProps = ComponentProps<typeof Button> & {
  pendingLabel?: string;
};

export function PendingButton({
  children,
  pendingLabel,
  disabled,
  className,
  size,
  ...props
}: PendingButtonProps) {
  const { pending } = useFormStatus();
  const isIconButton = typeof size === "string" && size.startsWith("icon");

  return (
    <Button disabled={pending || disabled} className={className} size={size} {...props}>
      {pending && isIconButton ? (
        <Loader2 className="size-4 animate-spin" />
      ) : pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
