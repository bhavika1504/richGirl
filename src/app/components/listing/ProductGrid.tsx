import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface ProductGridProps {
  category?: string;
  activeFilters: string[];
  activeSizes: string[];
  activeColors: string[];
  activeSubCategories: string[];
  priceRange: [number, number];
  onRemoveFilter: (filter: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function ProductGrid({
  category,
  activeFilters,
  activeSizes,
  activeColors,
  activeSubCategories,
  priceRange,
  onRemoveFilter,
  sortBy,
  onSortChange
}: ProductGridProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const totalPages = 1;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let data;
        if (category === 'indian' || category === 'western') {
          // If it's a type (indian/western), pass as type param
          data = await api.getProducts(undefined, category);
        } else {
          // Otherwise pass as category slug
          data = await api.getProducts(category);
        }
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const filteredProducts = products.filter(product => {
    // 1. Size Filter
    if (activeSizes.length > 0) {
      const productSizes = product.sizes?.map((s: any) => s.size) || [];
      const hasSize = activeSizes.some(size => productSizes.includes(size));
      if (!hasSize) return false;
    }

    // 2. Color Filter (assuming color is in variants)
    if (activeColors.length > 0) {
      const productColors = product.sizes?.flatMap((s: any) => s.variants?.map((v: any) => v.color)) || [];
      const hasColor = activeColors.some(color => productColors.includes(color));
      if (!hasColor) return false;
    }

    // 3. Price Filter (Net Price after discount)
    const netPrice = product.price * (1 - (product.discount || 0) / 100);
    if (netPrice < priceRange[0] || netPrice > priceRange[1]) {
      return false;
    }

    // 4. Sub-category (Tag) Filter (with mapping for Western categories: Tops, Bottoms, Cordsets)
    if (activeSubCategories.length > 0) {
      const hasSubCat = activeSubCategories.some(subCat => {
        const catName = (product.categoryName || '').toLowerCase();
        if (category === 'western') {
          if (subCat === 'Tops') {
            return ['tops', 'shirts', 't-shirts', 'tunics'].includes(catName) || /top|shirt|tunic/i.test(catName);
          }
          if (subCat === 'Bottoms') {
            return ['jeans', 'skirts', 'shorts', 'pants', 'trousers'].includes(catName) || /jean|skirt|short|pants|trouser|bottom/i.test(catName);
          }
          if (subCat === 'Cordsets') {
            return ['cord-sets-western', 'cord sets-western', 'cordsets'].includes(catName) || /cord/i.test(catName);
          }
        }
        if (category === 'indian') {
          if (subCat === '3-Piece Suits') {
            return ['3-piece-suits', 'suits', '3 piece suits'].includes(catName) || /suit|3-piece/i.test(catName);
          }
          if (subCat === 'Cord sets') {
            return ['cord-sets', 'cord sets', 'cordsets'].includes(catName) || /cord/i.test(catName);
          }
          if (subCat === 'Tunics') {
            return ['tunics', 'tunic'].includes(catName) || /tunic/i.test(catName);
          }
          if (subCat === 'Kurtis') {
            return ['kurtis', 'kurti'].includes(catName) || /kurti/i.test(catName);
          }
        }
        
        // Fallback:
        const productTags = product.tags || [product.categoryName || ''];
        return productTags.includes(subCat);
      });
      if (!hasSubCat) return false;
    }

    return true;
  }).sort((a, b) => {
    // 4. Sorting
    const priceA = a.price * (1 - (a.discount || 0) / 100);
    const priceB = b.price * (1 - (b.discount || 0) / 100);

    if (sortBy === 'Price: Low to High') return priceA - priceB;
    if (sortBy === 'Price: High to Low') return priceB - priceA;
    if (sortBy === 'Newest First') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    return 0;
  });

  const sortOptions = ['Newest First', 'Price: Low to High', 'Price: High to Low', 'Popularity'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 text-[var(--brand-cta-green)] animate-spin" />
        <p className="text-gray-400 font-medium" style={{ fontFamily: 'var(--font-body)' }}>Loading products...</p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <div className="w-20 h-20 bg-[var(--brand-alt-bg)] rounded-full flex items-center justify-center mb-6">
          <ChevronRight className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-headline)' }}>No products found</h3>
        <p className="text-gray-500 max-w-xs mx-auto" style={{ fontFamily: 'var(--font-body)' }}>
          We couldn't find any products in the "{category}" category. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Bar - Desktop Only */}
      <div className="hidden lg:flex items-center justify-between mb-6">
        {/* Active Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {[...activeFilters, ...activeSubCategories].map((filter) => (
            <button
              key={filter}
              onClick={() => onRemoveFilter(filter)}
              className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--brand-mist-green)',
                border: '0.5px solid #C8E8C0',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--brand-dark-text)'
              }}
            >
              {filter} <span>×</span>
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border"
            style={{
              borderColor: 'var(--brand-border)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--brand-dark-text)'
            }}
          >
            Sort by: {sortBy} <span>▾</span>
          </button>

          {showSortDropdown && (
            <div
              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-10"
              style={{ border: '0.5px solid var(--brand-border)' }}
            >
              {sortOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onSortChange(option);
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-[var(--brand-alt-bg)]"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: sortBy === option ? 'var(--brand-cta-green)' : 'var(--brand-dark-text)',
                    fontWeight: sortBy === option ? '500' : '400'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
        {filteredProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 disabled:opacity-40"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--brand-dark-text)'
          }}
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              backgroundColor: currentPage === i + 1 ? 'var(--brand-cta-green)' : 'var(--brand-white)',
              color: currentPage === i + 1 ? 'var(--brand-white)' : 'var(--brand-dark-text)',
              border: currentPage === i + 1 ? 'none' : '0.5px solid var(--brand-border)'
            }}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 disabled:opacity-40"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--brand-dark-text)'
          }}
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
