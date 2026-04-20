import { db } from '@/lib/db';
import { getLiveGram24kPrice } from '@/lib/goldPrices';
import { NextRequest, NextResponse } from 'next/server';

/** Calculate dynamic price for a product based on live gold price */
function calculateDynamicPrice(weight: number | null, karat: number, productType: string | null, goldPrices: { gram24k: number; gram21k: number; gram18k: number }): number | null {
  if (!weight || weight <= 0) return null;

  let pricePerGram: number;
  switch (karat) {
    case 24: pricePerGram = goldPrices.gram24k; break;
    case 21: pricePerGram = goldPrices.gram21k; break;
    case 18: pricePerGram = goldPrices.gram18k; break;
    default: return null;
  }

  // Craftsmanship premium: bars have lower premium than jewelry
  let premium: number;
  if (karat === 24) {
    premium = weight >= 10 ? 1.02 : 1.05;
  } else if (productType === 'bar') {
    premium = karat === 21 ? 1.08 : 1.1;
  } else {
    premium = karat === 21 ? 1.2 : 1.25;
  }

  return Math.round(weight * pricePerGram * premium);
}

export async function GET(request: NextRequest) {
  const applyCORS = (res: NextResponse) => {
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
  };

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const karat = searchParams.get('karat');
    const productType = searchParams.get('type');
    const featured = searchParams.get('featured');
    const type = searchParams.get('categoryType');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minWeight = searchParams.get('minWeight');
    const maxWeight = searchParams.get('maxWeight');
    const inStock = searchParams.get('inStock');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const rawOrder = searchParams.get('sortOrder') ?? 'desc';
    const sortOrder = ['asc', 'desc'].includes(rawOrder) ? rawOrder : 'desc';

    let whereClause: any = {};

    if (category) whereClause.category = { nameAr: category };
    if (karat) {
      const karatNum = Number.parseInt(karat);
      if (!Number.isNaN(karatNum) && [18, 21, 24].includes(karatNum)) whereClause.karat = karatNum;
    }
    if (productType) whereClause.productType = productType;
    if (type) whereClause.category = { ...whereClause.category, type };
    if (featured === 'true') whereClause.featured = true;
    if (inStock === 'true') whereClause.inStock = true;
    if (search) {
      whereClause.OR = [
        { nameAr: { contains: search } },
        { descriptionAr: { contains: search } }
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

    let orderBy: any = {};
    switch (sortBy) {
      case 'price': orderBy = { price: sortOrder }; break;
      case 'weight': orderBy = { weight: sortOrder }; break;
      case 'name': orderBy = { nameAr: sortOrder }; break;
      default: orderBy = { createdAt: sortOrder };
    }

    // Fetch products and live gold prices in parallel
    const [products, goldPrices] = await Promise.all([
      db.product.findMany({ where: whereClause, include: { category: true }, orderBy }),
      getLiveGram24kPrice()
    ]);

    const productsWithDynamicPrices = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      // Always calculate price dynamically from live gold price
      price: calculateDynamicPrice(product.weight, product.karat, product.productType, goldPrices),
    }));

    return applyCORS(NextResponse.json(productsWithDynamicPrices));
  } catch (error) {
    console.error('Error fetching products:', error);
    return applyCORS(NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 }));
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.ADMIN_API_SECRET;
    if (!secret) throw new Error('ADMIN_API_SECRET is not configured');
    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, nameAr, description, descriptionAr, price, weight, karat, purity, images, inStock, featured, categoryId, certificate, manufacturer, productType } = body;

    if (!name || !nameAr) return NextResponse.json({ error: 'Name and nameAr are required' }, { status: 400 });
    if (!karat || ![18, 21, 24].includes(karat)) return NextResponse.json({ error: 'Karat must be 18, 21, or 24' }, { status: 400 });
    if (!categoryId) return NextResponse.json({ error: 'CategoryId is required' }, { status: 400 });

    let validatedPrice: number | null = null;
    if (price !== undefined && price !== null) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
      validatedPrice = priceNum;
    }

    let validatedWeight: number | null = null;
    if (weight !== undefined && weight !== null) {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum <= 0) return NextResponse.json({ error: 'Weight must be a positive number' }, { status: 400 });
      validatedWeight = weightNum;
    }

    let validatedImages: string | null = null;
    if (images && Array.isArray(images)) {
      const validImages = images.filter((img: any) => typeof img === 'string' && (img.startsWith('/') || img.startsWith('http')));
      if (validImages.length > 0) validatedImages = JSON.stringify(validImages);
    }

    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    const product = await db.product.create({
      data: {
        name: name.trim(), nameAr: nameAr.trim(),
        description: description?.trim() || null, descriptionAr: descriptionAr?.trim() || null,
        price: validatedPrice, weight: validatedWeight, karat,
        purity: purity?.trim() || null, images: validatedImages,
        inStock: inStock !== undefined ? Boolean(inStock) : true,
        featured: featured !== undefined ? Boolean(featured) : false,
        categoryId, certificate: certificate?.trim() || null,
        manufacturer: manufacturer?.trim() || null, productType: productType?.trim() || null
      },
      include: { category: true }
    });

    return NextResponse.json({ ...product, images: product.images ? JSON.parse(product.images) : [] }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
