"use client";

import { useActionState, useEffect, useRef } from "react";
import { uploadDocument, type UploadCtx } from "@/lib/actions/documents";
import { DOCUMENT_TYPES } from "@/lib/queries/documents";
import { label } from "@/components/app/Pill";

type Result = { ok: boolean; error?: string } | null;

export default function DocumentUpload({ ctx }: { ctx: UploadCtx }) {
  const [state, action, pending] = useActionState<Result, FormData>(
    async (_prev, fd) => uploadDocument(ctx, fd),
    null,
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="doc-upload">
      <div className="doc-upload-row">
        <input type="file" name="file" required className="doc-file" />
        <input type="text" name="name" placeholder="Display name (optional)" className="doc-inp" />
        <select name="type" className="doc-sel" defaultValue="other">
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>{label(t)}</option>
          ))}
        </select>
        <button className="btn primary sm" type="submit" disabled={pending}>
          {pending ? "Uploading…" : "Upload"}
        </button>
      </div>
      {state?.error && <div className="doc-err">{state.error}</div>}
    </form>
  );
}
