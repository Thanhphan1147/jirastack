import { env } from '$env/dynamic/private';

function required(name: string): string {
	const value = env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export const config = {
	jira: {
		get apiToken() {
			return required('JIRA_API_TOKEN');
		},
		get userEmail() {
			return required('JIRA_USER_EMAIL');
		},
		get baseUrl() {
			return required('JIRA_BASE_URL').replace(/\/$/, '');
		}
	}
} as const;

export function getJiraAuthHeader(): string {
	const credentials = Buffer.from(`${config.jira.userEmail}:${config.jira.apiToken}`).toString(
		'base64'
	);
	return `Basic ${credentials}`;
}
