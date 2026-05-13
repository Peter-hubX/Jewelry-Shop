// src/app/api/products/route.ts
import { requireAdminSecret } from '@/lib/auth';
import { err, ok, preflight } from '@/lib/apiResponse';
import { calculateDynamicPrice } from '@/lib/pricing';
import { getLiveGram24kPrice } from '@/lib/goldPrices';
import { parseImages } from '@/lib/utils';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// ─── Allowed values ───────────────────────────────────────────────────────────

const ALLOWED_SORT_FIELDS = [
  'price', 'price-asc', 'price-desc',
  'weight', 'name', 'newest', 'trending', 'createdAt',
] as const;
type SortField = typeof ALLOWED_SORT_FIELDS[number];

const VALID_KARATS = [18, 21, 24] as const;

// ─── GET: list products (public) ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // --- Sanitised & validated params ---
    const category  = searchParams.get('category');
    const karats    = searchParams.getAll('karat')
                        .map(k => Number.parseInt(k))
                        .filter(k => !Number.isNaN(k) && (VALID_KARATS as readonly number[]).includes(k));
    const karat     = searchParams.get('karat') ? Number.parseInt(searchParams.get('karat')!) : null;
    const productType = searchParams.get('type');
    const featured  = searchParams.get('featured');
    const type      = searchParams.get('categoryType');
    const inStock   = searchParams.get('inStock');
    const ids       = searchParams.get('ids'); // for wishlist batch fetch (UX-03 fix)

    // Search: capped at 100 chars to prevent resource exhaustion (MED-01 fix)
    const rawSearch = searchParams.get('search');
    const search    = rawSearch ? rawSearch.trim().slice(0, 100) : null;

    // Price/weight range filters
    const minPrice  = searchParams.get('minPrice');
    const maxPrice  = searchParams.get('maxPrice');
    const minWeight = searchParams.get('minWeight');
    const maxWeight = searchParams.get('maxWeight');

    // Sort: strict allowlist enforced (MED-02 fix)
    const rawSort   = searchParams.get('sortBy') ?? 'trending';
    const sortBy: SortField = (ALLOWED_SORT_FIELDS as readonly string[]).includes(rawSort)
      ? rawSort as SortField
      : 'trending';

    const rawOrder  = searchParams.get('sortOrder') ?? 'desc';
    const sortOrder = rawOrder === 'asc' ? 'asc' : 'desc';

    // Pagination
    const pageParam = searchParams.get('page');
    const page      = pageParam ? Math.max(1, parseInt(pageParam)) : undefined;
    const limitRaw  = searchParams.get('limit');
    const limit     = limitRaw ? Math.min(100, Math.max(1, parseInt(limitRaw))) : undefined;

    // --- Build Prisma where clause ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let whereClause: any = {};

    if (ids) {
      // Wishlist batch fetch: filter by explicit id list
      const idList = ids.split(',').filter(Boolean).slice(0, 200); // max 200 ids
      whereClause.id = { in: idList };
    }
    if (category)     whereClause.category = { nameAr: category };
    if (karats.length > 1) {
      whereClause.karat = { in: karats };
    } else if (karats.length === 1) {
      whereClause.karat = karats[0];
    } else if (karat && (VALID_KARATS as readonly number[]).includes(karat)) {
      whereClause.karat = karat;
    }
    if (productType)  whereClause.productType = productType;
    if (type)         whereClause.category = { ...whereClause.category, type };
    if (featured === 'true') whereClause.featured = true;
    if (inStock === 'true')  whereClause.inStock  = true;
    if (search) {
      whereClause.OR = [
        { nameAr: { contains: search } },
        { descriptionAr: { contains: search } },
      ];
    }
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) { const v = parseFloat(minPrice); if (!isNaN(v)) whereClause.price.gte = v; }
      if (maxPrice) { const v = parseFloat(maxPrice); if (!isNaN(v)) whereClause.price.lte = v; }
    }
    if (minWeight || maxWeight) {
      whereClause.weight = {};
      if (minWeight) { const v = parseFloat(minWeight); if (!isNaN(v)) whereClause.weight.gte = v; }
      if (maxWeight) { const v = parseFloat(maxWeight); if (!isNaN(v)) whereClause.weight.lte = v; }
    }

    // --- Build order-by ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any;
    switch (sortBy) {
      case 'price':
      case 'price-asc':  orderBy = [{ price: 'asc' },  { weight: 'asc' }];  break;
      case 'price-desc': orderBy = [{ price: 'desc' }, { weight: 'desc' }]; break;
      case 'weight':     orderBy = { weight: sortOrder };                    break;
      case 'name':       orderBy = { nameAr: sortOrder };                    break;
      case 'newest':
      case 'createdAt':  orderBy = { createdAt: 'desc' };                   break;
      case 'trending':
      default:           orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
    }

    const skip = page && limit ? (page - 1) * limit : undefined;

    // Fetch products and live gold prices in parallel
    const [products, totalCount, goldPrices] = await Promise.all([
      db.product.findMany({
        where: whereClause,
        include: { category: true },
        orderBy,
        take: limit,
        skip,
      }),
      page ? db.product.count({ where: whereClause }) : Promise.resolve(0),
      getLiveGram24kPrice(),
    ]);

    const productsWithDynamicPrices = products.map(product => ({
      ...product,
      images: parseImages(product.images),
      price: calculateDynamicPrice(product.weight, product.karat, product.productType, goldPrices),
    }));

    if (page && limit) {
      return ok({
        data: productsWithDynamicPrices,
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
      });
    }

    return ok(productsWithDynamicPrices);
  } catch (error) {
    console.error('Error fetching products:', error);
    return err('Failed to fetch products', 500);
  }
}

// ─── POST: create product (admin only) ───────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const authError = requireAdminSecret(request, 'ADMIN_API_SECRET');
    if (authError) return authError;

    const body = await request.json();
    const {
      name, nameAr, description, descriptionAr, price, weight,
      karat, purity, images, inStock, featured, categoryId,
      certificate, manufacturer, productType,
    } = body;

    if (!name || !nameAr)
      return err('Name and nameAr are required', 400);
    if (!karat || !(VALID_KARATS as readonly number[]).includes(karat))
      return err('Karat must be 18, 21, or 24', 400);
    if (!categoryId)
      return err('CategoryId is required', 400);

    let validatedPrice: number | null = null;
    if (price !== undefined && price !== null) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) return err('Price must be a positive number', 400);
      validatedPrice = priceNum;
    }

    let validatedWeight: number | null = null;
    if (weight !== undefined && weight !== null) {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum <= 0) return err('Weight must be a positive number', 400);
      validatedWeight = weightNum;
    }

    let validatedImages: string | null = null;
    if (images && Array.isArray(images)) {
      const validImgs = images.filter(
        (img: unknown) => typeof img === 'string' && (img.startsWith('/') || img.startsWith('http'))
      );
      if (validImgs.length > 0) validatedImages = JSON.stringify(validImgs);
    }

    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category) return err('Category not found', 404);

    const product = await db.product.create({
      data: {
        name: name.trim(), nameAr: nameAr.trim(),
        description: description?.trim() || null, descriptionAr: descriptionAr?.trim() || null,
        price: validatedPrice, weight: validatedWeight, karat,
        purity: purity?.trim() || null, images: validatedImages,
        inStock: inStock !== undefined ? Boolean(inStock) : true,
        featured: featured !== undefined ? Boolean(featured) : false,
        categoryId, certificate: certificate?.trim() || null,
        manufacturer: manufacturer?.trim() || null, productType: productType?.trim() || null,
      },
      include: { category: true },
    });

    return ok({ ...product, images: parseImages(product.images) }, 201);
  } catch (error) {
    console.error('Error creating product:', error);
    return err('Failed to create product', 500, {
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ─── OPTIONS: preflight ───────────────────────────────────────────────────────

export async function OPTIONS() {
  return preflight();
}
