import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { getNoteById, updateNote, deleteNote } from '@/lib/notes';

const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  contentJson: z.string().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const note = await getNoteById(session.user.id, id);
  if (!note) return Response.json({ error: 'Not found' }, { status: 404 });

  return Response.json(note);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = updateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await params;
  const note = await updateNote(session.user.id, id, parsed.data);
  if (!note) return Response.json({ error: 'Not found' }, { status: 404 });

  return Response.json(note);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const note = await getNoteById(session.user.id, id);
  if (!note) return Response.json({ error: 'Not found' }, { status: 404 });

  await deleteNote(session.user.id, id);
  return new Response(null, { status: 204 });
}
