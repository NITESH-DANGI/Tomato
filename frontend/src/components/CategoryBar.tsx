import React from 'react';

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface CategoryBarProps {
    categories: Category[];
    activeCategory: string;
    onCategoryChange: (id: string) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({
    categories,
    activeCategory,
    onCategoryChange,
}) => {
    return (
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 border text-sm font-semibold ${activeCategory === category.id
                        ? 'bg-tomato-red/15 border-tomato-red/30 text-tomato-red shadow-lg shadow-tomato-red/5'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/8 hover:text-white/70'
                        }`}
                >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                </button>
            ))}
        </div>
    );
};

export default CategoryBar;
