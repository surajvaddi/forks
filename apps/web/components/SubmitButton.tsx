"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function SubmitButton({ children, className, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending || props.disabled} type="submit" {...props}>
      {pending ? "Working..." : children}
    </button>
  );
}
