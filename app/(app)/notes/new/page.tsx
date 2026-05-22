import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import NewNoteForm from "@/components/NewNoteForm";

export default async function NewNotePage() {
  const session = await getSession();
  if (!session) redirect("/authenticate");

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">
        New Note
      </h1>
      <NewNoteForm />
    </div>
  );
}
