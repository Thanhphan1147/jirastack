import { describe, it, expect, beforeEach } from 'vitest';
import {
	getSession,
	setSession,
	deleteSession,
	generateSessionId,
	type UserSession
} from './session.js';

const mockSession: UserSession = {
	accessToken: 'test-access-token',
	refreshToken: 'test-refresh-token',
	expiresAt: Date.now() + 3600_000,
	cloudId: 'test-cloud-id',
	userDisplayName: 'Test User',
	userAccountId: 'test-account-id'
};

describe('session store', () => {
	const testId = 'test-session-id';

	beforeEach(() => {
		deleteSession(testId);
	});

	it('should return undefined for nonexistent session', () => {
		expect(getSession('nonexistent')).toBeUndefined();
	});

	it('should store and retrieve a session', () => {
		setSession(testId, mockSession);
		expect(getSession(testId)).toEqual(mockSession);
	});

	it('should delete a session', () => {
		setSession(testId, mockSession);
		deleteSession(testId);
		expect(getSession(testId)).toBeUndefined();
	});

	it('should generate unique session IDs', () => {
		const id1 = generateSessionId();
		const id2 = generateSessionId();
		expect(id1).not.toBe(id2);
		expect(id1).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
		);
	});
});
