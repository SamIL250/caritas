import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In - Caritas Rwanda CMS",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-stone-100" aria-hidden>
          <div className="h-8 w-8 animate-pulse rounded-full border-2 border-stone-200 border-t-[var(--color-primary)]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
