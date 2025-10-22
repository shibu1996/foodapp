'use client';

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ categories, selectedCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition ${
            selectedCategory === category
              ? 'bg-primary text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

