import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserMenu } from "@/components/user-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

async function DashboardContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight">StudyFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.user_metadata?.full_name || user.email}!
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
                <CardDescription>Your authenticated profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Email: </span>
                  <span>{user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">User ID: </span>
                  <span className="font-mono text-xs">{user.id}</span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Auth Provider: </span>
                  <span className="capitalize">{user.app_metadata?.provider || "email"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
