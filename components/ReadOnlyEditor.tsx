"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

export default function ReadOnlyEditor({ content }: { content: object }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false,
    immediatelyRender: false,
  });

  return (
    <EditorContent
      editor={editor}
      className="prose prose-neutral max-w-none dark:prose-invert"
    />
  );
}
