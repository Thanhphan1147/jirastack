import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	fetchTicketsWithoutDescription,
	updateTicketDescription,
	fetchCurrentUser,
	transitionTicket,
	JiraApiError
} from './jira.js';

vi.mock('./config.js', () => ({
	config: {
		jira: {
			apiToken: 'test-token',
			userEmail: 'user@example.com',
			baseUrl: 'https://test.atlassian.net'
		}
	},
	getJiraAuthHeader: () => 'Basic dGVzdA=='
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
	mockFetch.mockReset();
});

describe('fetchTicketsWithoutDescription', () => {
	it('should return mapped tickets from Jira search', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({
				issues: [
					{
						key: 'PROJ-1',
						fields: {
							summary: 'Fix login bug',
							issuetype: { name: 'Bug' },
							priority: { name: 'High' },
							status: { name: 'To Do' }
						}
					},
					{
						key: 'PROJ-2',
						fields: {
							summary: 'Add search feature',
							issuetype: { name: 'Story' },
							priority: { name: 'Medium' },
							status: { name: 'In Progress' }
						}
					}
				],
				total: 2
			})
		});

		const tickets = await fetchTicketsWithoutDescription();

		expect(tickets).toHaveLength(2);
		expect(tickets[0]).toEqual({
			key: 'PROJ-1',
			summary: 'Fix login bug',
			issueType: 'Bug',
			priority: 'High',
			status: 'To Do'
		});
		expect(mockFetch).toHaveBeenCalledWith(
			'https://test.atlassian.net/rest/api/3/search/jql',
			expect.objectContaining({ method: 'POST' })
		);
	});

	it('should throw JiraApiError on 401', async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			status: 401,
			text: async () => 'Unauthorized'
		});

		await expect(fetchTicketsWithoutDescription()).rejects.toThrow(JiraApiError);
	});

	it('should throw JiraApiError with retryAfter on 429', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 429,
			headers: new Headers({ 'Retry-After': '30' }),
			text: async () => 'Rate limited'
		});

		try {
			await fetchTicketsWithoutDescription();
			expect.fail('Should have thrown');
		} catch (err) {
			expect(err).toBeInstanceOf(JiraApiError);
			expect((err as JiraApiError).status).toBe(429);
			expect((err as JiraApiError).retryAfter).toBe(30);
		}
	});
});

describe('updateTicketDescription', () => {
	it('should PUT description to Jira API', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 204
		});

		const adf = { version: 1, type: 'doc', content: [] };
		await updateTicketDescription('PROJ-1', adf);

		expect(mockFetch).toHaveBeenCalledWith(
			'https://test.atlassian.net/rest/api/3/issue/PROJ-1',
			expect.objectContaining({
				method: 'PUT',
				body: JSON.stringify({ fields: { description: adf } })
			})
		);
	});
});

describe('fetchCurrentUser', () => {
	it('should return mapped user data', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 200,
			json: async () => ({
				accountId: 'abc-123',
				displayName: 'Jane Doe',
				emailAddress: 'jane@example.com'
			})
		});

		const user = await fetchCurrentUser();
		expect(user).toEqual({
			accountId: 'abc-123',
			displayName: 'Jane Doe',
			emailAddress: 'jane@example.com'
		});
	});
});

describe('transitionTicket', () => {
	it('should find and execute matching transition', async () => {
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => ({
					transitions: [
						{ id: '11', name: 'Done', to: { name: 'Done', statusCategory: { key: 'done' } } },
						{ id: '21', name: 'Rejected', to: { name: 'Rejected', statusCategory: { key: 'done' } } }
					]
				})
			})
			.mockResolvedValueOnce({ ok: true, status: 204 });

		await transitionTicket('PROJ-1', 'Done');

		expect(mockFetch).toHaveBeenCalledTimes(2);
		expect(mockFetch).toHaveBeenLastCalledWith(
			'https://test.atlassian.net/rest/api/3/issue/PROJ-1/transitions',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ transition: { id: '11' } })
			})
		);
	});

	it('should match case-insensitively', async () => {
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: async () => ({
					transitions: [
						{ id: '21', name: 'Rejected', to: { name: 'Rejected', statusCategory: { key: 'done' } } }
					]
				})
			})
			.mockResolvedValueOnce({ ok: true, status: 204 });

		await transitionTicket('PROJ-1', 'rejected');
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	it('should throw JiraApiError if transition not found', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({
				transitions: [
					{ id: '11', name: 'In Progress', to: { name: 'In Progress', statusCategory: { key: 'indeterminate' } } }
				]
			})
		});

		await expect(transitionTicket('PROJ-1', 'Done')).rejects.toThrow(JiraApiError);
	});
});
