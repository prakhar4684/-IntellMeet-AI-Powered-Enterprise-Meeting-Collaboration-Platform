import { describe, it, expect } from 'vitest';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt';

describe('Auth Security Unit Tests', () => {
  const payload = { userId: 'usr_test_123', role: 'Member' as const, email: 'test@intellmeet.io' };

  it('should generate valid JWT access token and verify payload', () => {
    const token = generateAccessToken(payload);
    expect(token).toBeDefined();
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.email).toBe(payload.email);
  });

  it('should generate valid JWT refresh token and verify payload', () => {
    const refreshToken = generateRefreshToken(payload);
    expect(refreshToken).toBeDefined();
    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded.userId).toBe(payload.userId);
  });
});
