import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getNotesByUser } from '@/lib/notes';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/authenticate');

  const notes = await getNotesByUser(session.user.id);

  return (
    <div>
      <div className='mb-8 flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-neutral-900 dark:text-white'>My Notes</h1>
        <Link
          href='/notes/new'
          className='rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200'
        >
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <p className='text-neutral-500 dark:text-neutral-400'>
          No notes yet. Create your first one!
        </p>
      ) : (
        <ul className='space-y-2'>
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className='flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:border-neutral-600 dark:hover:bg-neutral-900'
              >
                <span className='font-medium text-neutral-900 dark:text-white'>{note.title}</span>
                <span className='text-sm text-neutral-400'>
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
