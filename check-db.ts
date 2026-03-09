import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// Load env manually if needed, or rely on Prisma to pick it up if .env is in root
// But let's verify file existence
console.log('CWD:', process.cwd());
const dbPath = path.join(process.cwd(), 'db', 'custom.db');
console.log('DB Path:', dbPath);
console.log('DB Exists:', fs.existsSync(dbPath));

// Force absolute path for DATABASE_URL
const dbAbsolutePath = path.join(process.cwd(), 'db', 'custom.db');
process.env.DATABASE_URL = `file:${dbAbsolutePath}`;
console.log('Forced DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        include: { category: true }
    });

    const knownFiles = [
        '/18k-necklace.jpg',
        '/18k-ring.jpg',
        '/21k-bracelet.jpg',
        '/21k-earrings.jpg',
        '/24k-bar-1g.jpg',
        '/24k-bars-collection.jpg',
        '/btc-gold-bars.jpg'
    ];

    console.log('Validating stored images...');
    let allValid = true;

    products.forEach(p => {
        let images: string[] = [];
        try {
            images = JSON.parse(p.images as string);
        } catch (e) {
            console.error(`Error parsing images for ${p.name}`);
        }

        if (images.length === 0) {
            console.log(`[WARN] No images for ${p.name}`);
        }

        images.forEach(img => {
            if (!knownFiles.includes(img)) {
                console.log(`[FAIL] Invalid image path: ${img} for product ${p.name}`);
                allValid = false;
            }
        });
    });

    if (products.length === 0) {
        console.log('FAILURE: No products found in the database.');
        allValid = false;
    }

    if (allValid) {
        console.log(`SUCCESS: All ${products.length} database image paths are valid.`);
    } else {
        console.log('FAILURE: Found invalid image paths or no products.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
