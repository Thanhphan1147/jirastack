import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getAuthorizationUrl } from '$lib/server/auth.js';
import { generateSessionId } from '$lib/server/session.js';

export const GET: RequestHandler = () => {
	const state = generateSessionId();
	const url = getAuthorizationUrl(state);
	redirect(302, url);
};
