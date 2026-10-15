import type { Metadata } from "next";
import { Suspense } from "react";
import { ReadingView } from "@/components/reading-view";
import { findSeeded, seededReadings } from "@/lib/readings";

export function generateStaticParams() {
  return seededReadings.map((reading) => ({ slug: reading.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const reading = findSeeded(slug);
  if (!reading) return { title: "Reading" };
  return {
    title: reading.title,
    description: `A shelf page for ${reading.title} by ${reading.author}, with a link to the original.`,
  };
}

function ReadingFallback() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6" aria-hidden="true">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-8 h-12 w-4/5 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-6 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  );
}

export default function ReadingPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ReadingFallback />}>
      <ResolvedReading params={params} />
    </Suspense>
  );
}

async function ResolvedReading({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ReadingView slug={slug} />;
}
