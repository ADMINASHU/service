import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/actions/settings";
import SettingsView from "@/components/settings/SettingsView";

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    redirect("/dashboard");
  }

  const initialSettings = await getSettings();

  return <SettingsView initialSettings={initialSettings} />;
}
