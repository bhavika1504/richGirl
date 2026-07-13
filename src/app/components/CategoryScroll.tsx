import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, MoveRight } from 'lucide-react';
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

  const indianCategories = categories.filter(cat => cat.type === 'indian');
  const westernCategories = categories.filter(cat => cat.type === 'western');

  const CategoryRow = ({ title, subtitle, items }: { title: string, subtitle: string, items: any[] }) => (
    <div className="mb-12 lg:mb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-2 mb-6 lg:mb-8 px-2 lg:px-0 border-b border-[#e5e5e5]/60 pb-3">
        <div>
          <h3
            className="text-xl lg:text-2xl font-extrabold text-[#2c4c3b] uppercase tracking-widest flex items-center gap-2 mb-1"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            {title} <Sparkles className="w-5 h-5 text-[#a4b49d]" />
          </h3>
          <p className="text-gray-500 text-[13px] font-medium" style={{ fontFamily: 'var(--font-body)' }}>
            {subtitle}
          </p>
        </div>
        <Link
          to="/shop"
          className="hidden lg:flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#2c4c3b] hover:text-[#4a725b] transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          View All <MoveRight className="w-4 h-4" />
        </Link>
      </div>

      <div
        className="overflow-x-auto scrollbar-hide -mx-4 lg:-mx-0 px-4 lg:px-0 snap-x snap-mandatory pb-6"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex gap-4 lg:gap-6 min-w-max">
          {items.map((category, index) => (
            <Link
              key={index}
              to={`/shop/${category.name.toLowerCase().replace(/ /g, '-')}`}
              className="flex-shrink-0 snap-start group block w-[160px] lg:w-[240px]"
            >
              <div className="relative mb-6">
                {/* Arch Image */}
                <div
                  className="overflow-hidden bg-[#f5f5f5] transition-transform duration-300 relative border border-[#e8e4db]"
                  style={{
                    aspectRatio: '3/4',
                    borderRadius: '150px 150px 12px 12px'
                  }}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#2c4c3b]/0 group-hover:bg-[#2c4c3b]/10 transition-colors duration-300 pointer-events-none" />
                </div>
                
                {/* Side Badge */}
                <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-8 h-8 bg-[#fdfcfb] rounded-full border border-[#e8e4db] flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110">
                   <Sparkles className="w-3.5 h-3.5 text-[#a4b49d]" />
                </div>

                {/* Bottom Title Pill */}
                <div className="absolute -bottom-4 left-4 right-4 bg-[#fdfcfb] border border-[#e8e4db] rounded-full px-4 py-2.5 flex items-center justify-between shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1 z-20">
                  <span
                    className="text-[11px] lg:text-xs font-bold text-[#2c4c3b] truncate"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {category.name}
                  </span>
                  <div className="w-5 h-5 rounded-full border border-[#d0d8cc] flex items-center justify-center bg-white group-hover:bg-[#2c4c3b] group-hover:border-[#2c4c3b] transition-colors shrink-0">
                    <ArrowRight className="w-3 h-3 text-[#2c4c3b] group-hover:text-white" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-2 text-center lg:hidden">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#2c4c3b] border-b border-[#2c4c3b] pb-0.5"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          View All <MoveRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );

  return (
    <section className="py-14 lg:py-20 bg-[#fdfcfb] border-b border-[#e5e5e5]/50 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute -left-20 top-40 w-64 h-64 bg-[#f4f2eb] rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute -right-20 bottom-40 w-80 h-80 bg-[#f4f2eb] rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-12 relative z-10">
        {/* Main Header */}
        <div className="text-center mb-12 lg:mb-20">
          <div className="flex items-center justify-center gap-3 mb-3">
             <Sparkles className="w-3 h-3 text-[#c2b48d]" />
             <p className="text-[#a4b49d] italic text-sm lg:text-lg" style={{ fontFamily: 'serif' }}>
               Shop By Category
             </p>
             <Sparkles className="w-3 h-3 text-[#c2b48d]" />
          </div>
          <h2
            className="text-2xl lg:text-[40px] font-medium text-[#2c4c3b] uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            EXPLORE OUR COLLECTIONS
          </h2>
          <div className="flex justify-center mt-6">
             <div className="w-2 h-2 rotate-45 bg-[#c2b48d]"></div>
          </div>
        </div>

        {indianCategories.length > 0 && (
          <CategoryRow
            title="Indian Wear"
            subtitle="Timeless tradition. Modern elegance."
            items={indianCategories}
          />
        )}
        {westernCategories.length > 0 && (
          <CategoryRow
            title="Western Wear"
            subtitle="Chic styles. Effortless you."
            items={westernCategories}
          />
        )}
      </div>
    </section>
  );
}
