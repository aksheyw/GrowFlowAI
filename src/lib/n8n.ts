import { supabase } from './supabase';

export const N8N_BASE_URL = 'https://n8n.srv1134430.hstgr.cloud/webhook';

/**
 * Calls an n8n webhook with the signed-in user's Supabase access token.
 * n8n verifies the token with Supabase and rejects calls without one.
 */
export async function n8nFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
        throw new Error('You need to be signed in to do this.');
    }

    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${token}`);

    return fetch(`${N8N_BASE_URL}/${path}`, { ...init, headers });
}
