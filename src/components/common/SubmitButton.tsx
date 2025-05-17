
"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends ButtonProps {
  isPending: boolean;
  pendingText?: string;
}

export function SubmitButton({ children, isPending, pendingText = "Processing...", ...props }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isPending} {...props}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
