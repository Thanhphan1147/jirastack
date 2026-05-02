import { env } from '$env/dynamic/private';

function required(name: string): string {
	const value = env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export const config = {
	atlassian: {
		clientId: required('ATLASSIAN_CLIENT_ID'),
		clientSecret: required('ATLASSIAN_CLIENT_SECRET'),
		redirectUri: required('ATLASSIAN_REDIRECT_URI')
	}
} as const;
