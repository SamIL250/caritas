"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-full bg-stone-100 text-stone-800">
        <div className="flex min-h-full flex-col items-center justify-center gap-3 p-8">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="max-w-md text-center text-sm text-stone-500">
            {process.env.NODE_ENV === "development" ? error.message : "Please try again or contact support."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-2 rounded-md bg-stone-900 px-4 py-2 text-sm text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
