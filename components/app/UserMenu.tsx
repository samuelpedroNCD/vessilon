"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UserMenu({
  name,
  email,
  initials,
}: {
  name: string;
  email: string;
  initials: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="usermenu">
      <button className="avatar" onClick={() => setOpen((o) => !o)} aria-label="Account menu">
        {initials}
      </button>
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 55 }}
            onClick={() => setOpen(false)}
          />
          <div className="menu">
            <div className="who">
              <div className="nm">{name}</div>
              <div className="em">{email}</div>
            </div>
            <a href="#">Settings</a>
            <a href="#">Help &amp; support</a>
            <button onClick={signOut}>Sign out</button>
          </div>
        </>
      )}
    </div>
  );
}
