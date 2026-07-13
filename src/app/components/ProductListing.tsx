import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './Navbar';
import { PageHeader } from './listing/PageHeader';
import { FilterSidebar } from './listing/FilterSidebar';
import { ProductGrid } from './listing/ProductGrid';
import { FilterBottomSheet } from './listing/FilterBottomSheet';
import { SortBottomSheet } from './listing/SortBottomSheet';

export function ProductListing() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState('Newest First');

  // Filter states
  const [activeSizes, setActiveSizes] = useState<string[]>([]);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeSubCategories, setActiveSubCategories] = useState<string[]>([]);

  const [promptSizeForSubCat, setPromptSizeForSubCat] = useState<string | null>(null);

  const toggleSize = (size: string) => {
    setActiveSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleColor = (color: string) => {
    setActiveColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const toggleSubCategory = (subCat: string) => {
    setActiveSubCategories(prev => {
      const isAdding = !prev.includes(subCat);
      const nextSubCategories = isAdding ? [...prev, subCat] : prev.filter(s => s !== subCat);

      // If we are adding a subcategory in Western wear and no size is selected yet, prompt for size
      if (category === 'western' && isAdding && activeSizes.length === 0) {
        setPromptSizeForSubCat(subCat);
      }

      return nextSubCategories;
    });
  };

  const clearAllFilters = () => {
    setActiveSizes([]);
    setActiveColors([]);
    setActiveSubCategories([]);
    setPriceRange([0, 10000]);
    setActiveFilters([]);
  };

  const displayTitle = category ? category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ') : 'All Collections';

  const removeFilter = (filter: string) => {
    // Determine which state to update based on the filter string
    if (activeSizes.includes(filter)) toggleSize(filter);
    else if (activeColors.includes(filter)) toggleColor(filter);
    else if (activeSubCategories.includes(filter)) toggleSubCategory(filter);
  };

  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Navbar />

      <PageHeader
        breadcrumb={['Home', 'Shop', displayTitle]}
        title={displayTitle}
        productCount={24}
      />

      {/* Mobile Filter/Sort Bar */}
      <div className="lg:hidden sticky top-20 z-40 bg-white" style={{ borderBottom: '0.5px solid var(--brand-border)' }}>
        <div className="flex gap-2 p-2 px-4">
          <button
            onClick={() => setShowFilters(true)}
            className="flex-1 flex items-center justify-center gap-2 border h-9 rounded-lg"
            style={{
              borderColor: 'var(--brand-border)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--brand-dark-text)'
            }}
          >
            <span>⊞</span> Filter
          </button>
          <button
            onClick={() => setShowSort(true)}
            className="flex-1 flex items-center justify-center gap-2 border h-9 rounded-lg"
            style={{
              borderColor: 'var(--brand-border)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--brand-dark-text)'
            }}
          >
            <span>↕</span> Sort
          </button>
        </div>

        {/* Active Filters - Mobile */}
        {activeFilters.length > 0 && (
          <div className="overflow-x-auto scrollbar-hide px-4 py-2">
            <div className="flex gap-2 min-w-max">
              {activeFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => removeFilter(filter)}
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
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-20">
        <div className="flex gap-8 py-6 lg:py-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar
              category={category}
              activeFilters={activeFilters}
              activeSizes={activeSizes}
              activeColors={activeColors}
              activeSubCategories={activeSubCategories}
              priceRange={priceRange}
              onClearAll={clearAllFilters}
              onRemoveFilter={removeFilter}
              onToggleSize={toggleSize}
              onToggleColor={toggleColor}
              onToggleSubCategory={toggleSubCategory}
              onPriceChange={setPriceRange}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <ProductGrid
              category={category}
              activeFilters={activeFilters}
              activeSizes={activeSizes}
              activeColors={activeColors}
              activeSubCategories={activeSubCategories}
              priceRange={priceRange}
              onRemoveFilter={removeFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheets */}
      <FilterBottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        category={category}
        activeSizes={activeSizes}
        activeColors={activeColors}
        activeSubCategories={activeSubCategories}
        priceRange={priceRange}
        onClearAll={clearAllFilters}
        onToggleSize={toggleSize}
        onToggleColor={toggleColor}
        onToggleSubCategory={toggleSubCategory}
        onPriceChange={setPriceRange}
      />
      <SortBottomSheet
        isOpen={showSort}
        onClose={() => setShowSort(false)}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Western Size Prompt Modal */}
      <AnimatePresence>
        {promptSizeForSubCat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl text-center border border-gray-100 relative"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <button 
                onClick={() => setPromptSizeForSubCat(null)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ×
              </button>
              <h3 
                className="text-xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                Select Your Size
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Find the perfect fit for your new <span className="font-bold text-[var(--brand-dark-text)]">{promptSizeForSubCat}</span>. Select your size to filter items.
              </p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      toggleSize(size);
                      setPromptSizeForSubCat(null);
                    }}
                    className="h-12 rounded-xl border border-gray-200 hover:border-[var(--brand-cta-green)] hover:bg-[var(--brand-alt-bg)] transition-all font-bold text-sm text-gray-800 cursor-pointer"
                  >
                    {size}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setPromptSizeForSubCat(null)}
                className="text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Skip size filter
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
