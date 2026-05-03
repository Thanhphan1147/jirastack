import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { transitionTicket, JiraApiError } from '$lib/server/jira.js';

export const POST: RequestHandler = async ({ params, request }) => {
	const { key } = params;

	let body: { status: string };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	if (!body.status || typeof body.status !== 'string' || !body.status.trim()) {
		return json({ error: 'Missing or empty "status" field' }, { status: 400 });
	}

	try {
		await transitionTicket(key, body.status.trim());
		return json({ success: true });
	} catch (err) {
		if (err instanceof JiraApiError) {
			return json({ error: err.message }, { status: err.status });
		}
		return json({ error: 'Failed to transition ticket' }, { status: 500 });
	}
};
