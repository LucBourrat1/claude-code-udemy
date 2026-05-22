import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { createNote } from '@/lib/notes';

const createNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  contentJson: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = createNoteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const note = await createNote(session.user.id, parsed.data);
  return Response.json(note, { status: 201 });
}
