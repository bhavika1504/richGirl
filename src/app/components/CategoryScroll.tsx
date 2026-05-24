import { Link } from 'react-router';
import { useState, useEffect } from 'react';
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

  return (
    <section className="py-8 lg:py-10 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Scrollable container */}
        <div className="overflow-x-auto scrollbar-hide -mx-6 lg:-mx-12 px-6 lg:px-12">
          <div className="flex gap-4 min-w-max pb-2">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/shop/${category.name.toLowerCase().replace(/ /g, '-')}`}
                className="flex-shrink-0 transition-transform duration-200 hover:scale-105 block"
                style={{ width: '110px' }}
              >
                <div
                  className="rounded-full mb-3 overflow-hidden mx-auto"
                  style={{
                    width: '110px',
                    height: '110px',
                    backgroundColor: 'var(--brand-alt-bg)'
                  }}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p
                  className="text-center"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
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
    </section>
  );
}
