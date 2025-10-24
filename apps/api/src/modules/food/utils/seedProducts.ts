import Product from '../models/Product';
import { connectDatabase } from '../config/database';

const sampleProducts = [
  {
    name: 'Dal Makhani',
    description: 'Creamy black lentils cooked with butter and aromatic spices',
    category: 'Dal & Curry',
    price: 85,
    originalPrice: 100,
    subscriptionPrice: 72,
    discount: 15,
    rating: 4.5,
    isVeg: true,
    isBestSeller: true,
    isPopular: false,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    tags: ['dal', 'curry', 'lentils', 'popular'],
    stock: 100,
  },
  {
    name: 'Rajma Masala',
    description: 'Red kidney beans curry in rich tomato gravy',
    category: 'Dal & Curry',
    price: 75,
    originalPrice: 90,
    subscriptionPrice: 63,
    discount: 17,
    rating: 4.3,
    isVeg: true,
    isBestSeller: false,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    tags: ['rajma', 'kidney beans', 'curry'],
    stock: 100,
  },
  {
    name: 'Chole Bhature',
    description: 'Spicy chickpeas served with fluffy fried bread',
    category: 'Snacks',
    price: 95,
    originalPrice: 110,
    subscriptionPrice: 80,
    discount: 14,
    rating: 4.7,
    isVeg: true,
    isBestSeller: true,
    isPopular: false,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    tags: ['chole', 'bhature', 'snacks', 'breakfast'],
    stock: 100,
  },
  {
    name: 'Paneer Tikka Masala',
    description: 'Cottage cheese in creamy tomato gravy with spices',
    category: 'Dal & Curry',
    price: 125,
    originalPrice: 150,
    subscriptionPrice: 105,
    discount: 17,
    rating: 4.6,
    isVeg: true,
    isBestSeller: false,
    isPopular: false,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop',
    tags: ['paneer', 'tikka', 'curry', 'spicy'],
    stock: 100,
  },
  {
    name: 'Special Veg Biryani',
    description: 'Aromatic basmati rice with mixed vegetables and spices',
    category: 'Rice Dishes',
    price: 140,
    originalPrice: 170,
    subscriptionPrice: 120,
    discount: 18,
    rating: 4.8,
    isVeg: true,
    isBestSeller: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
    tags: ['biryani', 'rice', 'special', 'aromatic'],
    stock: 100,
  },
  {
    name: 'Full Thali',
    description: 'Complete meal: 2 Roti, Dal, Sabzi, Rice, Salad',
    category: 'Thalis',
    price: 165,
    originalPrice: 200,
    subscriptionPrice: 135,
    discount: 18,
    rating: 4.9,
    isVeg: true,
    isBestSeller: true,
    isPopular: false,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop',
    tags: ['thali', 'complete meal', 'combo'],
    stock: 100,
  },
  {
    name: 'Aloo Paratha (2 pcs)',
    description: 'Stuffed potato flatbread served with curd and pickle',
    category: 'Breads',
    price: 55,
    originalPrice: 70,
    subscriptionPrice: 45,
    discount: 21,
    rating: 4.4,
    isVeg: true,
    isBestSeller: false,
    isPopular: false,
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop',
    tags: ['paratha', 'bread', 'breakfast'],
    stock: 100,
  },
  {
    name: 'Butter Roti (5 pcs)',
    description: 'Soft whole wheat rotis brushed with butter',
    category: 'Breads',
    price: 35,
    originalPrice: 45,
    subscriptionPrice: 30,
    discount: 22,
    rating: 4.2,
    isVeg: true,
    isBestSeller: false,
    isPopular: false,
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop',
    tags: ['roti', 'bread', 'butter'],
    stock: 100,
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
  } catch (error: any) {
    console.error('Error seeding products:', error.message);
    process.exit(1);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedProducts();
}


