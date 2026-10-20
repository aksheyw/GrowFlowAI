import { describe, it, expect, vi, beforeEach } from 'vitest';

const getSession = vi.fn();
vi.mock('../src/lib/supabase', () => ({
    supabase: { auth: { getSession: () => getSession() } },
}));

import { n8nFetch, N8N_BASE_URL } from '../src/lib/n8n';

describe('n8nFetch', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        getSession.mockReset();
    });

    it('sends the access token as a Bearer header', async () => {
        getSession.mockResolvedValue({ data: { session: { access_token: 'tok123' } } });
        const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'));

        await n8nFetch('generate-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
        });

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe(`${N8N_BASE_URL}/generate-summary`);
        const headers = new Headers((init as RequestInit).headers);
        expect(headers.get('Authorization')).toBe('Bearer tok123');
        expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('refuses to call n8n without a session', async () => {
        getSession.mockResolvedValue({ data: { session: null } });
        const fetchMock = vi.spyOn(globalThis, 'fetch');

        await expect(n8nFetch('generate-summary')).rejects.toThrow('signed in');
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
