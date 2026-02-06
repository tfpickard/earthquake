"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center text-slate-100">
      <h2 className="text-2xl font-semibold">Something drifted off course.</h2>
      <p className="max-w-md text-sm text-slate-300">
        We couldn&apos;t load the seismic constellation. Please try again, or refresh in a moment.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-100 hover:text-slate-900"
      >
        Retry
      </button>
    </div>
  );
}
