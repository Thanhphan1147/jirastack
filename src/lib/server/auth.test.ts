import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuthorizationUrl, buildSessionFromTokens } from './auth.js';

vi.mock('./config.js', () => ({
	config: {
		atlassian: {
			clientId: 'test-client-id',
			clientSecret: 'test-client-secret',
			redirectUri: 'http://localhost:3000/auth/callback'
		}
	}
}));

describe('auth', () => {
	describe('getAuthorizationUrl', () => {
		it('should build a valid Atlassian authorization URL', () => {
			const url = new URL(getAuthorizationUrl('test-state'));

			expect(url.origin).toBe('https://auth.atlassian.com');
			expect(url.pathname).toBe('/authorize');
			expect(url.searchParams.get('client_id')).toBe('test-client-id');
			expect(url.searchParams.get('redirect_uri')).toBe(
				'http://localhost:3000/auth/callback'
			);
			expect(url.searchParams.get('state')).toBe('test-state');
			expect(url.searchParams.get('response_type')).toBe('code');
			expect(url.searchParams.get('scope')).toContain('read:jira-work');
			expect(url.searchParams.get('scope')).toContain('write:jira-work');
			expect(url.searchParams.get('scope')).toContain('offline_access');
			expect(url.searchParams.get('audience')).toBe('api.atlassian.com');
		});
	});

	describe('buildSessionFromTokens', () => {
		it('should construct a UserSession from token response', () => {
			const before = Date.now();
			const session = buildSessionFromTokens(
				{
					access_token: 'at-123',
					refresh_token: 'rt-456',
					expires_in: 3600,
					scope: 'read:jira-work write:jira-work offline_access',
					token_type: 'Bearer'
				},
				'cloud-789',
				{ account_id: 'user-1', name: 'Jane Doe', email: 'jane@example.com' }
			);

			expect(session.accessToken).toBe('at-123');
			expect(session.refreshToken).toBe('rt-456');
			expect(session.cloudId).toBe('cloud-789');
			expect(session.userDisplayName).toBe('Jane Doe');
			expect(session.userAccountId).toBe('user-1');
			expect(session.expiresAt).toBeGreaterThanOrEqual(before + 3600_000);
		});
	});
});
