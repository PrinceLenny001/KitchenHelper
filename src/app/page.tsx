import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function Home() {
  // Redirect directly to the dashboard
  redirect("/dashboard");
}
