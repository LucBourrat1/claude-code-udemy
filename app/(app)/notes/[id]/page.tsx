import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getNoteById } from "@/lib/notes";
import NoteEditorForm from "@/components/NoteEditorForm";

export default async function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/authenticate");

  const { id } = await params;
  const note = await getNoteById(session.user.id, id);
  if (!note) notFound();

  return <NoteEditorForm note={note} />;
}
