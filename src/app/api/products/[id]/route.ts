// src/app/api/products/[id]/route.ts
import { db } from '@/lib/db';
import { getLiveGram24kPrice } from '@/lib/goldPrices';
import { NextRequest, NextResponse } from 'next/server';

function calculateDynamicPrice(
    weight: number | null,
    karat: number,
    productType: string | null,
    goldPrices: { gram24k: number; gram21k: number; gram18k: number }
): number | null {
    if (!weight || weight <= 0) return null;

    let pricePerGram: number;
    switch (karat) {
        case 24: pricePerGram = goldPrices.gram24k; break;
        case 21: pricePerGram = goldPrices.gram21k; break;
        case 18: pricePerGram = goldPrices.gram18k; break;
        default: return null;
    }

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

const applyCORS = (res: NextResponse) => {
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
};

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const [product, goldPrices] = await Promise.all([
            db.product.findUnique({
                where: { id },
                include: { category: true },
            }),
            getLiveGram24kPrice(),
        ]);

        if (!product) {
            return applyCORS(
                NextResponse.json({ error: 'Product not found' }, { status: 404 })
            );
        }

        const images = product.images ? JSON.parse(product.images) : [];
        const calculatedPrice = calculateDynamicPrice(
            product.weight,
            product.karat,
            product.productType,
            goldPrices
        );

        return applyCORS(
            NextResponse.json({
                ...product,
                images,
                price: calculatedPrice,
                calculatedPrice,
            })
        );
    } catch (error) {
        console.error('Error fetching product:', error);
        return applyCORS(
            NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
        );
    }
}

export async function OPTIONS() {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('authorization');
        const secret = process.env.ADMIN_API_SECRET;
        if (!secret) throw new Error('ADMIN_API_SECRET is not configured');
        if (!authHeader || authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();

        const existing = await db.product.findUnique({ where: { id } });
        if (!existing) {
            return applyCORS(NextResponse.json({ error: 'Product not found' }, { status: 404 }));
        }

        const updateData: any = {};
        const fields = ['name', 'nameAr', 'description', 'descriptionAr', 'weight', 'karat',
            'purity', 'inStock', 'featured', 'categoryId', 'certificate', 'manufacturer', 'productType'];
        for (const f of fields) {
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

        return applyCORS(NextResponse.json({
            ...updated,
            images: updated.images ? JSON.parse(updated.images) : [],
        }));
    } catch (error) {
        console.error('Error updating product:', error);
        return applyCORS(NextResponse.json({ error: 'Failed to update product' }, { status: 500 }));
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get('authorization');
        const secret = process.env.ADMIN_API_SECRET;
        if (!secret) throw new Error('ADMIN_API_SECRET is not configured');
        if (!authHeader || authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const existing = await db.product.findUnique({ where: { id } });
        if (!existing) {
            return applyCORS(NextResponse.json({ error: 'Product not found' }, { status: 404 }));
        }

        await db.product.delete({ where: { id } });
        return applyCORS(NextResponse.json({ success: true }));
    } catch (error) {
        console.error('Error deleting product:', error);
        return applyCORS(NextResponse.json({ error: 'Failed to delete product' }, { status: 500 }));
    }
}