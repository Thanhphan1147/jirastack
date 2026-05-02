import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { updateTicketDescription, JiraApiError } from '$lib/server/jira.js';
import { textToAdf } from '$lib/server/text-to-adf.js';

export const POST: RequestHandler = async ({ params, request }) => {
	const { key } = params;

	let body: { description: string };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	if (!body.description || typeof body.description !== 'string' || !body.description.trim()) {
		return json({ error: 'Missing or empty "description" field' }, { status: 400 });
	}

	const adf = textToAdf(body.description) as unknown as Record<string, unknown>;

	try {
		await updateTicketDescription(key, adf);
		return json({ success: true });
	} catch (err) {
		if (err instanceof JiraApiError) {
			return json({ error: err.message }, { status: err.status });
		}
		return json({ error: 'Failed to update ticket description' }, { status: 500 });
	}
};
