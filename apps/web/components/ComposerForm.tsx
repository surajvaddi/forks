"use client";

import { type CSSProperties, type FormEvent, type ReactNode } from "react";
import { submitPromptAction } from "@/app/actions";

export function ComposerForm({
  children,
  className = "",
  style,
  onSubmitted
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onSubmitted?: () => void;
}) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    form.reset();
    onSubmitted?.();
    await submitPromptAction(formData);
  }

  return (
    <form onSubmit={handleSubmit} className={`border-t border-line bg-paper p-4 ${className}`} style={style}>
      {children}
    </form>
  );
}
