import Category from '../models/Category';
import Product from '../models/Product';
import { connectDatabase } from '../config/database';

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const categories = [
  {
    name: 'Dal & Curry',
    slug: generateSlug('Dal & Curry'),
    description: 'Delicious lentils and curry dishes',
    icon: '🍛',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    displayOrder: 1,
  },
  {
    name: 'Rice Dishes',
    slug: generateSlug('Rice Dishes'),
    description: 'Aromatic rice and biryani',
    icon: '🍚',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
    displayOrder: 2,
  },
  {
    name: 'Breads',
    slug: generateSlug('Breads'),
    description: 'Freshly made rotis and parathas',
    icon: '🥖',
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop',
    displayOrder: 3,
  },
  {
    name: 'Thalis',
    slug: generateSlug('Thalis'),
    description: 'Complete meal combos',
    icon: '🍱',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop',
    displayOrder: 4,
  },
  {
    name: 'Snacks',
    slug: generateSlug('Snacks'),
    description: 'Quick bites and snacks',
    icon: '🍟',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
    displayOrder: 5,
  },
  {
    name: 'Beverages',
    slug: generateSlug('Beverages'),
    description: 'Refreshing drinks',
    icon: '🥤',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
    displayOrder: 6,
  },
];

export const seedCategories = async () => {
  try {
    await connectDatabase();
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('✓ Cleared existing categories');
    
    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✓ Inserted ${createdCategories.length} categories`);
    
    // Sync product counts
    console.log('\n📊 Syncing product counts...');
    for (const category of createdCategories) {
      const count = await Product.countDocuments({
        category: category.name,
        isActive: true,
      });
      category.productCount = count;
      await category.save();
    }
    
    console.log('\n📂 Categories:');
    const updatedCategories = await Category.find().sort({ displayOrder: 1 });
    updatedCategories.forEach((cat, index) => {
      console.log(
        `${index + 1}. ${cat.icon} ${cat.name} - ${cat.productCount} products (${cat.slug})`
      );
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('Error seeding categories:', error.message);
    process.exit(1);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedCategories();
}

