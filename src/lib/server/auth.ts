import { config } from './config.js';
import type { UserSession } from './session.js';

const ATLASSIAN_AUTH_URL = 'https://auth.atlassian.com/authorize';
const ATLASSIAN_TOKEN_URL = 'https://auth.atlassian.com/oauth/token';
const ATLASSIAN_RESOURCES_URL = 'https://api.atlassian.com/oauth/token/accessible-resources';
const ATLASSIAN_ME_URL = 'https://api.atlassian.com/me';

const SCOPES = ['read:jira-work', 'write:jira-work', 'offline_access'];

export function getAuthorizationUrl(state: string): string {
	const params = new URLSearchParams({
		audience: 'api.atlassian.com',
		client_id: config.atlassian.clientId,
		scope: SCOPES.join(' '),
		redirect_uri: config.atlassian.redirectUri,
		state,
		response_type: 'code',
		prompt: 'consent'
	});
	return `${ATLASSIAN_AUTH_URL}?${params.toString()}`;
}

interface TokenResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	scope: string;
	token_type: string;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
	const response = await fetch(ATLASSIAN_TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			grant_type: 'authorization_code',
			client_id: config.atlassian.clientId,
			client_secret: config.atlassian.clientSecret,
			code,
			redirect_uri: config.atlassian.redirectUri
		})
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Token exchange failed (${response.status}): ${body}`);
	}

	return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
	const response = await fetch(ATLASSIAN_TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			grant_type: 'refresh_token',
			client_id: config.atlassian.clientId,
			client_secret: config.atlassian.clientSecret,
			refresh_token: refreshToken
		})
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Token refresh failed (${response.status}): ${body}`);
	}

	return response.json();
}

interface AccessibleResource {
	id: string;
	name: string;
	url: string;
	scopes: string[];
}

export async function fetchAccessibleResources(accessToken: string): Promise<AccessibleResource[]> {
	const response = await fetch(ATLASSIAN_RESOURCES_URL, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch accessible resources (${response.status})`);
	}

	return response.json();
}

interface AtlassianUser {
	account_id: string;
	name: string;
	email: string;
}

export async function fetchCurrentUser(accessToken: string): Promise<AtlassianUser> {
	const response = await fetch(ATLASSIAN_ME_URL, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch user profile (${response.status})`);
	}

	return response.json();
}

export function buildSessionFromTokens(
	tokens: TokenResponse,
	cloudId: string,
	user: AtlassianUser
): UserSession {
	return {
		accessToken: tokens.access_token,
		refreshToken: tokens.refresh_token,
		expiresAt: Date.now() + tokens.expires_in * 1000,
		cloudId,
		userDisplayName: user.name,
		userAccountId: user.account_id
	};
}
