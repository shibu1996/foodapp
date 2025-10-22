// Unsplash image URLs for food items
export const FOOD_IMAGES: Record<string, string> = {
  'dal-makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
  'rajma': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
  'chole': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
  'paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop',
  'thali': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop',
  'biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
  'paratha': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop',
  'roti': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop',
  'default': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
};

export const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop',
    title: 'Fresh Homemade Food Delivered',
    subtitle: 'Order your favorite meals daily',
  },
  {
    url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=1200&h=400&fit=crop',
    title: 'Subscribe & Save up to 15%',
    subtitle: 'Daily meals at discounted prices',
  },
  {
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&h=400&fit=crop',
    title: 'Try Our Special Thali Today',
    subtitle: 'Complete meal with multiple items',
  },
];

export const getFoodImage = (category: string): string => {
  const key = category.toLowerCase().replace(/\s+/g, '-');
  return FOOD_IMAGES[key] || FOOD_IMAGES.default;
};

