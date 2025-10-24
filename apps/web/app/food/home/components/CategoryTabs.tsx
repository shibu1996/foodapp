'use client';

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ categories, selectedCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex gap-2 p-1.5 rounded-2xl overflow-x-auto scrollbar-hide"
        style={{ 
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB'
        }}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className="px-4 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300"
              style={{
                backgroundColor: isSelected ? '#E11D48' : 'transparent',
                color: isSelected ? '#FFFFFF' : '#374151',
                boxShadow: isSelected ? '0 4px 12px rgba(225,29,72,0.3)' : 'none',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#FEF2F2';
                  e.currentTarget.style.color = '#E11D48';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#374151';
                }
              }}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}


