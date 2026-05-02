import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { deleteSession } from '$lib/server/session.js';

export const GET: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get('session_id');
	if (sessionId) {
		deleteSession(sessionId);
	}

	cookies.delete('session_id', { path: '/' });
	redirect(302, '/auth/login');
};
