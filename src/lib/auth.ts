/**
 * Centralised authentication utilities for API route handlers.
 * Uses constant-time comparison to prevent timing-based secret leaks (HIGH-01 fix).
 */
import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

type AdminSecretKey = 'ADMIN_API_SECRET' | 'GOLD_PRICE_UPDATE_SECRET';

/**
 * Validates the Bearer token against the specified environment secret using
 * a constant-time comparison (resistant to timing attacks).
 *
 * Returns a 401/500 NextResponse if auth fails, or null if auth passes.
 * Usage:
 *   const authError = requireAdminSecret(request, 'ADMIN_API_SECRET');
 *   if (authError) return authError;
 */
export function requireAdminSecret(
  request: NextRequest,
  secretEnvKey: AdminSecretKey
): NextResponse | null {
  const expected = process.env[secretEnvKey];

  if (!expected) {
    console.error(`[auth] Environment variable ${secretEnvKey} is not configured`);
    return NextResponse.json(
      { error: 'Server misconfigured. Contact administrator.' },
      { status: 500 }
    );
  }

  const provided = request.headers.get('authorization') ?? '';
  const expectedHeader = `Bearer ${expected}`;

  // Hash both values so they have identical byte-lengths before comparing.
  // timingSafeEqual requires equal-length buffers.
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expectedHeader).digest();

  if (!timingSafeEqual(a, b)) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 401 }
    );
  }

  return null; // auth passed
}
