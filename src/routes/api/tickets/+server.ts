import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { fetchTicketsWithoutDescription, JiraApiError } from '$lib/server/jira.js';

export const GET: RequestHandler = async () => {
	try {
		const tickets = await fetchTicketsWithoutDescription();
		return json({ tickets });
	} catch (err) {
		if (err instanceof JiraApiError) {
			return json({ error: err.message }, { status: err.status });
		}
		return json({ error: 'Failed to fetch tickets' }, { status: 500 });
	}
};
