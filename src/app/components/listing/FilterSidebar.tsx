import { useState } from 'react';

interface FilterSidebarProps {
  category?: string;
  activeFilters: string[];
  activeSizes: string[];
  activeColors: string[];
  activeSubCategories: string[];
  priceRange: [number, number];
  onClearAll: () => void;
  onRemoveFilter: (filter: string) => void;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: string) => void;
  onToggleSubCategory: (subCat: string) => void;
  onPriceChange: (range: [number, number]) => void;
}

export function FilterSidebar({
  category,
  activeFilters,
  activeSizes,
  activeColors,
  activeSubCategories,
  priceRange,
  onClearAll,
  onRemoveFilter,
  onToggleSize,
  onToggleColor,
  onToggleSubCategory,
  onPriceChange
}: FilterSidebarProps) {

  const indianSubCategories = [
    { name: 'Saree', count: 12 },
    { name: 'Kurta', count: 8 },
    { name: 'Salwar Kameez', count: 6 },
    { name: 'Lehengas', count: 5 },
    { name: 'Palazzos', count: 4 },
    { name: 'Dupatta', count: 3 },
  ];

  const westernSubCategories = [
    { name: 'Dresses', count: 15 },
    { name: 'Tops', count: 10 },
    { name: 'Skirts', count: 8 },
    { name: 'Jeans', count: 7 },
    { name: 'Jackets', count: 5 },
    { name: 'Trousers', count: 4 },
  ];

  const currentSubCategories = category === 'western' ? westernSubCategories : indianSubCategories;

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Pink', hex: '#FFB6C1' },
    { name: 'Yellow', hex: '#FFD700' },
    { name: 'Green', hex: '#5BBF4E' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Red', hex: '#DC143C' },
    { name: 'Blue', hex: '#4169E1' },
  ];

  return (
    <div
      className="w-60 sticky bg-white"
      style={{
        top: '88px',
        borderRight: '0.5px solid var(--brand-border)',
        paddingRight: '20px'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '500', color: 'var(--brand-dark-text)' }}>
          Filters
        </h3>
        <button
          onClick={onClearAll}
          style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--brand-cta-green)' }}
        >
          Clear All
        </button>
      </div>

      {/* Category */}
      <div className="mb-6 pb-6" style={{ borderBottom: '0.5px solid var(--brand-border)' }}>
        <h4
          className="mb-3 uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--brand-secondary-text)' }}
        >
          Category
        </h4>
        <div className="space-y-1">
          {currentSubCategories.map((cat) => (
            <label
              key={cat.name}
              className="flex items-center justify-between h-8 px-2 rounded cursor-pointer hover:bg-[var(--brand-alt-bg)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={activeSubCategories.includes(cat.name)}
                  onChange={() => onToggleSubCategory(cat.name)}
                  className="w-4 h-4 rounded accent-[var(--brand-cta-green)]"
                />
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: activeSubCategories.includes(cat.name) ? 'var(--brand-cta-green)' : 'var(--brand-dark-text)',
                    fontWeight: activeSubCategories.includes(cat.name) ? '600' : '400'
                  }}
                >
                  {cat.name}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--brand-secondary-text)' }}>
                ({cat.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mb-6 pb-6" style={{ borderBottom: '0.5px solid var(--brand-border)' }}>
        <h4
          className="mb-3 uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--brand-secondary-text)' }}
        >
          Size
        </h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onToggleSize(size)}
              className="px-3 py-1 rounded-md transition-all"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                backgroundColor: activeSizes.includes(size) ? 'var(--brand-cta-green)' : 'var(--brand-white)',
                color: activeSizes.includes(size) ? 'var(--brand-white)' : 'var(--brand-dark-text)',
                border: activeSizes.includes(size) ? 'none' : '0.5px solid var(--brand-border)'
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="mb-6 pb-6" style={{ borderBottom: '0.5px solid var(--brand-border)' }}>
        <h4
          className="mb-3 uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--brand-secondary-text)' }}>
          Color
        </h4>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => onToggleColor(color.name)}
              className="relative"
              style={{ width: '24px', height: '24px' }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  backgroundColor: color.hex,
                  border: color.hex === '#FFFFFF' ? '0.5px solid var(--brand-border)' : 'none'
                }}
              />
              {activeColors.includes(color.name) && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '2px solid var(--brand-cta-green)',
                    margin: '-4px'
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6 pb-6" style={{ borderBottom: '0.5px solid var(--brand-border)' }}>
        <h4
          className="mb-3 uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--brand-secondary-text)' }}
        >
          Price Range
        </h4>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => onPriceChange([parseInt(e.target.value) || 0, priceRange[1]])}
              className="w-full px-2 py-1 border rounded"
              style={{
                borderColor: 'var(--brand-border)',
                fontFamily: 'var(--font-price)',
                fontSize: '12px'
              }}
              placeholder="Min ₹"
            />
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => onPriceChange([priceRange[0], parseInt(e.target.value) || 0])}
              className="w-full px-2 py-1 border rounded"
              style={{
                borderColor: 'var(--brand-border)',
                fontFamily: 'var(--font-price)',
                fontSize: '12px'
              }}
              placeholder="Max ₹"
            />
          </div>
          <p style={{ fontFamily: 'var(--font-price)', fontSize: '12px', color: 'var(--brand-dark-text)' }}>
            ₹{priceRange[0].toLocaleString()} — ₹{priceRange[1].toLocaleString()}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6 pb-6" style={{ borderBottom: '0.5px solid var(--brand-border)' }}>
        <h4
          className="mb-3 uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--brand-secondary-text)' }}
        >
          Rating
        </h4>
        <div className="space-y-1">
          {[5, 4, 3, 2].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 h-8 px-2 rounded cursor-pointer hover:bg-[var(--brand-alt-bg)]"
            >
              <input type="radio" name="rating" className="accent-[var(--brand-cta-green)]" />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '14px',
                      color: i < rating ? 'var(--brand-cta-green)' : 'var(--brand-border)'
                    }}
                  >
                    ★
                  </span>
                ))}
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--brand-dark-text)', marginLeft: '4px' }}>
                  & above
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <h4
          className="mb-3 uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--brand-secondary-text)' }}
        >
          Availability
        </h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="availability" defaultChecked className="accent-[var(--brand-cta-green)]" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--brand-dark-text)' }}>
              In Stock only
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="availability" className="accent-[var(--brand-cta-green)]" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--brand-dark-text)' }}>
              Include Out of Stock
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
