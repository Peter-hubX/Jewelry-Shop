import { PrismaClient } from '@prisma/client';


// Use the same DATABASE_URL as the app
console.log('Using DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  // Create categories
  const category18K = await prisma.category.create({
    data: {
      name: '18 Karat Gold',
      nameAr: 'ذهب 18 عيار',
      description: 'Modern designs for contemporary taste',
      descriptionAr: 'تصاميم حديثة للذوق العصري',
      karat: 18,
      type: 'jewelry'
    }
  });

  const category21K = await prisma.category.create({
    data: {
      name: '21 Karat Gold',
      nameAr: 'ذهب 21 عيار',
      description: 'Classic traditional designs',
      descriptionAr: 'تصاميم كلاسيكية وتراثية',
      karat: 21,
      type: 'jewelry'
    }
  });

  const category24K = await prisma.category.create({
    data: {
      name: '24 Karat Gold Bars',
      nameAr: 'سبائك ذهب 24 عيار',
      description: 'Certified investment gold bars',
      descriptionAr: 'سبائك ذهب معتمدة للاستثمار',
      karat: 24,
      type: 'bar'
    }
  });

  // Trending Categories - 21K Gold
  const categoryYouth = await prisma.category.create({
    data: {
      name: 'Youth Collection',
      nameAr: 'مجموعة الشباب',
      description: 'Modern minimalist designs perfect for young adults. Contemporary styles with clean lines and versatile appeal.',
      descriptionAr: 'تصاميم حديثة وبسيطة مثالية للشباب. أسلوب معاصر بخطوط نظيفة وجاذبية متنوعة.',
      karat: 21,
      type: 'jewelry'
    }
  });

  const categoryBridal = await prisma.category.create({
    data: {
      name: 'Bridal Collection',
      nameAr: 'مجموعة العرائس',
      description: 'Elegant wedding and engagement pieces. Timeless designs crafted for special moments and cherished memories.',
      descriptionAr: 'قطع زفاف وخطوبة أنيقة. تصاميم خالدة مصممة للحظات الخاصة والذكريات الغالية.',
      karat: 21,
      type: 'jewelry'
    }
  });

  const categoryFestival = await prisma.category.create({
    data: {
      name: 'Festival Collection',
      nameAr: 'مجموعة المناسبات',
      description: 'Festive and celebratory pieces for Eid and special occasions. Stunning designs to enhance your celebrations.',
      descriptionAr: 'قطع احتفالية وعيدية للعيد والمناسبات الخاصة. تصاميم مذهلة لتحسين احتفالاتك.',
      karat: 21,
      type: 'jewelry'
    }
  });

  console.log('Database seeded successfully!');
  const productsData = [
      // 18K Products
      {
        name: 'Modern Gold Ring',
        nameAr: 'خاتم ذهبي عصري',
        description: 'Elegant modern design with polished finish',
        descriptionAr: 'تصميم عصري أنيق بلمسة مصقولة',
        price: 2500,
        weight: 3,
        karat: 18,
        categoryId: category18K.id,
        productType: 'ring',
        featured: true,
        images: JSON.stringify(['/images/18k-ring.jpg'])
      },
      {
        name: 'Contemporary Gold Necklace',
        nameAr: 'قلادة ذهبية معاصرة',
        description: 'Sophisticated necklace for special occasions',
        descriptionAr: 'قلادة راقية للمناسبات الخاصة',
        price: 4500,
        weight: 8,
        karat: 18,
        categoryId: category18K.id,
        productType: 'necklace',
        featured: true,
        images: JSON.stringify(['/images/18k-necklace.jpg'])
      },
      {
        name: 'Gold Bracelet',
        nameAr: 'سوار ذهبي',
        description: 'Delicate bracelet with intricate details',
        descriptionAr: 'سوار رقيق بتفاصيل دقيقة',
        price: 3200,
        weight: 12,
        karat: 18,
        categoryId: category18K.id,
        productType: 'bracelet',
        images: JSON.stringify(['/images/21k-bracelet.jpg'])
      },
      {
        name: 'Gold Earrings',
        nameAr: 'حلقان ذهب',
        description: 'Stylish earrings for everyday elegance',
        descriptionAr: 'حلقان أنيقة للأناقة اليومية',
        price: 1800,
        weight: 4,
        karat: 18,
        categoryId: category18K.id,
        productType: 'earrings',
        images: JSON.stringify(['/images/21k-earrings.jpg'])
      },

      // 21K Products
      {
        name: 'Traditional Gold Ring',
        nameAr: 'خاتم ذهبي تقليدي',
        description: 'Classic design inspired by heritage',
        descriptionAr: 'تصميم كلاسيكي مستوحى من التراث',
        price: 2800,
        weight: 4,
        karat: 21,
        categoryId: category21K.id,
        productType: 'ring',
        featured: true,
        images: JSON.stringify(['/images/18k-ring.jpg'])
      },
      {
        name: 'Heritage Necklace',
        nameAr: 'قلادة تراثية',
        description: 'Traditional necklace with cultural motifs',
        descriptionAr: 'قلادة تقليدية بزخارف ثقافية',
        price: 5200,
        weight: 10,
        karat: 21,
        categoryId: category21K.id,
        productType: 'necklace',
        images: JSON.stringify(['/images/18k-necklace.jpg'])
      },
      {
        name: 'Classic Gold Bracelet',
        nameAr: 'سوار ذهبي كلاسيكي',
        description: 'Timeless design with traditional craftsmanship',
        descriptionAr: 'تصميم خالد بحرفية تقليدية',
        price: 3800,
        weight: 15,
        karat: 21,
        categoryId: category21K.id,
        productType: 'bracelet',
        featured: true,
        images: JSON.stringify(['/images/21k-bracelet.jpg'])
      },
      {
        name: 'Traditional Gold Earrings',
        nameAr: 'حلقان ذهب تقليدي',
        description: 'Classic Arabic design earrings',
        descriptionAr: 'حلقان بتصميم عربي تقليدي',
        price: 2200,
        weight: 5,
        karat: 21,
        categoryId: category21K.id,
        productType: 'earrings',
        featured: true,
        images: JSON.stringify(['/images/21k-earrings.jpg'])
      },

      // Youth Collection - 21K Products
      {
        name: 'Minimalist Gold Ring',
        nameAr: 'خاتم ذهبي بسيط',
        description: 'Sleek and simple ring design for everyday wear. Perfect for modern youth.',
        descriptionAr: 'تصميم خاتم أنيق وبسيط للاستخدام اليومي. مثالي للشباب العصريين.',
        price: 2100,
        weight: 2.5,
        karat: 21,
        categoryId: categoryYouth.id,
        productType: 'ring',
        featured: true,
        images: JSON.stringify(['/images/18k-ring.jpg'])
      },
      {
        name: 'Geometric Gold Necklace',
        nameAr: 'قلادة ذهب هندسية',
        description: 'Contemporary geometric pendant with modern appeal. Statement piece for young professionals.',
        descriptionAr: 'قلادة ذهنية معاصرة بتصميم هندسي عصري. قطعة مميزة للشباب المحترفين.',
        price: 3800,
        weight: 6,
        karat: 21,
        categoryId: categoryYouth.id,
        productType: 'necklace',
        featured: true,
        images: JSON.stringify(['/images/18k-necklace.jpg'])
      },
      {
        name: 'Sleek Gold Bracelet',
        nameAr: 'سوار ذهبي أنيق',
        description: 'Minimalist bracelet design with polished finish. Versatile for any outfit.',
        descriptionAr: 'تصميم سوار بسيط مع لمسة مصقولة. متعدد الاستخدام مع أي ملابس.',
        price: 2900,
        weight: 8,
        karat: 21,
        categoryId: categoryYouth.id,
        productType: 'bracelet',
        images: JSON.stringify(['/images/21k-bracelet.jpg'])
      },
      {
        name: 'Modern Gold Earrings',
        nameAr: 'حلقان ذهب عصري',
        description: 'Trendy drop earrings perfect for contemporary look. Lightweight and comfortable.',
        descriptionAr: 'حلقان عصري مثالي للمظهر المعاصر. خفيفة الوزن ومريحة.',
        price: 1600,
        weight: 3,
        karat: 21,
        categoryId: categoryYouth.id,
        productType: 'earrings',
        images: JSON.stringify(['/images/21k-earrings.jpg'])
      },

      // Bridal Collection - 21K Products
      {
        name: 'Engagement Ring - Classic',
        nameAr: 'خاتم الخطوبة - الكلاسيكي',
        description: 'Timeless solitaire engagement ring. Symbol of eternal love and commitment.',
        descriptionAr: 'خاتم خطوبة خالد. رمز الحب الأبدي والالتزام.',
        price: 8500,
        weight: 5,
        karat: 21,
        categoryId: categoryBridal.id,
        productType: 'ring',
        featured: true,
        images: JSON.stringify(['/images/18k-ring.jpg'])
      },
      {
        name: 'Wedding Necklace - Elegance',
        nameAr: 'قلادة الزفاف - الأناقة',
        description: 'Elegant bridal necklace with intricate craftsmanship. Perfect for your special day.',
        descriptionAr: 'قلادة زفاف أنيقة بحرفية دقيقة. مثالية لليومك الخاص.',
        price: 7200,
        weight: 12,
        karat: 21,
        categoryId: categoryBridal.id,
        productType: 'necklace',
        featured: true,
        images: JSON.stringify(['/images/18k-necklace.jpg'])
      },
      {
        name: 'Bridal Bracelet Set',
        nameAr: 'مجموعة الأساور الزفاف',
        description: 'Luxurious bracelet set for bride. Coordinated designs for perfect elegance.',
        descriptionAr: 'مجموعة أساور فاخرة للعروس. تصاميم منسقة للأناقة المثالية.',
        price: 5800,
        weight: 14,
        karat: 21,
        categoryId: categoryBridal.id,
        productType: 'bracelet',
        featured: true,
        images: JSON.stringify(['/images/21k-bracelet.jpg'])
      },
      {
        name: 'Bridal Earrings - Sparkle',
        nameAr: 'حلقان الزفاف - البريق',
        description: 'Stunning bridal earrings with elegant design. Complete your wedding look.',
        descriptionAr: 'حلقان زفاف مذهلة بتصميم أنيق. أكملي إطلالتك في الزفاف.',
        price: 4500,
        weight: 6,
        karat: 21,
        categoryId: categoryBridal.id,
        productType: 'earrings',
        featured: true,
        images: JSON.stringify(['/images/21k-earrings.jpg'])
      },

      // Festival Collection - 21K Products
      {
        name: 'Eid Ring - Festive',
        nameAr: 'خاتم العيد - احتفالي',
        description: 'Festive ring design celebrating special occasions. Vibrant and joyful jewelry.',
        descriptionAr: 'تصميم خاتم احتفالي للمناسبات الخاصة. مجوهرات مبهجة وفرحة.',
        price: 2400,
        weight: 3,
        karat: 21,
        categoryId: categoryFestival.id,
        productType: 'ring',
        featured: true,
        images: JSON.stringify(['/images/18k-ring.jpg'])
      },
      {
        name: 'Celebration Necklace',
        nameAr: 'قلادة الاحتفال',
        description: 'Eye-catching necklace perfect for festivals and celebrations. Stand out in style.',
        descriptionAr: 'قلادة جاذبة مثالية للعيد والاحتفالات. متميزة في الأسلوب.',
        price: 4600,
        weight: 9,
        karat: 21,
        categoryId: categoryFestival.id,
        productType: 'necklace',
        featured: true,
        images: JSON.stringify(['/images/18k-necklace.jpg'])
      },
      {
        name: 'Festive Gold Bracelet',
        nameAr: 'سوار ذهبي احتفالي',
        description: 'Decorative bracelet with festive charm. Perfect for Eid and special celebrations.',
        descriptionAr: 'سوار ذهبي مزخرف برونق احتفالي. مثالي للعيد والاحتفالات الخاصة.',
        price: 3500,
        weight: 10,
        karat: 21,
        categoryId: categoryFestival.id,
        productType: 'bracelet',
        images: JSON.stringify(['/images/21k-bracelet.jpg'])
      },
      {
        name: 'Celebration Earrings',
        nameAr: 'حلقان الاحتفال',
        description: 'Vibrant earrings to celebrate special moments. Express joy and elegance.',
        descriptionAr: 'حلقان مبهجة للاحتفاء باللحظات الخاصة. أظهري الفرح والأناقة.',
        price: 2000,
        weight: 4,
        karat: 21,
        categoryId: categoryFestival.id,
        productType: 'earrings',
        featured: true,
        images: JSON.stringify(['/images/21k-earrings.jpg'])
      },

      // 24K Gold Bars
      {
        name: '0.5 Gram Gold Bar',
        nameAr: 'سبيكة ذهب 0.5 جرام',
        description: 'Certified 24K gold bar',
        descriptionAr: 'سبيكة ذهب معتمدة 24 عيار',
        karat: 24,
        weight: 0.5,
        purity: '999.9',
        categoryId: category24K.id,
        productType: 'bar',
        certificate: 'LBMA Certified',
        manufacturer: 'PAMP Suisse',
        featured: true,
        images: JSON.stringify(['/images/24k-bar-1g.jpg'])
      },
      {
        name: '1 Gram Gold Bar',
        nameAr: 'سبيكة ذهب 1 جرام',
        description: 'Certified 24K gold bar',
        descriptionAr: 'سبيكة ذهب معتمدة 24 عيار',
        karat: 24,
        weight: 1,
        purity: '999.9',
        categoryId: category24K.id,
        productType: 'bar',
        certificate: 'LBMA Certified',
        manufacturer: 'PAMP Suisse',
        featured: true,
        images: JSON.stringify(['/images/24k-bar-1g.jpg'])
      },
      {
        name: '2 Gram Gold Bar',
        nameAr: 'سبيكة ذهب 2 جرام',
        description: 'Certified 24K gold bar',
        descriptionAr: 'سبيكة ذهب معتمدة 24 عيار',
        karat: 24,
        weight: 2,
        purity: '999.9',
        categoryId: category24K.id,
        productType: 'bar',
        certificate: 'LBMA Certified',
        manufacturer: 'Valcambi',
        featured: true,
        images: JSON.stringify(['/images/24k-bars-collection.jpg'])
      },
      {
        name: '4 Gram Gold Bar',
        nameAr: 'سبيكة ذهب 4 جرام',
        description: 'Certified 24K gold bar',
        descriptionAr: 'سبيكة ذهب معتمدة 24 عيار',
        karat: 24,
        weight: 4,
        purity: '999.9',
        categoryId: category24K.id,
        productType: 'bar',
        certificate: 'LBMA Certified',
        manufacturer: 'Metalor',
        images: JSON.stringify(['/images/btc-gold-bars.jpg'])
      },
      {
        name: '8 Gram Gold Bar',
        nameAr: 'سبيكة ذهب 8 جرام',
        description: 'Certified 24K gold bar',
        descriptionAr: 'سبيكة ذهب معتمدة 24 عيار',
        karat: 24,
        weight: 8,
        purity: '999.9',
        categoryId: category24K.id,
        productType: 'bar',
        certificate: 'LBMA Certified',
        manufacturer: 'Valcambi',
        featured: true,
        images: JSON.stringify(['/images/24k-bars-collection.jpg'])
      },
      {
        name: '16 Gram Gold Bar',
        nameAr: 'سبيكة ذهب 16 جرام',
        description: 'Certified 24K gold bar',
        descriptionAr: 'سبيكة ذهب معتمدة 24 عيار',
        karat: 24,
        weight: 16,
        purity: '999.9',
        categoryId: category24K.id,
        productType: 'bar',
        certificate: 'LBMA Certified',
        manufacturer: 'PAMP Suisse',
        featured: true,
        images: JSON.stringify(['/images/btc-gold-bars.jpg'])
      },
      {
        name: '32 Gram Gold Bar',
        nameAr: 'سبيكة ذهب 32 جرام',
        description: 'Certified 24K gold bar',
        descriptionAr: 'سبيكة ذهب معتمدة 24 عيار',
        karat: 24,
        weight: 32,
        purity: '999.9',
        categoryId: category24K.id,
        productType: 'bar',
        certificate: 'LBMA Certified',
        manufacturer: 'Metalor',
        featured: true,
        images: JSON.stringify(['/images/24k-bars-collection.jpg'])
      },
      {
        name: '64 Gram Gold Bar',
        nameAr: 'سبيكة ذهب 64 جرام',
        description: 'Certified 24K gold bar',
        descriptionAr: 'سبيكة ذهب معتمدة 24 عيار',
        karat: 24,
        weight: 64,
        purity: '999.9',
        categoryId: category24K.id,
        productType: 'bar',
        certificate: 'LBMA Certified',
        manufacturer: 'Valcambi',
        featured: true,
        images: JSON.stringify(['/images/btc-gold-bars.jpg'])
      },
      {
        name: '100 Gram Gold Bar',
        nameAr: 'سبيكة ذهب 100 جرام',
        description: 'Certified 24K gold bar',
        descriptionAr: 'سبيكة ذهب معتمدة 24 عيار',
        karat: 24,
        weight: 100,
        purity: '999.9',
        categoryId: category24K.id,
        productType: 'bar',
        certificate: 'LBMA Certified',
        manufacturer: 'PAMP Suisse',
        featured: true,
        images: JSON.stringify(['/images/24k-bar-1g.jpg'])
      }
    ];

  // Create products one by one (SQLite doesn't support createMany)
  for (const productData of productsData) {
    await prisma.product.create({
      data: productData
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });