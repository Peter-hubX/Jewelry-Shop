// src/app/api/categories/route.ts
import { requireAdminSecret } from '@/lib/auth';
import { err, ok } from '@/lib/apiResponse';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// ─── GET: list categories (public) ───────────────────────────────────────────

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { karat: 'asc' },
    });
    return ok(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return err('Failed to fetch categories', 500);
  }
}

// ─── POST: create category (admin only) ──────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const authError = requireAdminSecret(request, 'ADMIN_API_SECRET');
    if (authError) return authError;

    const body = await request.json();
    const { name, nameAr, description, descriptionAr, karat, type } = body;

    if (!name || !nameAr)
      return err('Name and nameAr are required', 400);
    if (!karat || ![18, 21, 24].includes(karat))
      return err('Karat must be 18, 21, or 24', 400);
    if (!type || !['jewelry', 'bar'].includes(type))
      return err('Type must be "jewelry" or "bar"', 400);

    const category = await db.category.create({
      data: {
        name: name.trim(),
        nameAr: nameAr.trim(),
        description: description?.trim() || null,
        descriptionAr: descriptionAr?.trim() || null,
        karat,
        type,
      },
    });

    return ok(category, 201);
  } catch (error) {
    console.error('Error creating category:', error);
    return err('Failed to create category', 500, {
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}