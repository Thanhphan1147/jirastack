import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { getSession } from '$lib/server/session.js';
import { refreshAccessToken } from '$lib/server/auth.js';
import { setSession } from '$lib/server/session.js';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('session_id');
	let session = sessionId ? getSession(sessionId) ?? null : null;

	if (session && session.expiresAt <= Date.now()) {
		try {
			const tokens = await refreshAccessToken(session.refreshToken);
			session = {
				...session,
				accessToken: tokens.access_token,
				refreshToken: tokens.refresh_token,
				expiresAt: Date.now() + tokens.expires_in * 1000
			};
			setSession(sessionId!, session);
		} catch {
			session = null;
			event.cookies.delete('session_id', { path: '/' });
		}
	}

	event.locals.session = session;

	const isAuthRoute = event.url.pathname.startsWith('/auth');
	if (!session && !isAuthRoute) {
		redirect(302, '/auth/login');
	}

	return resolve(event);
};
