import { notFound } from "next/navigation";
import { getNoteByPublicSlug } from "@/lib/notes";
import ReadOnlyEditor from "@/components/ReadOnlyEditor";

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = await getNoteByPublicSlug(slug);
  if (!note) notFound();

  let content: object;
  try {
    content = JSON.parse(note.contentJson);
  } catch {
    content = { type: "doc", content: [] };
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-neutral-900 dark:text-white">
        {note.title}
      </h1>
      <ReadOnlyEditor content={content} />
    </main>
  );
}
