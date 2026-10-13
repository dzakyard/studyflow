import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasEnvVars = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY !== "your-supabase-anon-key" &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY !== "placeholder-key") &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your-supabase-anon-key" &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key")
);
