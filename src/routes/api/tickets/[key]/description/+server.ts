import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { updateTicketDescription, JiraApiError } from '$lib/server/jira.js';

export const POST: RequestHandler = async ({ params, request }) => {
	const { key } = params;

	let body: { description: Record<string, unknown> };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	if (!body.description) {
		return json({ error: 'Missing "description" field (ADF content)' }, { status: 400 });
	}

	try {
		await updateTicketDescription(key, body.description);
		return json({ success: true });
	} catch (err) {
		if (err instanceof JiraApiError) {
			return json({ error: err.message }, { status: err.status });
		}
		return json({ error: 'Failed to update ticket description' }, { status: 500 });
	}
};
