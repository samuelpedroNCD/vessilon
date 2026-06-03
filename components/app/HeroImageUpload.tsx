"use client";

import { useActionState, useRef } from "react";
import { uploadYachtHero, removeYachtHero } from "@/lib/actions/yacht-hero";

type Result = { ok: boolean; error?: string } | null;

export default function HeroImageUpload({
  yachtId,
  revalidate,
  hasImage,
}: {
  yachtId: string;
  revalidate: string;
  hasImage: boolean;
}) {
  const [state, action, pending] = useActionState<Result, FormData>(
    async (_prev, fd) => uploadYachtHero({ yachtId, revalidate }, fd),
    null,
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="hero-upload">
      <form ref={formRef} action={action}>
        <input
          ref={fileRef}
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          hidden
          onChange={() => formRef.current?.requestSubmit()}
        />
        <button
          type="button"
          className="hero-upload-btn"
          disabled={pending}
          onClick={() => fileRef.current?.click()}
        >
          {pending ? "Uploading…" : hasImage ? "Change photo" : "Upload photo"}
        </button>
      </form>

      {hasImage && !pending && (
        <form action={removeYachtHero.bind(null, { yachtId, revalidate })}>
          <button type="submit" className="hero-upload-btn ghost">Remove</button>
        </form>
      )}

      {state?.error && <div className="hero-upload-err">{state.error}</div>}
    </div>
  );
}
