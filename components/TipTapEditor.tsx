'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import type { Editor } from '@tiptap/core';

interface TipTapEditorProps {
  onEditorReady: (editor: Editor) => void;
  initialContent?: object;
}

type BtnProps = {
  onClick: () => void;
  isActive?: boolean;
  label: string;
  title: string;
  className?: string;
};

function ToolbarBtn({ onClick, isActive, label, title, className }: BtnProps) {
  return (
    <button
      type='button'
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`min-w-8 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
      } ${className ?? ''}`}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <div className='mx-0.5 w-px self-stretch bg-neutral-200 dark:bg-neutral-700' />;
}

export default function TipTapEditor({ onEditorReady, initialContent }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
  });

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive('bold') ?? false,
      italic: e?.isActive('italic') ?? false,
      h1: e?.isActive('heading', { level: 1 }) ?? false,
      h2: e?.isActive('heading', { level: 2 }) ?? false,
      h3: e?.isActive('heading', { level: 3 }) ?? false,
      paragraph: e?.isActive('paragraph') ?? false,
      bullet: e?.isActive('bulletList') ?? false,
      code: e?.isActive('code') ?? false,
      codeBlock: e?.isActive('codeBlock') ?? false,
    }),
  });

  useEffect(() => {
    if (editor) onEditorReady(editor);
  }, [editor, onEditorReady]);

  return (
    <div className='rounded-lg border border-neutral-200 focus-within:border-neutral-400 dark:border-neutral-700 dark:focus-within:border-neutral-500'>
      {editor && (
        <div className='flex flex-wrap items-center gap-1 border-b border-neutral-200 p-2 dark:border-neutral-700'>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={s?.bold}
            label='B'
            title='Bold'
            className='font-bold'
          />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={s?.italic}
            label='I'
            title='Italic'
            className='italic'
          />
          <Divider />
          <ToolbarBtn
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={s?.paragraph}
            label='P'
            title='Paragraph'
          />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={s?.h1}
            label='H1'
            title='Heading 1'
          />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={s?.h2}
            label='H2'
            title='Heading 2'
          />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={s?.h3}
            label='H3'
            title='Heading 3'
          />
          <Divider />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={s?.bullet}
            label='List'
            title='Bullet list'
          />
          <Divider />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={s?.code}
            label='Code'
            title='Inline code'
            className='font-mono'
          />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={s?.codeBlock}
            label='Block'
            title='Code block'
            className='font-mono'
          />
          <Divider />
          <ToolbarBtn
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            label='HR'
            title='Horizontal rule'
          />
        </div>
      )}
      <div className='min-h-48 p-4'>
        <EditorContent
          editor={editor}
          className='prose prose-neutral max-w-none focus:outline-none dark:prose-invert'
        />
      </div>
    </div>
  );
}
