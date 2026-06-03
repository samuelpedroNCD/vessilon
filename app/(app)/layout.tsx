import { redirect } from "next/navigation";
import { getProfile } from "@/lib/queries/profile";
import "./app.css";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Portal (client) users only have access to /portal — keep them out of the
  // broker app.
  const profile = await getProfile();
  if (profile && profile.role === "client") redirect("/portal");
  return children;
}
