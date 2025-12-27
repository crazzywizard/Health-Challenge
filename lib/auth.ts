import { createHash } from 'crypto';

/**
 * Hash a password using SHA-256
 */
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  return passwordHash === hash;
}

/**
 * Check if user is authenticated by verifying session cookie
 */
export function isAuthenticated(cookies: Map<string, string>): boolean {
  const session = cookies.get('app_session');
  return session === 'authenticated';
}

/**
 * Get the expected password hash from environment
 */
export function getPasswordHash(): string {
  const hash = process.env.APP_PASSWORD_HASH;
  if (!hash) {
    throw new Error('APP_PASSWORD_HASH environment variable is not set');
  }
  return hash;
}
