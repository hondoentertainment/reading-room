import type { Metadata } from "next";
import { AddReadingForm } from "@/components/add-reading-form";

export const metadata: Metadata = {
  title: "Add a reading",
  description: "Add a title, author, and link to Kyle's Reading Room.",
};

export default function AddPage() {
  return <AddReadingForm />;
}
