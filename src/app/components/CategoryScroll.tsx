import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { api } from '../services/api';

export function CategoryScroll() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    fetchCategories();
  }, []);

  const indianKeywords = [
    'kurta', 'saree', 'anarkali', 'sharara', 'indian', 'salwar', 'lehenga',
    '2-piece', '2 piece', '3-piece', '3 piece', 'cord set', 'tunic'
  ];

  const indianCategories = categories.filter(cat =>
    indianKeywords.some(key => cat.name.toLowerCase().includes(key))
  );

  const westernCategories = categories.filter(cat =>
    !indianKeywords.some(key => cat.name.toLowerCase().includes(key))
  );

  const CategoryRow = ({ title, items }: { title: string, items: any[] }) => (
    <div className="mb-6 lg:mb-8 last:mb-0">
      <div className="flex items-center justify-between mb-3 lg:mb-4 px-1 lg:px-0">
        <h3
          className="text-sm lg:text-lg font-bold text-[var(--brand-dark-text)] uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-palatino)' }}
        >
          {title}
        </h3>
        {/* Swipe hint on mobile only */}
        <span className="flex items-center gap-0.5 text-[10px] text-gray-400 font-medium lg:hidden">
          Swipe <ChevronRight className="w-3 h-3" />
        </span>
      </div>
      <div
        className="overflow-x-auto scrollbar-hide -mx-4 lg:-mx-12 px-4 lg:px-12 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex gap-3 lg:gap-4 min-w-max pb-2">
          {items.map((category, index) => (
            <Link
              key={index}
              to={`/shop/${category.name.toLowerCase().replace(/ /g, '-')}`}
              className="flex-shrink-0 snap-start transition-transform duration-200 hover:scale-105 block w-[85px] lg:w-[110px]"
            >
              <div
                className="rounded-full mb-2 lg:mb-3 overflow-hidden mx-auto border border-[var(--brand-border)] w-[80px] h-[80px] lg:w-[110px] lg:h-[110px]"
                style={{ backgroundColor: 'var(--brand-alt-bg)' }}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p
                className="text-center font-medium leading-tight text-[11px] lg:text-[13px]"
                style={{
                  fontFamily: 'var(--font-palatino)',
                  color: 'var(--brand-dark-text)'
                }}
              >
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-5 lg:py-10 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-12">
        {indianCategories.length > 0 && (
          <CategoryRow title="Indian Wear" items={indianCategories} />
        )}
        {westernCategories.length > 0 && (
          <CategoryRow title="Western Wear" items={westernCategories} />
        )}
      </div>
    </section>
  );
}
