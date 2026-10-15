import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight">That page isn’t here</h1>
      <p className="mt-4 font-serif text-lg leading-8 text-muted-foreground">
        The shelf is still where you left it.
      </p>
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "mt-6")}>
        Back to the shelf
      </Link>
    </div>
  );
}
