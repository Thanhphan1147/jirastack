import { config, getJiraAuthHeader } from './config.js';

const JQL_EMPTY_DESCRIPTION =
	'(assignee = currentUser() OR creator = currentUser()) AND description is EMPTY AND statusCategory != Done ORDER BY priority DESC, created ASC';

export interface JiraTicket {
	key: string;
	summary: string;
	issueType: string;
	priority: string;
	status: string;
}

interface JiraSearchResponse {
	issues: Array<{
		key: string;
		fields: {
			summary: string;
			issuetype: { name: string };
			priority: { name: string };
			status: { name: string };
		};
	}>;
	total: number;
}

export interface JiraUser {
	accountId: string;
	displayName: string;
	emailAddress: string;
}

async function jiraFetch(path: string, options: RequestInit = {}): Promise<Response> {
	const url = `${config.jira.baseUrl}/rest/api/3${path}`;
	const response = await fetch(url, {
		...options,
		headers: {
			Authorization: getJiraAuthHeader(),
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...options.headers
		}
	});

	if (response.status === 401) {
		throw new JiraApiError('Invalid Jira credentials. Check your API token and email.', 401);
	}

	if (response.status === 429) {
		const retryAfter = response.headers.get('Retry-After') || '60';
		throw new JiraApiError(
			`Jira API rate limit exceeded. Retry after ${retryAfter} seconds.`,
			429,
			parseInt(retryAfter, 10)
		);
	}

	if (!response.ok) {
		const body = await response.text();
		throw new JiraApiError(`Jira API error (${response.status}): ${body}`, response.status);
	}

	return response;
}

export class JiraApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public retryAfter?: number
	) {
		super(message);
		this.name = 'JiraApiError';
	}
}

export async function fetchTicketsWithoutDescription(): Promise<JiraTicket[]> {
	const response = await jiraFetch('/search/jql', {
		method: 'POST',
		body: JSON.stringify({
			jql: JQL_EMPTY_DESCRIPTION,
			fields: ['summary', 'issuetype', 'priority', 'status'],
			maxResults: 50
		})
	});

	const data: JiraSearchResponse = await response.json();

	return data.issues.map((issue) => ({
		key: issue.key,
		summary: issue.fields.summary,
		issueType: issue.fields.issuetype.name,
		priority: issue.fields.priority.name,
		status: issue.fields.status.name
	}));
}

export async function updateTicketDescription(
	issueKey: string,
	adfContent: Record<string, unknown>
): Promise<void> {
	await jiraFetch(`/issue/${issueKey}`, {
		method: 'PUT',
		body: JSON.stringify({
			fields: {
				description: adfContent
			}
		})
	});
}

export async function fetchCurrentUser(): Promise<JiraUser> {
	const response = await jiraFetch('/myself');
	const data = await response.json();
	return {
		accountId: data.accountId,
		displayName: data.displayName,
		emailAddress: data.emailAddress
	};
}
