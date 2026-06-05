import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
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

  const toggleSize = (size: string) => {
    setActiveSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleColor = (color: string) => {
    setActiveColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const toggleSubCategory = (subCat: string) => {
    setActiveSubCategories(prev => prev.includes(subCat) ? prev.filter(s => s !== subCat) : [...prev, subCat]);
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
    </div>
  );
}
