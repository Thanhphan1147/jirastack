import { describe, it, expect } from 'vitest';
import { getJiraAuthHeader } from './config.js';
import { vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
	env: {
		JIRA_API_TOKEN: 'test-token',
		JIRA_USER_EMAIL: 'user@example.com',
		JIRA_BASE_URL: 'https://test.atlassian.net'
	}
}));

describe('config', () => {
	it('should build a valid Basic auth header', () => {
		const header = getJiraAuthHeader();
		const decoded = Buffer.from(header.replace('Basic ', ''), 'base64').toString();
		expect(decoded).toBe('user@example.com:test-token');
	});
});
