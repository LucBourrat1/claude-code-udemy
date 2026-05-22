import { z } from "zod";
import { getSession } from "@/lib/auth";
import { setNotePublic } from "@/lib/notes";

const shareSchema = z.object({
  isPublic: z.boolean(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = shareSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await params;
  const note = await setNotePublic(session.user.id, id, parsed.data.isPublic);
  if (!note) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ id: note.id, isPublic: note.isPublic, publicSlug: note.publicSlug });
}
