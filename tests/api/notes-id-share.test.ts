import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSession } from '@/lib/auth';
import { setNotePublic } from '@/lib/notes';
import { POST } from '@/app/api/notes/[id]/share/route';

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/notes', () => ({ setNotePublic: vi.fn() }));

const mockSession = { user: { id: 'user-1' } };
const mockNote = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Test Note',
  contentJson: '{}',
  isPublic: true,
  publicSlug: 'my-slug-1234',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const ctx = { params: Promise.resolve({ id: 'note-1' }) };

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/notes/note-1/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/notes/[id]/share', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const res = await POST(makeRequest({ isPublic: true }), ctx);

    expect(res.status).toBe(401);
  });

  it('returns 400 with malformed JSON body', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);
    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'bad json',
    });

    const res = await POST(req, ctx);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Invalid JSON');
  });

  it('returns 400 when isPublic is not a boolean', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);

    const res = await POST(makeRequest({ isPublic: 'yes' }), ctx);

    expect(res.status).toBe(400);
  });

  it('returns 400 when isPublic is missing', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);

    const res = await POST(makeRequest({}), ctx);

    expect(res.status).toBe(400);
  });

  it('returns 404 when note not found', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(setNotePublic).mockResolvedValueOnce(null);

    const res = await POST(makeRequest({ isPublic: true }), ctx);

    expect(res.status).toBe(404);
  });

  it('returns 200 with id, isPublic, and publicSlug when publishing', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(setNotePublic).mockResolvedValueOnce(mockNote);

    const res = await POST(makeRequest({ isPublic: true }), ctx);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      id: 'note-1',
      isPublic: true,
      publicSlug: 'my-slug-1234',
    });
    expect(vi.mocked(setNotePublic)).toHaveBeenCalledWith('user-1', 'note-1', true);
  });

  it('returns 200 with publicSlug=null when unpublishing', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(setNotePublic).mockResolvedValueOnce({
      ...mockNote,
      isPublic: false,
      publicSlug: null,
    });

    const res = await POST(makeRequest({ isPublic: false }), ctx);

    expect(res.status).toBe(200);
    expect((await res.json()).publicSlug).toBeNull();
  });
});
