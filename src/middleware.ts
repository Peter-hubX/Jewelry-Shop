import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// ─── In-memory rate limiter ───────────────────────────────────────────────────
// NOTE: This map lives per-process. On multi-worker/serverless deployments,
// each worker has its own isolated map. For production scale, replace with
// a Redis-backed solution (e.g. @upstash/ratelimit).
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count++;
  return true;
}

// ─── CORS config ──────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

// ─── Security headers applied to ALL routes ───────────────────────────────────
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  return response;
}

// ─── CORS headers for API routes ──────────────────────────────────────────────
function applyCORSHeaders(response: NextResponse, requestOrigin: string | null): NextResponse {
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    response.headers.set('Access-Control-Allow-Origin', requestOrigin);
    response.headers.set('Vary', 'Origin');
  } else if (!requestOrigin && process.env.NODE_ENV === 'development') {
    // Allow same-origin dev requests with no Origin header
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
  // No wildcard '*' — ever (CRIT-02 fix: wildcard removed from all layers)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const origin   = request.headers.get('origin');
  const method   = request.method;
  const ip       = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';

  // ── Rate limit write operations on API routes ──
  if (pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const allowed = rateLimit(ip, 30, 60_000); // 30 mutations per minute per IP
    if (!allowed) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }
  }

  // ── Log API requests (dev only to avoid noise in production logs) ──
  if (pathname.startsWith('/api/') && process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${method} ${pathname} | Origin: ${origin ?? 'none'}`);
  }

  // ── Handle preflight (OPTIONS) ──
  if (method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    applyCORSHeaders(response, origin);
    response.headers.set('Access-Control-Max-Age', '86400');
    return applySecurityHeaders(response);
  }

  // ── All other requests ──
  const response = NextResponse.next();

  if (pathname.startsWith('/api/')) {
    applyCORSHeaders(response, origin);
  }

  return applySecurityHeaders(response);
}

// ─── Matcher: runs on ALL routes (not just /api) ─────────────────────────────
// This ensures security headers (X-Frame-Options etc.) protect every page,
// including /product/[id] and / (REFACTOR-06 fix).
export const config = {
  matcher: [
    '/api/:path*',
    // All page routes except Next.js internal static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot|css|js)$).*)',
  ],
};
