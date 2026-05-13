// src/app/api/products/[id]/route.ts
import { requireAdminSecret } from '@/lib/auth';
import { err, ok, preflight } from '@/lib/apiResponse';
import { calculateDynamicPrice } from '@/lib/pricing';
import { getLiveGram24kPrice } from '@/lib/goldPrices';
import { parseImages } from '@/lib/utils';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// ─── GET: single product (public) ────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [product, goldPrices] = await Promise.all([
      db.product.findUnique({ where: { id }, include: { category: true } }),
      getLiveGram24kPrice(),
    ]);

    if (!product) return err('Product not found', 404);

    const calculatedPrice = calculateDynamicPrice(
      product.weight, product.karat, product.productType, goldPrices
    );

    return ok({
      ...product,
      images: parseImages(product.images),
      price: calculatedPrice,
      calculatedPrice,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return err('Failed to fetch product', 500);
  }
}

// ─── PUT: update product (admin only) ────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAdminSecret(request, 'ADMIN_API_SECRET');
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return err('Product not found', 404);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    const allowedFields = [
      'name', 'nameAr', 'description', 'descriptionAr', 'weight', 'karat',
      'purity', 'inStock', 'featured', 'categoryId', 'certificate', 'manufacturer', 'productType',
    ];
    for (const f of allowedFields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    if (body.images && Array.isArray(body.images)) {
      updateData.images = JSON.stringify(body.images);
    }

    const updated = await db.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return ok({ ...updated, images: parseImages(updated.images) });
  } catch (error) {
    console.error('Error updating product:', error);
    return err('Failed to update product', 500);
  }
}

// ─── DELETE: remove product (admin only) ─────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAdminSecret(request, 'ADMIN_API_SECRET');
    if (authError) return authError;

    const { id } = await params;
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return err('Product not found', 404);

    await db.product.delete({ where: { id } });
    return ok({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return err('Failed to delete product', 500);
  }
}

// ─── OPTIONS: preflight ───────────────────────────────────────────────────────

export async function OPTIONS() {
  return preflight();
}