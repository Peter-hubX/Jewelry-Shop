const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const all = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } });
  console.log(`Total products: ${all.length}`);

  const bars24 = all.filter(p => p.karat === 24 && p.productType === 'bar');
  console.log(`24K bars found: ${bars24.length}`);

  if (bars24.length > 0) {
    console.log('\nSample 24K bars:');
    bars24.slice(0, 20).forEach((b) => {
      console.log(`- id=${b.id} nameAr=${b.nameAr} weight=${b.weight} price=${b.price}`);
    });
  }

  console.log('\nListing first 20 products:');
  all.slice(0, 20).forEach((p) => {
    console.log(`- id=${p.id} nameAr=${p.nameAr} karat=${p.karat} type=${p.productType} weight=${p.weight} price=${p.price}`);
  });
}

main()
  .catch((e) => {
    console.error('Error listing products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
