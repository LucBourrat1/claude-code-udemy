"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Editor } from "@tiptap/core";
import type { Note } from "@/lib/notes";
import TipTapEditor from "./TipTapEditor";

export default function NoteEditorForm({ note }: { note: Note }) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isPublic, setIsPublic] = useState(note.isPublic);
  const [publicSlug, setPublicSlug] = useState(note.publicSlug);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<Editor | null>(null);

  const initialContent = (() => {
    try {
      return JSON.parse(note.contentJson);
    } catch {
      return { type: "doc", content: [] };
    }
  })();

  async function handleSave() {
    const editorJSON = editorRef.current?.getJSON();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          contentJson: JSON.stringify(editorJSON ?? { type: "doc", content: [] }),
        }),
      });
      if (!res.ok) throw new Error();
      router.push("/dashboard");
    } catch {
      setError("Failed to save note.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/dashboard");
    } catch {
      setError("Failed to delete note.");
      setDeleting(false);
    }
  }

  async function handleShareToggle() {
    const newValue = !isPublic;
    try {
      const res = await fetch(`/api/notes/${note.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: newValue }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIsPublic(data.isPublic);
      setPublicSlug(data.publicSlug);
    } catch {
      setError("Failed to update sharing.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="flex-1 text-2xl font-bold bg-transparent border-none outline-none text-neutral-900 dark:text-white placeholder-neutral-400"
          placeholder="Note title"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      <TipTapEditor
        onEditorReady={(e) => { editorRef.current = e; }}
        initialContent={initialContent}
      />

      <div className="flex items-center gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={handleShareToggle}
          aria-label={isPublic ? "Disable public sharing" : "Enable public sharing"}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPublic ? "bg-neutral-900 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-900 transition-transform ${
              isPublic ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {isPublic ? "Public" : "Private"}
        </span>
        {isPublic && publicSlug && (
          <a
            href={`/p/${publicSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            /p/{publicSlug}
          </a>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
