export interface UserSession {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
	cloudId: string;
	userDisplayName: string;
	userAccountId: string;
}

const sessions = new Map<string, UserSession>();

export function getSession(sessionId: string): UserSession | undefined {
	return sessions.get(sessionId);
}

export function setSession(sessionId: string, session: UserSession): void {
	sessions.set(sessionId, session);
}

export function deleteSession(sessionId: string): void {
	sessions.delete(sessionId);
}

export function generateSessionId(): string {
	return crypto.randomUUID();
}
