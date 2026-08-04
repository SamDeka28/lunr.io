import { redirect } from "next/navigation";
import { getCachedUser } from "@/lib/supabase/auth";
import { DashboardLayoutClient } from "./layout-client";
import { UserStoreProvider } from "@/components/user-store-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedUser();

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
