"use client";

import { type FormEvent, type ReactNode } from "react";
import { submitPromptAction } from "@/app/actions";

export function ComposerForm({ children }: { children: ReactNode }) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    form.reset();
    await submitPromptAction(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-line bg-paper p-4">
      {children}
    </form>
  );
}
