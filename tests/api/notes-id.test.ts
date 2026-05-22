import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSession } from '@/lib/auth';
import { getNoteById, updateNote, deleteNote } from '@/lib/notes';
import { GET, PUT, DELETE } from '@/app/api/notes/[id]/route';

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/notes', () => ({
  getNoteById: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));

const mockSession = { user: { id: 'user-1' } };
const mockNote = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Test Note',
  contentJson: '{}',
  isPublic: false,
  publicSlug: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const ctx = { params: Promise.resolve({ id: 'note-1' }) };

function makeRequest(body: unknown, method = 'PUT') {
  return new Request('http://localhost/api/notes/note-1', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/notes/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const res = await GET(new Request('http://localhost'), ctx);

    expect(res.status).toBe(401);
  });

  it('returns 404 when note not found', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(getNoteById).mockResolvedValueOnce(null);

    const res = await GET(new Request('http://localhost'), ctx);

    expect(res.status).toBe(404);
  });

  it('returns 200 with note body', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(getNoteById).mockResolvedValueOnce(mockNote);

    const res = await GET(new Request('http://localhost'), ctx);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockNote);
  });
});

describe('PUT /api/notes/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const res = await PUT(makeRequest({ title: 'New' }), ctx);

    expect(res.status).toBe(401);
  });

  it('returns 400 with malformed JSON body', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);
    const req = new Request('http://localhost', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: 'bad json',
    });

    const res = await PUT(req, ctx);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Invalid JSON');
  });

  it('returns 400 when title exceeds 200 characters', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);

    const res = await PUT(makeRequest({ title: 'x'.repeat(201) }), ctx);

    expect(res.status).toBe(400);
  });

  it('returns 404 when note not found', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(updateNote).mockResolvedValueOnce(null);

    const res = await PUT(makeRequest({ title: 'New Title' }), ctx);

    expect(res.status).toBe(404);
  });

  it('returns 200 with updated note', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(updateNote).mockResolvedValueOnce({ ...mockNote, title: 'New Title' });

    const res = await PUT(makeRequest({ title: 'New Title' }), ctx);

    expect(res.status).toBe(200);
    expect((await res.json()).title).toBe('New Title');
    expect(vi.mocked(updateNote)).toHaveBeenCalledWith('user-1', 'note-1', { title: 'New Title' });
  });
});

describe('DELETE /api/notes/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const res = await DELETE(new Request('http://localhost'), ctx);

    expect(res.status).toBe(401);
  });

  it('returns 404 when note not found', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(getNoteById).mockResolvedValueOnce(null);

    const res = await DELETE(new Request('http://localhost'), ctx);

    expect(res.status).toBe(404);
  });

  it('returns 204 with no body on success', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(getNoteById).mockResolvedValueOnce(mockNote);
    vi.mocked(deleteNote).mockResolvedValue(undefined);

    const res = await DELETE(new Request('http://localhost'), ctx);

    expect(res.status).toBe(204);
    expect(res.body).toBeNull();
    expect(vi.mocked(deleteNote)).toHaveBeenCalledWith('user-1', 'note-1');
  });
});
