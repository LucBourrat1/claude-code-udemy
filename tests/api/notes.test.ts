import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSession } from '@/lib/auth';
import { createNote } from '@/lib/notes';
import { POST } from '@/app/api/notes/route';

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/notes', () => ({ createNote: vi.fn() }));

const mockSession = { user: { id: 'user-1' } };
const mockNote = {
  id: 'note-1',
  userId: 'user-1',
  title: 'My Note',
  contentJson: '{}',
  isPublic: false,
  publicSlug: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/notes', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const res = await POST(makeRequest({}));

    expect(res.status).toBe(401);
  });

  it('returns 400 with malformed JSON body', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);
    const req = new Request('http://localhost/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json {{{',
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Invalid JSON');
  });

  it('returns 400 when title exceeds 200 characters', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);

    const res = await POST(makeRequest({ title: 'x'.repeat(201) }));

    expect(res.status).toBe(400);
  });

  it('returns 201 with created note', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(createNote).mockResolvedValueOnce(mockNote);

    const res = await POST(makeRequest({ title: 'My Note' }));

    expect(res.status).toBe(201);
    expect(vi.mocked(createNote)).toHaveBeenCalledWith('user-1', { title: 'My Note' });
    expect(await res.json()).toEqual(mockNote);
  });

  it('creates note with no body fields', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession as any);
    vi.mocked(createNote).mockResolvedValueOnce(mockNote);

    const res = await POST(makeRequest({}));

    expect(res.status).toBe(201);
    expect(vi.mocked(createNote)).toHaveBeenCalledWith('user-1', {});
  });
});
