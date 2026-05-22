import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as db from '@/lib/db';
import { nanoid } from 'nanoid';
import {
  createNote,
  getNoteById,
  getNotesByUser,
  updateNote,
  deleteNote,
  setNotePublic,
  getNoteByPublicSlug,
} from '@/lib/notes';

vi.mock('@/lib/db', () => ({
  query: vi.fn(),
  get: vi.fn(),
  run: vi.fn(),
}));

vi.mock('nanoid', () => ({
  nanoid: vi.fn(),
}));

const EMPTY_DOC = '{"type":"doc","content":[]}';

const mockNoteRow = {
  id: 'note-1',
  user_id: 'user-1',
  title: 'Test Note',
  content_json: EMPTY_DOC,
  is_public: 0,
  public_slug: null as string | null,
  created_at: '2024-01-01 00:00:00',
  updated_at: '2024-01-01 00:00:00',
};

const expectedNote = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Test Note',
  contentJson: EMPTY_DOC,
  isPublic: false,
  publicSlug: null,
  createdAt: '2024-01-01 00:00:00',
  updatedAt: '2024-01-01 00:00:00',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createNote', () => {
  it('inserts note and returns camelCase-mapped Note', async () => {
    vi.mocked(db.get).mockReturnValueOnce(mockNoteRow);

    const note = await createNote('user-1', { title: 'Test Note', contentJson: EMPTY_DOC });

    expect(db.run).toHaveBeenCalledWith(
      'INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)',
      [expect.any(String), 'user-1', 'Test Note', EMPTY_DOC],
    );
    expect(note).toEqual(expectedNote);
  });

  it('uses default title and empty doc when data is omitted', async () => {
    vi.mocked(db.get).mockReturnValueOnce(mockNoteRow);

    await createNote('user-1');

    expect(db.run).toHaveBeenCalledWith(expect.any(String), [
      expect.any(String),
      'user-1',
      'Untitled note',
      EMPTY_DOC,
    ]);
  });
});

describe('getNoteById', () => {
  it('returns mapped Note when row exists', async () => {
    vi.mocked(db.get).mockReturnValueOnce(mockNoteRow);

    const note = await getNoteById('user-1', 'note-1');

    expect(db.get).toHaveBeenCalledWith('SELECT * FROM notes WHERE id = ? AND user_id = ?', [
      'note-1',
      'user-1',
    ]);
    expect(note).toEqual(expectedNote);
  });

  it('maps is_public=1 to isPublic=true', async () => {
    vi.mocked(db.get).mockReturnValueOnce({
      ...mockNoteRow,
      is_public: 1,
      public_slug: 'my-slug',
    });

    const note = await getNoteById('user-1', 'note-1');

    expect(note?.isPublic).toBe(true);
    expect(note?.publicSlug).toBe('my-slug');
  });

  it('returns null when row not found', async () => {
    vi.mocked(db.get).mockReturnValueOnce(undefined);

    const note = await getNoteById('user-1', 'note-1');

    expect(note).toBeNull();
  });
});

describe('getNotesByUser', () => {
  it('returns mapped array of notes sorted by updated_at', async () => {
    vi.mocked(db.query).mockReturnValueOnce([mockNoteRow, { ...mockNoteRow, id: 'note-2' }]);

    const notes = await getNotesByUser('user-1');

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
      ['user-1'],
    );
    expect(notes).toHaveLength(2);
    expect(notes[0]).toEqual(expectedNote);
  });

  it('returns empty array when user has no notes', async () => {
    vi.mocked(db.query).mockReturnValueOnce([]);

    expect(await getNotesByUser('user-1')).toEqual([]);
  });
});

describe('updateNote', () => {
  it('updates title only', async () => {
    vi.mocked(db.get).mockReturnValueOnce({ ...mockNoteRow, title: 'New Title' });

    await updateNote('user-1', 'note-1', { title: 'New Title' });

    const [sql, params] = vi.mocked(db.run).mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('title = ?');
    expect(sql).not.toContain('content_json = ?');
    expect(params).toEqual(['New Title', 'note-1', 'user-1']);
  });

  it('updates contentJson only', async () => {
    vi.mocked(db.get).mockReturnValueOnce(mockNoteRow);

    await updateNote('user-1', 'note-1', { contentJson: '{"type":"doc"}' });

    const [sql, params] = vi.mocked(db.run).mock.calls[0] as [string, unknown[]];
    expect(sql).not.toContain('title = ?');
    expect(sql).toContain('content_json = ?');
    expect(params).toEqual(['{"type":"doc"}', 'note-1', 'user-1']);
  });

  it('updates both title and contentJson', async () => {
    vi.mocked(db.get).mockReturnValueOnce(mockNoteRow);

    await updateNote('user-1', 'note-1', { title: 'New', contentJson: '{}' });

    const [sql, params] = vi.mocked(db.run).mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('title = ?');
    expect(sql).toContain('content_json = ?');
    expect(params).toEqual(['New', '{}', 'note-1', 'user-1']);
  });

  it('skips SQL update and returns existing note when no fields provided', async () => {
    vi.mocked(db.get).mockReturnValueOnce(mockNoteRow);

    const note = await updateNote('user-1', 'note-1', {});

    expect(db.run).not.toHaveBeenCalled();
    expect(note).toEqual(expectedNote);
  });
});

describe('deleteNote', () => {
  it('calls DELETE with correct ownership params', async () => {
    await deleteNote('user-1', 'note-1');

    expect(db.run).toHaveBeenCalledWith('DELETE FROM notes WHERE id = ? AND user_id = ?', [
      'note-1',
      'user-1',
    ]);
  });
});

describe('setNotePublic', () => {
  it('generates new slug when publishing a note without one', async () => {
    vi.mocked(nanoid).mockReturnValueOnce('new-slug-12345678');
    vi.mocked(db.get)
      .mockReturnValueOnce(mockNoteRow)
      .mockReturnValueOnce({ ...mockNoteRow, is_public: 1, public_slug: 'new-slug-12345678' });

    const note = await setNotePublic('user-1', 'note-1', true);

    expect(nanoid).toHaveBeenCalledWith(16);
    expect(db.run).toHaveBeenCalledWith(expect.stringContaining('is_public = 1'), [
      'new-slug-12345678',
      'note-1',
      'user-1',
    ]);
    expect(note?.isPublic).toBe(true);
    expect(note?.publicSlug).toBe('new-slug-12345678');
  });

  it('reuses existing slug when republishing', async () => {
    vi.mocked(db.get)
      .mockReturnValueOnce({ ...mockNoteRow, public_slug: 'existing-slug' })
      .mockReturnValueOnce({ ...mockNoteRow, is_public: 1, public_slug: 'existing-slug' });

    await setNotePublic('user-1', 'note-1', true);

    expect(nanoid).not.toHaveBeenCalled();
    expect(db.run).toHaveBeenCalledWith(expect.any(String), ['existing-slug', 'note-1', 'user-1']);
  });

  it('clears slug and sets is_public=0 when unpublishing', async () => {
    vi.mocked(db.get).mockReturnValueOnce({ ...mockNoteRow, is_public: 0, public_slug: null });

    await setNotePublic('user-1', 'note-1', false);

    const [sql, params] = vi.mocked(db.run).mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('is_public = 0');
    expect(sql).toContain('public_slug = NULL');
    expect(params).toEqual(['note-1', 'user-1']);
  });

  it('returns null when note not found', async () => {
    vi.mocked(db.get).mockReturnValueOnce(undefined);

    const note = await setNotePublic('user-1', 'note-1', true);

    expect(note).toBeNull();
    expect(db.run).not.toHaveBeenCalled();
  });
});

describe('getNoteByPublicSlug', () => {
  it('queries with is_public=1 condition and returns mapped note', async () => {
    const publicRow = { ...mockNoteRow, is_public: 1, public_slug: 'my-slug' };
    vi.mocked(db.get).mockReturnValueOnce(publicRow);

    const note = await getNoteByPublicSlug('my-slug');

    expect(db.get).toHaveBeenCalledWith(
      'SELECT * FROM notes WHERE public_slug = ? AND is_public = 1',
      ['my-slug'],
    );
    expect(note?.isPublic).toBe(true);
    expect(note?.publicSlug).toBe('my-slug');
  });

  it('returns null when slug not found', async () => {
    vi.mocked(db.get).mockReturnValueOnce(undefined);

    expect(await getNoteByPublicSlug('nonexistent')).toBeNull();
  });
});
