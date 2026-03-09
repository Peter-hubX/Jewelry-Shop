import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        karat: 'asc'
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Security: Check for authentication token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_SECRET || 'dev-secret'}`) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      karat,
      type
    } = body;

    // Input validation
    if (!name || !nameAr) {
      return NextResponse.json(
        { error: 'Name and nameAr are required' },
        { status: 400 }
      );
    }

    if (!karat || ![18, 21, 24].includes(karat)) {
      return NextResponse.json(
        { error: 'Karat must be 18, 21, or 24' },
        { status: 400 }
      );
    }

    if (!type || !['jewelry', 'bar'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "jewelry" or "bar"' },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: {
        name: name.trim(),
        nameAr: nameAr.trim(),
        description: description?.trim() || null,
        descriptionAr: descriptionAr?.trim() || null,
        karat,
        type
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}