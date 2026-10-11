import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

const ALLOWED_OTP_TYPES: EmailOtpType[] = [
  "signup",
  "recovery",
  "invite",
  "magiclink",
  "email",
  "email_change",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");
  const type = ALLOWED_OTP_TYPES.includes(rawType as EmailOtpType)
    ? (rawType as EmailOtpType)
    : null;
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      redirect(next);
    } else {
      redirect("/auth/error?error=verification-failed");
    }
  }

  redirect("/auth/error?error=invalid-verification-request");
}
