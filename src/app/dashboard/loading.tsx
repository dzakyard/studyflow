import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-500">
      <Loader2 className="h-8 w-8 animate-spin text-primary/50 mb-4" />
      <p className="text-sm font-medium">Loading...</p>
    </div>
  );
}
