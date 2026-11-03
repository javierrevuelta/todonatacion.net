import type { Metadata } from "next";
import { EntryView, entryMetadata } from "@/components/content/EntryView";
import { getEntryByPath } from "@/lib/content";

export function generateMetadata(): Metadata {
  return entryMetadata(getEntryByPath("/")!);
}

export default function Home() {
  return <EntryView entry={getEntryByPath("/")!} />;
}
