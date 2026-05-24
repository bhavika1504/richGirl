import { useState } from 'react';

interface FilterSidebarProps {
  activeFilters: string[];
  onClearAll: () => void;
  onRemoveFilter: (filter: string) => void;
}

export function FilterSidebar({ activeFilters, onClearAll, onRemoveFilter }: FilterSidebarProps) {
  const [selectedSizes, setSelectedSizes] = useState(['M']);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([499, 4999]);

  const categories = [
    { name: '3-Piece Suit', count: 12 },
    { name: 'Kurtis', count: 8, selected: true },
    { name: 'Short Kurta', count: 6 },
    { name: '2-Piece Kurti Set', count: 5 },
    { name: 'Co-ord Sets', count: 4 },
  ];

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
          {categories.map((cat) => (
            <label
              key={cat.name}
              className="flex items-center justify-between h-8 px-2 rounded cursor-pointer hover:bg-[var(--brand-alt-bg)]"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked={cat.selected}
                  className="w-4 h-4 rounded accent-[var(--brand-cta-green)]"
                />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--brand-dark-text)' }}>
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
              onClick={() => {
                setSelectedSizes(prev =>
                  prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                );
              }}
              className="px-3 py-1 rounded-md transition-all"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                backgroundColor: selectedSizes.includes(size) ? 'var(--brand-cta-green)' : 'var(--brand-white)',
                color: selectedSizes.includes(size) ? 'var(--brand-white)' : 'var(--brand-dark-text)',
                border: selectedSizes.includes(size) ? 'none' : '0.5px solid var(--brand-border)'
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
              onClick={() => {
                setSelectedColors(prev =>
                  prev.includes(color.name) ? prev.filter(c => c !== color.name) : [...prev, color.name]
                );
              }}
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
              {selectedColors.includes(color.name) && (
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
              onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
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
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
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
