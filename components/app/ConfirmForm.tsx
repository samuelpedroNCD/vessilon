"use client";

import type { ReactNode } from "react";

/**
 * A form wrapping a (bound) server action that asks for confirmation before
 * submitting. Progressive-enhancement friendly: if JS is disabled the form
 * still posts; with JS, a cancelled confirm() prevents the submit.
 */
export default function ConfirmForm({
  action,
  message,
  children,
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
