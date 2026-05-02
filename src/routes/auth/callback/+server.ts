import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import {
	exchangeCodeForTokens,
	fetchAccessibleResources,
	fetchCurrentUser,
	buildSessionFromTokens
} from '$lib/server/auth.js';
import { generateSessionId, setSession } from '$lib/server/session.js';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	if (!code) {
		error(400, 'Missing authorization code');
	}

	const errorParam = url.searchParams.get('error');
	if (errorParam) {
		error(400, `Authorization failed: ${errorParam}`);
	}

	const tokens = await exchangeCodeForTokens(code);

	const [resources, user] = await Promise.all([
		fetchAccessibleResources(tokens.access_token),
		fetchCurrentUser(tokens.access_token)
	]);

	if (resources.length === 0) {
		error(400, 'No accessible Jira sites found for this account');
	}

	const cloudId = resources[0].id;
	const session = buildSessionFromTokens(tokens, cloudId, user);
	const sessionId = generateSessionId();

	setSession(sessionId, session);

	cookies.set('session_id', sessionId, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 7
	});

	redirect(302, '/');
};
