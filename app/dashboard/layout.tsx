import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayoutClient } from "./layout-client";
import { UserStoreProvider } from "@/components/user-store-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // No blocking calls - Zustand store handles plan data fetching on login
  // This makes navigation instant!
  return (
    <UserStoreProvider>
      <DashboardLayoutClient user={user}>
        {children}
      </DashboardLayoutClient>
    </UserStoreProvider>
  );
}
