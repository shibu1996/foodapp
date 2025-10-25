import Product from '../models/Product.js';
import { connectDatabase } from '../config/database.js';

const sampleProducts = [
  {
    name: 'Dal Makhani',
    description: 'Creamy black lentils cooked with butter and aromatic spices',
    category: 'Dal & Curry',
    price,
    originalPrice,
    subscriptionPrice,
    discount,
    rating.5,
    isVeg,
    isBestSeller,
    isPopular,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    tags: ['dal', 'curry', 'lentils', 'popular'],
    stock,
  },
  {
    name: 'Rajma Masala',
    description: 'Red kidney beans curry in rich tomato gravy',
    category: 'Dal & Curry',
    price,
    originalPrice,
    subscriptionPrice,
    discount,
    rating.3,
    isVeg,
    isBestSeller,
    isPopular,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    tags: ['rajma', 'kidney beans', 'curry'],
    stock,
  },
  {
    name: 'Chole Bhature',
    description: 'Spicy chickpeas served with fluffy fried bread',
    category: 'Snacks',
    price,
    originalPrice,
    subscriptionPrice,
    discount,
    rating.7,
    isVeg,
    isBestSeller,
    isPopular,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    tags: ['chole', 'bhature', 'snacks', 'breakfast'],
    stock,
  },
  {
    name: 'Paneer Tikka Masala',
    description: 'Cottage cheese in creamy tomato gravy with spices',
    category: 'Dal & Curry',
    price,
    originalPrice,
    subscriptionPrice,
    discount,
    rating.6,
    isVeg,
    isBestSeller,
    isPopular,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop',
    tags: ['paneer', 'tikka', 'curry', 'spicy'],
    stock,
  },
  {
    name: 'Special Veg Biryani',
    description: 'Aromatic basmati rice with mixed vegetables and spices',
    category: 'Rice Dishes',
    price,
    originalPrice,
    subscriptionPrice,
    discount,
    rating.8,
    isVeg,
    isBestSeller,
    isPopular,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
    tags: ['biryani', 'rice', 'special', 'aromatic'],
    stock,
  },
  {
    name: 'Full Thali',
    description: 'Complete meal Roti, Dal, Sabzi, Rice, Salad',
    category: 'Thalis',
    price,
    originalPrice,
    subscriptionPrice,
    discount,
    rating.9,
    isVeg,
    isBestSeller,
    isPopular,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop',
    tags: ['thali', 'complete meal', 'combo'],
    stock,
  },
  {
    name: 'Aloo Paratha (2 pcs)',
    description: 'Stuffed potato flatbread served with curd and pickle',
    category: 'Breads',
    price,
    originalPrice,
    subscriptionPrice,
    discount,
    rating.4,
    isVeg,
    isBestSeller,
    isPopular,
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop',
    tags: ['paratha', 'bread', 'breakfast'],
    stock,
  },
  {
    name: 'Butter Roti (5 pcs)',
    description: 'Soft whole wheat rotis brushed with butter',
    category: 'Breads',
    price,
    originalPrice,
    subscriptionPrice,
    discount,
    rating.2,
    isVeg,
    isBestSeller,
    isPopular,
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop',
    tags: ['roti', 'bread', 'butter'],
    stock,
  },
];

export const seedProducts = async () => {
  try {
    await connectDatabase();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('✓ Cleared existing products');
    
    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`✓ Inserted ${products.length} sample products`);
    
    console.log('\n📦 Sample Products:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - Rs. ${product.price} (${product.category})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error.message);
    process.exit(1);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedProducts();
}


