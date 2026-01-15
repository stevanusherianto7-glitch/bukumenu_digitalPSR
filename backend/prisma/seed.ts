import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed Categories
  const categories = [
    'Terlaris',
    'Menu Baru',
    'Makanan',
    'Minuman',
    'Snack',
    'Oleh-oleh'
  ];

  for (const catName of categories) {
    await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: {
        name: catName,
        order: categories.indexOf(catName),
      },
    });
  }
  console.log('✅ Categories seeded');

  // Seed Menu Items (sample data)
  const menuItems = [
    {
      name: 'Es Teler',
      description: 'Minuman segar dengan isian alpukat, nangka, kelapa muda, dan sirup cocopandan. Juara pelepas dahaga.',
      price: 20000,
      imageUrl: 'https://res.cloudinary.com/dwdaydzsh/image/upload/v1768368394/Es_Teler_vyc2aq.jpg',
      category: 'Minuman',
      isFavorite: true,
      isNew: false,
      rating: 4.8,
      prepTime: 10,
      calories: 350,
    },
    {
      name: 'Tahu Gimbal Semarang',
      description: 'Tahu goreng renyah dengan gimbal udang, lontong, tauge, dan siraman bumbu kacang petis yang khas.',
      price: 28000,
      imageUrl: 'https://res.cloudinary.com/dwdaydzsh/image/upload/v1768287613/Tahu_Gimbal_Semarang_tjtpa0.webp',
      category: 'Makanan',
      isFavorite: true,
      isNew: false,
      rating: 4.7,
      prepTime: 20,
      calories: 480,
    },
    {
      name: 'Soto Pindang Kudus',
      description: 'Soto khas Kudus dengan kuah bening kaya rempah, suwiran daging sapi pindang, tauge, dan taburan bawang goreng.',
      price: 44454,
      imageUrl: 'https://res.cloudinary.com/dwdaydzsh/image/upload/v1768368455/Soto_Pindang_Kudus_orwjnb.jpg',
      category: 'Makanan',
      isFavorite: true,
      isNew: false,
      rating: 4.8,
      prepTime: 15,
      calories: 420,
    },
    {
      name: 'Soto Ayam Semarang',
      description: 'Soto ayam bening khas Semarang dengan suwiran ayam, soun, tauge, dan taburan koya gurih. Segar dan menghangatkan.',
      price: 20909,
      imageUrl: 'https://res.cloudinary.com/dwdaydzsh/image/upload/v1768287616/Soto_Ayam_Semarang_m4xtel.webp',
      category: 'Makanan',
      isFavorite: true,
      isNew: false,
      rating: 4.6,
      prepTime: 15,
      calories: 380,
    },
    {
      name: 'Rawon Semarang',
      description: 'Rawon khas Semarang dengan kuah hitam kaya rempah, daging sapi empuk, tauge, dan taburan bawang goreng.',
      price: 35000,
      imageUrl: 'https://res.cloudinary.com/dwdaydzsh/image/upload/v1768287617/Rawon_Semarang_vaxfch.webp',
      category: 'Makanan',
      isFavorite: false,
      isNew: true,
      rating: 4.9,
      prepTime: 25,
      calories: 450,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { name: item.name },
      update: item,
      create: item,
    });
  }
  console.log('✅ Menu items seeded');

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

