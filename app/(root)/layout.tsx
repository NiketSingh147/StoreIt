import React from "react";
import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();

  // 🔥 SAFETY: If no user, redirect BEFORE rendering anything
  if (!currentUser) {
    redirect("/sign-in");
  }

  return (
    <html lang="en">
      <body>
        <main className="flex h-screen">
          {/* SSR safe: Spread only if defined */}
          <Sidebar {...currentUser} />

          <section className="flex h-full flex-1 flex-col">
            <MobileNavigation {...currentUser} />
            <Header userId={currentUser.$id} accountId={currentUser.accountId} />
            <div className="main-content">{children}</div>
          </section>

          <Toaster />
        </main>
      </body>
    </html>
  );
};

export default Layout;
