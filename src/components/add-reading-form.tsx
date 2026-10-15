"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useShelf } from "@/hooks/use-shelf";
import { addReading } from "@/lib/shelf";
import type { FieldName, NewReadingInput } from "@/lib/types";

const empty: NewReadingInput = {
  title: "",
  author: "",
  url: "",
  tags: "",
  year: "",
  source: "",
  minutes: "",
  blurb: "",
};

export function AddReadingForm() {
  const router = useRouter();
  const shelf = useShelf();
  const [values, setValues] = useState<NewReadingInput>(empty);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  function setField(field: keyof NewReadingInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!shelf.ready) return;
    const result = addReading(shelf.state, values, crypto.randomUUID());
    if (!result.ok) {
      setErrors({ [result.field]: result.error });
      return;
    }
    setErrors({});
    shelf.commit(() => result.state);
    router.push(`/reading/${result.slug}`);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12" noValidate>
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Add a reading</h1>
      <p className="mt-4 font-serif text-lg leading-8 text-muted-foreground">
        A title, an author, and a link. Tags if you want them. Write any context yourself — the
        original stays where it was published.
      </p>

      <div className="mt-8 space-y-5">
        <Field id="title" label="Title" error={errors.title} required>
          <Input
            id="title"
            value={values.title}
            onChange={(event) => setField("title", event.target.value)}
            required
            aria-invalid={Boolean(errors.title)}
            className="h-11 md:text-base"
          />
        </Field>
        <Field id="author" label="Author" error={errors.author} required>
          <Input
            id="author"
            value={values.author}
            onChange={(event) => setField("author", event.target.value)}
            required
            aria-invalid={Boolean(errors.author)}
            className="h-11 md:text-base"
          />
        </Field>
        <Field id="url" label="Link to the original" error={errors.url} required>
          <Input
            id="url"
            type="url"
            inputMode="url"
            placeholder="https://"
            value={values.url}
            onChange={(event) => setField("url", event.target.value)}
            required
            aria-invalid={Boolean(errors.url)}
            className="h-11 md:text-base"
          />
        </Field>
        <Field id="tags" label="Tags" hint="Separate with commas." error={errors.tags}>
          <Input
            id="tags"
            value={values.tags}
            onChange={(event) => setField("tags", event.target.value)}
            placeholder="essay, sports"
            aria-invalid={Boolean(errors.tags)}
            className="h-11 md:text-base"
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field id="year" label="Year" error={errors.year}>
            <Input
              id="year"
              inputMode="numeric"
              value={values.year}
              onChange={(event) => setField("year", event.target.value)}
              aria-invalid={Boolean(errors.year)}
              className="h-11 md:text-base"
            />
          </Field>
          <Field id="source" label="Source" error={errors.source}>
            <Input
              id="source"
              value={values.source}
              onChange={(event) => setField("source", event.target.value)}
              placeholder="Magazine"
              aria-invalid={Boolean(errors.source)}
              className="h-11 md:text-base"
            />
          </Field>
          <Field id="minutes" label="Minutes" error={errors.minutes}>
            <Input
              id="minutes"
              inputMode="numeric"
              value={values.minutes}
              onChange={(event) => setField("minutes", event.target.value)}
              aria-invalid={Boolean(errors.minutes)}
              className="h-11 md:text-base"
            />
          </Field>
        </div>
        <Field
          id="blurb"
          label="Context"
          hint="A few sentences in your own words."
          error={errors.blurb}
        >
          <Textarea
            id="blurb"
            value={values.blurb}
            onChange={(event) => setField("blurb", event.target.value)}
            aria-invalid={Boolean(errors.blurb)}
            className="min-h-32 font-serif text-base leading-7 md:text-base"
          />
        </Field>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button type="submit" className="h-11 px-5" disabled={!shelf.ready}>
          Put it on the shelf
        </Button>
        {!shelf.ready ? <p className="text-sm text-muted-foreground">Opening the shelf…</p> : null}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
