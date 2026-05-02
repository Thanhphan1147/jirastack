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
		get clientId() {
			return required('ATLASSIAN_CLIENT_ID');
		},
		get clientSecret() {
			return required('ATLASSIAN_CLIENT_SECRET');
		},
		get redirectUri() {
			return required('ATLASSIAN_REDIRECT_URI');
		}
	}
} as const;
