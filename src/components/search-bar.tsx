"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const [initialValue] = useState(defaultValue);

  useEffect(() => {
    // Prevent triggering search on initial mount if the query hasn't changed
    if (query === initialValue) return;

    const timer = setTimeout(() => {
      if (query.trim()) {
        router.replace(`/dashboard/search?q=${encodeURIComponent(query.trim())}`, { scroll: false });
      } else {
        router.replace(`/dashboard`, { scroll: false });
      }
    }, 350); // 350ms debounced search

    return () => clearTimeout(timer);
  }, [query, router, initialValue]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search notes, concepts, summaries across all courses..."
        className="pl-9 h-9 text-xs sm:text-sm bg-muted/40 border-muted-foreground/20 focus-visible:bg-background"
      />
    </div>
  );
}
