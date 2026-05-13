const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const productCount = await prisma.product.count();
  const products = await prisma.product.findMany({
    include: { category: true }
  });
  
  console.log('Total Products:', productCount);
  console.log('Products Summary:');
  products.forEach(p => {
    console.log(`- ID: ${p.id}, Name: ${p.nameAr}, Karat: ${p.karat}, Type: ${p.productType}, Category: ${p.category.nameAr}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
