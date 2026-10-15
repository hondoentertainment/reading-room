"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight">The page didn’t open</h1>
      <p className="mt-4 font-serif text-lg leading-8 text-muted-foreground">
        Something went wrong while drawing this view. Your shelf file on this device was not
        cleared.
      </p>
      <Button type="button" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
