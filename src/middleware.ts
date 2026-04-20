import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, limit: number, window: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + window });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const origin = request.headers.get('origin') || 'no-origin';
  const method = request.method;

  // Log all API requests to help debug CORS
  if (pathname.startsWith('/api/')) {
    console.log(`[Middleware] ${method} ${pathname} | Origin: ${origin}`);
  }

  // Handle preflight requests
  if (method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    const requestOrigin = request.headers.get('origin');
    const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(',');
    
    if (requestOrigin) {
      if (ALLOWED_ORIGINS.includes(requestOrigin)) {
        response.headers.set('Access-Control-Allow-Origin', requestOrigin);
      }
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Max-Age', '86400');
    } else if (process.env.NODE_ENV === 'development') {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    return response;
  }

  // Handle actual request
  const response = NextResponse.next();

  // Apply CORS to API routes
  if (pathname.startsWith('/api/')) {
    const requestOrigin = request.headers.get('origin');
    const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(',');
    if (requestOrigin) {
      if (ALLOWED_ORIGINS.includes(requestOrigin)) {
        response.headers.set('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (process.env.NODE_ENV === 'development') {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Security headers for all requests
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
