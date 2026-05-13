/**
 * Centralised API response factory.
 * Replaces the copy-pasted `applyCORS` helper that appeared in 4 route files.
 * CORS is now handled exclusively by middleware.ts — no headers needed here.
 */
import { NextResponse } from 'next/server';

/** Successful JSON response */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/** Error JSON response */
export function err(message: string, status: number, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** Standard 204 OPTIONS preflight response (no body) */
export function preflight(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
