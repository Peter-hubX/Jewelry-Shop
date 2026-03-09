import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let whereClause: any = {};

    if (category) {
      whereClause.category = {
        nameAr: category
      };
    }

    if (karat) {
      const karatNum = Number.parseInt(karat);
      if (!Number.isNaN(karatNum) && [18, 21, 24].includes(karatNum)) {
        whereClause.karat = karatNum;
      }
    }

    if (productType) {
      whereClause.productType = productType;
    }

    if (type) {
      whereClause.category = {
        ...whereClause.category,
        type: type
      };
    }

    if (featured === 'true') {
      whereClause.featured = true;
    }

    if (inStock === 'true') {
      whereClause.inStock = true;
    }

    // Search functionality
    if (search) {
      whereClause.OR = [
        {
          nameAr: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          descriptionAr: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Price range filtering
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) {
        const minP = parseFloat(minPrice);
        if (!isNaN(minP) && minP >= 0) {
          whereClause.price.gte = minP;
        }
      }
      if (maxPrice) {
        const maxP = parseFloat(maxPrice);
        if (!isNaN(maxP) && maxP >= 0) {
          whereClause.price.lte = maxP;
        }
      }
    }

    // Weight range filtering
    if (minWeight || maxWeight) {
      whereClause.weight = {};
      if (minWeight) {
        const minW = parseFloat(minWeight);
        if (!isNaN(minW) && minW >= 0) {
          whereClause.weight.gte = minW;
        }
      }
      if (maxWeight) {
        const maxW = parseFloat(maxWeight);
        if (!isNaN(maxW) && maxW >= 0) {
          whereClause.weight.lte = maxW;
        }
      }
    }

    // Determine sort order
    let orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy = { price: sortOrder };
        break;
      case 'weight':
        orderBy = { weight: sortOrder };
        break;
      case 'name':
        orderBy = { nameAr: sortOrder };
        break;
      default:
        orderBy = { createdAt: sortOrder };
    }

    const products = await db.product.findMany({
      where: whereClause,
      include: {
        category: true
      },
      orderBy
    });

    // Parse images JSON string for each product
    const productsWithParsedImages = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));

    return NextResponse.json(productsWithParsedImages);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Security: Check for authentication token (optional but recommended)
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
      price,
      weight,
      karat,
      purity,
      images,
      inStock,
      featured,
      categoryId,
      certificate,
      manufacturer,
      productType
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

    if (!categoryId) {
      return NextResponse.json(
        { error: 'CategoryId is required' },
        { status: 400 }
      );
    }

    // Validate price
    let validatedPrice: number | null = null;
    if (price !== undefined && price !== null) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        return NextResponse.json(
          { error: 'Price must be a positive number' },
          { status: 400 }
        );
      }
      validatedPrice = priceNum;
    }

    // Validate weight
    let validatedWeight: number | null = null;
    if (weight !== undefined && weight !== null) {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        return NextResponse.json(
          { error: 'Weight must be a positive number' },
          { status: 400 }
        );
      }
      validatedWeight = weightNum;
    }

    // Validate images array
    let validatedImages: string | null = null;
    if (images) {
      if (!Array.isArray(images)) {
        return NextResponse.json(
          { error: 'Images must be an array' },
          { status: 400 }
        );
      }
      // Validate image URLs/paths
      const validImages = images.filter(img =>
        typeof img === 'string' && (img.startsWith('/') || img.startsWith('http://') || img.startsWith('https://'))
      );
      if (validImages.length > 0) {
        validatedImages = JSON.stringify(validImages);
      }
    }

    // Verify category exists
    const category = await db.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const product = await db.product.create({
      data: {
        name: name.trim(),
        nameAr: nameAr.trim(),
        description: description?.trim() || null,
        descriptionAr: descriptionAr?.trim() || null,
        price: validatedPrice,
        weight: validatedWeight,
        karat,
        purity: purity?.trim() || null,
        images: validatedImages,
        inStock: inStock !== undefined ? Boolean(inStock) : true,
        featured: featured !== undefined ? Boolean(featured) : false,
        categoryId,
        certificate: certificate?.trim() || null,
        manufacturer: manufacturer?.trim() || null,
        productType: productType?.trim() || null
      },
      include: {
        category: true
      }
    });

    const productWithParsedImages = {
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    };

    return NextResponse.json(productWithParsedImages, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}