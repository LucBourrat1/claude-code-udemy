'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Editor } from '@tiptap/core';
import TipTapEditor from './TipTapEditor';

export default function NewNoteForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<Editor | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const editorJSON = editorRef.current?.getJSON();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          contentJson: JSON.stringify(editorJSON ?? { type: 'doc', content: [] }),
        }),
      });

      if (!res.ok) throw new Error('Failed to create note.');
      const note = await res.json();
      router.push(`/notes/${note.id}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label
          htmlFor='title'
          className='mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300'
        >
          Title
        </label>
        <input
          id='title'
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Note title'
          required
          className='w-full rounded-lg border border-neutral-200 px-4 py-2 text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-500'
        />
      </div>

      <div>
        <label className='mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300'>
          Content
        </label>
        <TipTapEditor
          onEditorReady={(e) => {
            editorRef.current = e;
          }}
        />
      </div>

      {error && <p className='text-sm text-red-500'>{error}</p>}

      <button
        type='submit'
        disabled={submitting}
        className='rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200'
      >
        {submitting ? 'Creating…' : 'Create Note'}
      </button>
    </form>
  );
}
