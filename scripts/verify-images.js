const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const placeholder = '/screenshot-desktop.png';

  console.log('Scanning products for image path issues...');
  const products = await prisma.product.findMany();

  const missingEntries = [];

  for (const p of products) {
    let images = [];
    try {
      images = p.images ? JSON.parse(p.images) : [];
    } catch (err) {
      console.error(`Failed to parse images for product ${p.id}:`, err.message);
      images = [];
    }

    const newImages = [...images];
    let changed = false;

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (typeof img !== 'string') continue;

      if (img.startsWith('/')) {
        const filePath = path.join(process.cwd(), 'public', img.replace(/^\//, ''));
        if (!fs.existsSync(filePath)) {
          missingEntries.push({ productId: p.id, image: img, filePath });
          console.warn(`Missing file for product ${p.id}: ${img} -> ${filePath}`);
          if (shouldFix) {
            newImages[i] = placeholder;
            changed = true;
            console.log(`Will replace with placeholder ${placeholder}`);
          }
        }
      } else if (img.startsWith('http://') || img.startsWith('https://')) {
        // Optionally we could HEAD the URL, but skip network checks by default
      } else {
        // Relative or malformed path — treat as missing
        missingEntries.push({ productId: p.id, image: img, filePath: null });
        console.warn(`Unrecognized image path for product ${p.id}: ${img}`);
        if (shouldFix) {
          newImages[i] = placeholder;
          changed = true;
        }
      }
    }

    if (changed) {
      await prisma.product.update({
        where: { id: p.id },
        data: { images: JSON.stringify(newImages) }
      });
      console.log(`Updated product ${p.id} images to use placeholder.`);
    }
  }

  console.log('\nSummary:');
  if (missingEntries.length === 0) {
    console.log('No missing local images found.');
  } else {
    console.log(`Found ${missingEntries.length} missing image paths.`);
    missingEntries.slice(0, 50).forEach((m) => console.log(`- product ${m.productId}: ${m.image}`));
    if (!shouldFix) {
      console.log('\nRun with `node scripts/verify-images.js --fix` to replace missing local images with a placeholder image.');
    }
  }
}

main()
  .catch((e) => {
    console.error('Script failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
