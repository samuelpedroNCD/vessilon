"use client";

import { useState } from "react";

/** Copies an absolute URL (built from a relative path) to the clipboard. */
export default function CopyLinkButton({ path, label = "Copy link" }: { path: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="copylink"
      onClick={async () => {
        try {
          const url = `${window.location.origin}${path}`;
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
